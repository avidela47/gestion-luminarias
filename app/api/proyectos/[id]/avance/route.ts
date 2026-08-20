import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/mongoose'
import Proyecto from '@/models/Proyecto'
import ProyectoAvance from '@/models/ProyectoAvance'
import Receta from '@/models/Receta'
import Componente from '@/models/Componente'
import Movimiento from '@/models/Movimiento'
import ProductoTerminado from '@/models/ProductoTerminado'
import Produccion from '@/models/Produccion'
import { auth } from '@/auth'
import { registrarAuditoria } from '@/lib/auditoria'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ ok: false, error: 'No autorizado' }, { status: 401 })

    await connectDB()
    const { id } = await params
    const { operario, item_id, cantidad } = await req.json()

    if (!operario) return NextResponse.json({ ok: false, error: 'Elegí quién fabricó' }, { status: 400 })
    if (!item_id || !Number.isInteger(cantidad) || cantidad <= 0) {
      return NextResponse.json({ ok: false, error: 'Cantidad inválida' }, { status: 400 })
    }

    const proyecto = await Proyecto.findById(id)
    if (!proyecto) return NextResponse.json({ ok: false, error: 'Proyecto no encontrado' }, { status: 404 })
    if (proyecto.estado === 'NUEVO') {
      return NextResponse.json({ ok: false, error: 'El proyecto todavía no fue tomado' }, { status: 409 })
    }
    if (proyecto.estado === 'LISTO') {
      return NextResponse.json({ ok: false, error: 'El proyecto ya está finalizado' }, { status: 409 })
    }

    const item = proyecto.items.find((i: { id: string }) => i.id === item_id)
    if (!item) return NextResponse.json({ ok: false, error: 'Modelo no encontrado en este proyecto' }, { status: 404 })

    const pendiente = item.cantidad_solicitada - item.cantidad_completada
    if (cantidad > pendiente) {
      return NextResponse.json({ ok: false, error: `Solo quedan ${pendiente} unidades pendientes de este modelo` }, { status: 409 })
    }

    const codigoUpper = item.modelo.toUpperCase()
    const receta = await Receta.findOne({ codigo: codigoUpper, activa: true })
    if (!receta) {
      return NextResponse.json({ ok: false, error: `No se encontró receta activa para ${codigoUpper}` }, { status: 404 })
    }

    const faltantes: string[] = []
    for (const c of receta.componentes) {
      const componente = await Componente.findOne({ id_componente: c.id_componente, activo: true })
      if (!componente) { faltantes.push(`${c.id_componente} (no existe)`); continue }
      const necesario = c.cantidad * cantidad
      if (componente.stock_actual < necesario) {
        faltantes.push(`${c.id_componente} — necesitás ${necesario}, tenés ${componente.stock_actual}`)
      }
    }
    if (faltantes.length > 0) {
      return NextResponse.json({ ok: false, error: 'Stock de componentes insuficiente', faltantes }, { status: 400 })
    }

    const nombreProducto = (receta.nombre ?? '').trim() !== '' ? receta.nombre : codigoUpper
    const existe = await ProductoTerminado.findOne({ codigo_luminaria: codigoUpper })
    if (existe) {
      await ProductoTerminado.findOneAndUpdate(
        { codigo_luminaria: codigoUpper },
        { $inc: { stock_actual: cantidad }, $set: { activo: true } }
      )
    } else {
      await ProductoTerminado.create({
        codigo_luminaria: codigoUpper,
        nombre: nombreProducto,
        stock_actual: cantidad,
        stock_minimo: 0,
        precio_venta: 0,
        notas: '',
        foto: '',
        activo: true,
      })
    }

    const componentesDescontados = []
    const fecha = new Date()
    const idProd = `PROD-${fecha.getFullYear()}-${Date.now()}`

    for (const c of receta.componentes) {
      const cantidadDescontar = c.cantidad * cantidad
      const componente = await Componente.findOneAndUpdate(
        { id_componente: c.id_componente },
        { $inc: { stock_actual: -cantidadDescontar } },
        { new: true }
      )
      componentesDescontados.push({ id_componente: c.id_componente, cantidad: cantidadDescontar })
      await Movimiento.create({
        id_movimiento: `MOV-${fecha.getFullYear()}-${Date.now()}-${c.id_componente}`,
        tipo: 'salida_produccion',
        id_componente: c.id_componente,
        cantidad: -cantidadDescontar,
        stock_resultante: componente!.stock_actual,
        referencia: idProd,
        notas: `Proyecto ${proyecto.numero} — ${codigoUpper} x${cantidad}`,
        usuario: operario,
      })
    }

    await Produccion.create({
      id_produccion: idProd,
      codigo_luminaria: codigoUpper,
      version_receta: receta.version,
      cantidad,
      operario,
      notas: `Proyecto ${proyecto.numero}`,
      componentes_descontados: componentesDescontados,
    })

    item.cantidad_completada += cantidad
    proyecto.estado = proyecto.estado === 'PREPARACION' ? 'FABRICACION' : proyecto.estado
    await proyecto.save()

    const totalSolicitado = proyecto.items.reduce((a: number, i: { cantidad_solicitada: number }) => a + i.cantidad_solicitada, 0)
    const totalCompletado = proyecto.items.reduce((a: number, i: { cantidad_completada: number }) => a + i.cantidad_completada, 0)

    await ProyectoAvance.create({
      id_proyecto: id,
      numero_proyecto: proyecto.numero,
      item_id,
      modelo: item.modelo,
      cantidad,
      realizado_por: operario,
    })

    await registrarAuditoria({
      req, accion: 'crear', modulo: 'Proyectos',
      detalle: `${operario} fabricó ${cantidad} de ${item.modelo} en ${proyecto.numero} — componentes descontados`,
      dato_id: id,
    })

    return NextResponse.json({
      ok: true,
      data: {
        proyecto: { id, estado: proyecto.estado, completado: totalCompletado, solicitado: totalSolicitado },
        item: { id: item.id, modelo: item.modelo, solicitado: item.cantidad_solicitada, completado: item.cantidad_completada },
      },
    })
  } catch (e) {
    console.error('[proyecto avance]', e)
    return NextResponse.json({ ok: false, error: 'Error al cargar avance' }, { status: 500 })
  }
}
