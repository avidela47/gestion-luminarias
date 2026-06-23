import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/mongoose'
import Despacho from '@/models/Despacho'
import SensorFuente from '@/models/SensorFuente'
import { registrarAuditoria } from '@/lib/auditoria'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()
    const { id } = await params
    const despacho = await Despacho.findById(id)
    if (!despacho) return NextResponse.json({ ok: false, error: 'Despacho no encontrado' }, { status: 404 })
    if (despacho.estado !== 'pendiente') return NextResponse.json({ ok: false, error: 'El despacho ya fue procesado' }, { status: 400 })

    // Solo descuenta sensores/fuentes — las luminarias las maneja la OT
    const faltantes: string[] = []
    for (const item of despacho.items) {
      if (item.tipo === 'sensor') {
        const sen = await SensorFuente.findOne({ codigo: item.codigo.toUpperCase() })
        if (!sen || sen.stock_actual < item.cantidad) {
          faltantes.push(`${item.codigo} — necesitás ${item.cantidad}, tenés ${sen?.stock_actual ?? 0}`)
        }
      }
    }

    if (faltantes.length > 0) return NextResponse.json({ ok: false, error: 'Stock insuficiente', faltantes }, { status: 400 })

    for (const item of despacho.items) {
      if (item.tipo === 'sensor') {
        await SensorFuente.findOneAndUpdate(
          { codigo: item.codigo.toUpperCase() },
          { $inc: { stock_actual: -item.cantidad } }
        )
      }
    }

    const despachoActualizado = await Despacho.findByIdAndUpdate(
      id, { $set: { estado: 'despachado', fecha: new Date() } }, { new: true }
    )
    await registrarAuditoria({ req, accion: 'editar', modulo: 'Despachos', detalle: `Confirmó entrega ${despacho.numero}`, dato_id: id })
    return NextResponse.json({ ok: true, data: despachoActualizado })
  } catch {
    return NextResponse.json({ ok: false, error: 'Error al confirmar despacho' }, { status: 500 })
  }
}