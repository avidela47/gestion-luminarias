import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/mongoose'
import Produccion from '@/models/Produccion'
import Receta from '@/models/Receta'
import Componente from '@/models/Componente'
import Movimiento from '@/models/Movimiento'
import ProductoTerminado from '@/models/ProductoTerminado'
import { registrarAuditoria } from '@/lib/auditoria'

export async function GET() {
  try {
    await connectDB()
    const producciones = await Produccion.find().sort({ createdAt: -1 })
    return NextResponse.json({ ok: true, data: producciones })
  } catch {
    return NextResponse.json({ ok: false, error: 'Error al obtener producciones' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const body = await req.json()
    const { codigo_luminaria, cantidad, operario, notas } = body

    if (!codigo_luminaria || !cantidad || cantidad < 1) {
      return NextResponse.json({ ok: false, error: 'Datos incompletos' }, { status: 400 })
    }

    const codigoUpper = codigo_luminaria.toUpperCase()

    const receta = await Receta.findOne({ codigo: codigoUpper, activa: true })
    if (!receta) return NextResponse.json({ ok: false, error: 'Receta no encontrada o inactiva' }, { status: 404 })

    // 1. Validar stock de componentes
    const faltantes: string[] = []
    for (const item of receta.componentes) {
      const componente = await Componente.findOne({ id_componente: item.id_componente, activo: true })
      if (!componente) { faltantes.push(`${item.id_componente} (no existe)`); continue }
      const necesario = item.cantidad * cantidad
      if (componente.stock_actual < necesario) {
        faltantes.push(`${item.id_componente} — necesitás ${necesario}, tenés ${componente.stock_actual}`)
      }
    }
    if (faltantes.length > 0) return NextResponse.json({ ok: false, error: 'Stock insuficiente', faltantes }, { status: 400 })

    // 2. Crear o actualizar ProductoTerminado PRIMERO (antes de tocar componentes)
    const nombreProducto = (receta.nombre ?? '').trim() !== '' ? receta.nombre : codigoUpper
    const existe = await ProductoTerminado.findOne({ codigo_luminaria: codigoUpper })
    if (existe) {
      await ProductoTerminado.findOneAndUpdate(
        { codigo_luminaria: codigoUpper },
        { $inc: { stock_actual: cantidad }, $set: { activo: true } },
        { new: true }
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

    // 3. Descontar componentes y registrar movimientos
    const componentesDescontados = []
    const fecha = new Date()
    const idProd = `PROD-${fecha.getFullYear()}-${Date.now()}`

    for (const item of receta.componentes) {
      const cantidadDescontar = item.cantidad * cantidad
      const componente = await Componente.findOneAndUpdate(
        { id_componente: item.id_componente },
        { $inc: { stock_actual: -cantidadDescontar } },
        { new: true }
      )
      componentesDescontados.push({ id_componente: item.id_componente, cantidad: cantidadDescontar })
      const idMov = `MOV-${fecha.getFullYear()}-${Date.now()}-${item.id_componente}`
      await Movimiento.create({
        id_movimiento: idMov,
        tipo: 'salida_produccion',
        id_componente: item.id_componente,
        cantidad: -cantidadDescontar,
        stock_resultante: componente!.stock_actual,
        referencia: idProd,
        notas: `Producción ${codigoUpper} x${cantidad}`,
        usuario: operario || 'admin',
      })
    }

    // 4. Registrar la producción
    const produccion = await Produccion.create({
      id_produccion: idProd,
      codigo_luminaria: codigoUpper,
      version_receta: receta.version,
      cantidad,
      operario: operario || 'admin',
      notas: notas || '',
      componentes_descontados: componentesDescontados,
    })

    await registrarAuditoria({ req, accion: 'crear', modulo: 'Produccion', detalle: `Fabricó ${cantidad} unidades de ${codigoUpper}`, dato_id: produccion._id.toString() })
    return NextResponse.json({ ok: true, data: produccion }, { status: 201 })
  } catch (e) {
    console.error('[producciones] error:', e)
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 })
  }
}