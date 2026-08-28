import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/mongoose'
import OrdenTrabajo from '@/models/OrdenTrabajo'
import ProductoTerminado from '@/models/ProductoTerminado'
import LuminariaComercial from '@/models/LuminariaComercial'
import SensorFuente from '@/models/SensorFuente'
import Proyecto from '@/models/Proyecto'
import Counter from '@/models/Counter'
import { registrarAuditoria } from '@/lib/auditoria'
import { enviarMailOT } from '@/lib/mailer'

type Tipo = 'fabricada' | 'comercial' | 'sensor'

async function buscarStock(codigo: string): Promise<{ tipo: Tipo; disponible: number } | null> {
  const cod = codigo.toUpperCase()
  const fab = await ProductoTerminado.findOne({ codigo_luminaria: cod })
  if (fab) return { tipo: 'fabricada', disponible: fab.stock_actual }
  const com = await LuminariaComercial.findOne({ codigo: cod })
  if (com) return { tipo: 'comercial', disponible: com.stock_actual }
  const sen = await SensorFuente.findOne({ codigo: cod })
  if (sen) return { tipo: 'sensor', disponible: sen.stock_actual }
  return null
}

async function descontar(codigo: string, tipo: Tipo, cantidad: number) {
  const cod = codigo.toUpperCase()
  if (tipo === 'fabricada') {
    await ProductoTerminado.findOneAndUpdate({ codigo_luminaria: cod }, { $inc: { stock_actual: -cantidad } })
  } else if (tipo === 'comercial') {
    await LuminariaComercial.findOneAndUpdate({ codigo: cod }, { $inc: { stock_actual: -cantidad } })
  } else {
    await SensorFuente.findOneAndUpdate({ codigo: cod }, { $inc: { stock_actual: -cantidad } })
  }
}

async function generarNumeroProyecto(): Promise<string> {
  const counter = await Counter.findOneAndUpdate(
    { _id: 'proyectos' },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  )
  return `AV-${1000 + counter.seq}`
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()
    const { id } = await params
    const orden = await OrdenTrabajo.findById(id)

    if (!orden) return NextResponse.json({ ok: false, error: 'Orden no encontrada' }, { status: 404 })
    if (orden.ejecutada) return NextResponse.json({ ok: false, error: 'Esta orden ya fue ejecutada' }, { status: 400 })

    const enStock: { codigo: string; descripcion: string; cantidad: number; tipo: Tipo }[] = []
    const aFabricar: { codigo_luminaria: string; descripcion: string; cantidad: number }[] = []
    const planDescuento: { codigo: string; tipo: Tipo; cantidad: number }[] = []

    for (const linea of orden.lineas) {
      const stock = await buscarStock(linea.codigo_luminaria)
      const disponible = stock?.disponible ?? 0
      const tipo = stock?.tipo ?? 'fabricada'
      const desdeStock = Math.min(linea.cantidad, disponible)
      const fabricar = linea.cantidad - desdeStock

      if (desdeStock > 0) {
        enStock.push({ codigo: linea.codigo_luminaria, descripcion: linea.descripcion, cantidad: desdeStock, tipo })
        planDescuento.push({ codigo: linea.codigo_luminaria, tipo, cantidad: desdeStock })
      }
      if (fabricar > 0) {
        aFabricar.push({ codigo_luminaria: linea.codigo_luminaria, descripcion: linea.descripcion, cantidad: fabricar })
      }
    }

    if (aFabricar.length > 0) {
      if (orden.id_proyecto_fabrica) {
        const proyectoExistente = await Proyecto.findById(orden.id_proyecto_fabrica)
        if (proyectoExistente && proyectoExistente.estado !== 'LISTO') {
          if (orden.estado !== 'En fábrica') {
            await OrdenTrabajo.findByIdAndUpdate(id, { $set: { estado: 'En fábrica' } })
          }
          return NextResponse.json({
            ok: false,
            error: `Ya hay un proyecto de fábrica en curso: ${proyectoExistente.numero}. Esperá a que esté LISTO.`,
            a_fabricar: aFabricar,
            en_stock: enStock,
            proyecto_numero: proyectoExistente.numero,
            proyecto_id: proyectoExistente._id.toString(),
          }, { status: 400 })
        }
      }

      const numeroProyecto = await generarNumeroProyecto()
      const items = aFabricar.map((item, idx) => ({
        id: `${numeroProyecto}-${idx + 1}`,
        modelo: item.codigo_luminaria,
        cantidad_solicitada: item.cantidad,
        cantidad_completada: 0,
      }))

      const proyecto = await Proyecto.create({
        numero: numeroProyecto,
        cliente: orden.razon_social,
        nombre: `Auto-generado desde OT ${orden.numero}`,
        prioridad: 'NORMAL',
        notas: `Generado automáticamente al ejecutar la Orden de Trabajo ${orden.numero}`,
        items,
        alerta_activa: true,
        alerta_revision: 1,
        alerta_cambios: ['Proyecto generado desde OT'],
        id_orden_trabajo: id,
        numero_orden_trabajo: orden.numero,
      })

      await OrdenTrabajo.findByIdAndUpdate(id, {
        $set: { id_proyecto_fabrica: proyecto._id.toString(), estado: 'En fábrica' },
      })

      await registrarAuditoria({
        req, accion: 'crear', modulo: 'Proyectos',
        detalle: `Generó proyecto ${proyecto.numero} automáticamente desde OT ${orden.numero}`,
        dato_id: proyecto._id.toString(),
      })

      return NextResponse.json({
        ok: false,
        error: `Falta fabricar. Se generó el proyecto ${proyecto.numero} para el taller.`,
        a_fabricar: aFabricar,
        en_stock: enStock,
        proyecto_numero: proyecto.numero,
        proyecto_id: proyecto._id.toString(),
      }, { status: 400 })
    }

    for (const item of planDescuento) {
      await descontar(item.codigo, item.tipo, item.cantidad)
    }

    await OrdenTrabajo.findByIdAndUpdate(id, {
      $set: {
        ejecutada: true,
        fecha_ejecucion: new Date(),
        estado: 'En proceso',
        items_descontados: planDescuento,
      },
    })

    await registrarAuditoria({
      req, accion: 'editar', modulo: 'Ordenes',
      detalle: `Ejecutó OT ${orden.numero} — descontó stock de ${planDescuento.length} ítem(s)`,
      dato_id: id,
    })

    try {
      await enviarMailOT({
        numero: orden.numero,
        cliente: orden.razon_social,
        vendedor: orden.vendedor,
        fecha: new Date(orden.fecha).toLocaleDateString('es-AR'),
        fecha_entrega: orden.fecha_entrega
          ? new Date(orden.fecha_entrega).toLocaleDateString('es-AR')
          : undefined,
        lineas: orden.lineas,
      })
    } catch (mailError) {
      console.error('[mail OT] error:', mailError)
    }

    return NextResponse.json({
      ok: true,
      mensaje: 'Orden ejecutada. Stock descontado correctamente.',
      en_stock: enStock,
      a_fabricar: [],
    })
  } catch (e) {
    console.error('[ejecutar OT] error:', e)
    return NextResponse.json({ ok: false, error: 'Error al ejecutar orden' }, { status: 500 })
  }
}