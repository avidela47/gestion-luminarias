import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/mongoose'
import OrdenTrabajo from '@/models/OrdenTrabajo'
import ProductoTerminado from '@/models/ProductoTerminado'
import LuminariaComercial from '@/models/LuminariaComercial'
import SensorFuente from '@/models/SensorFuente'
import { registrarAuditoria } from '@/lib/auditoria'

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

async function devolver(codigo: string, tipo: Tipo, cantidad: number) {
  const cod = codigo.toUpperCase()
  if (tipo === 'fabricada') {
    await ProductoTerminado.findOneAndUpdate({ codigo_luminaria: cod }, { $inc: { stock_actual: cantidad } })
  } else if (tipo === 'comercial') {
    await LuminariaComercial.findOneAndUpdate({ codigo: cod }, { $inc: { stock_actual: cantidad } })
  } else {
    await SensorFuente.findOneAndUpdate({ codigo: cod }, { $inc: { stock_actual: cantidad } })
  }
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

    // Bloquear si falta fabricar
    if (aFabricar.length > 0) {
      return NextResponse.json({
        ok: false,
        error: 'Falta fabricar o reponer stock antes de ejecutar.',
        a_fabricar: aFabricar,
        en_stock: enStock,
      }, { status: 400 })
    }

    // Descontar todo
    for (const item of planDescuento) {
      await descontar(item.codigo, item.tipo, item.cantidad)
    }

    // Guardar qué se descontó para poder devolver si se elimina la OT
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