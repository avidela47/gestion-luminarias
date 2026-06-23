import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/mongoose'
import OrdenTrabajo from '@/models/OrdenTrabajo'
import ProductoTerminado from '@/models/ProductoTerminado'
import LuminariaComercial from '@/models/LuminariaComercial'
import SensorFuente from '@/models/SensorFuente'
import { registrarAuditoria } from '@/lib/auditoria'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()
    const { id } = await params
    const orden = await OrdenTrabajo.findById(id)
    if (!orden) return NextResponse.json({ ok: false, error: 'Orden no encontrada' }, { status: 404 })
    return NextResponse.json({ ok: true, data: orden })
  } catch {
    return NextResponse.json({ ok: false, error: 'Error al obtener orden' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()
    const { id } = await params
    const body = await req.json()
    const orden = await OrdenTrabajo.findByIdAndUpdate(
      id, { $set: body }, { new: true, runValidators: true }
    )
    if (!orden) return NextResponse.json({ ok: false, error: 'Orden no encontrada' }, { status: 404 })
    return NextResponse.json({ ok: true, data: orden })
  } catch {
    return NextResponse.json({ ok: false, error: 'Error al editar orden' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()
    const { id } = await params
    const orden = await OrdenTrabajo.findById(id)
    if (!orden) return NextResponse.json({ ok: false, error: 'Orden no encontrada' }, { status: 404 })

    // Si fue ejecutada, devolver el stock
    if (orden.ejecutada && orden.items_descontados?.length > 0) {
      for (const item of orden.items_descontados) {
        const cod = item.codigo.toUpperCase()
        if (item.tipo === 'fabricada') {
          await ProductoTerminado.findOneAndUpdate({ codigo_luminaria: cod }, { $inc: { stock_actual: item.cantidad } })
        } else if (item.tipo === 'comercial') {
          await LuminariaComercial.findOneAndUpdate({ codigo: cod }, { $inc: { stock_actual: item.cantidad } })
        } else {
          await SensorFuente.findOneAndUpdate({ codigo: cod }, { $inc: { stock_actual: item.cantidad } })
        }
      }
    }

    await OrdenTrabajo.findByIdAndDelete(id)
    await registrarAuditoria({ req, accion: 'eliminar', modulo: 'Ordenes', detalle: `Eliminó OT ${orden.numero}${orden.ejecutada ? ' — stock devuelto' : ''}`, dato_id: id })
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('[eliminar OT] error:', e)
    return NextResponse.json({ ok: false, error: 'Error al eliminar orden' }, { status: 500 })
  }
}