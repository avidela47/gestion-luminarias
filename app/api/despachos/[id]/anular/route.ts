import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/mongoose'
import Despacho from '@/models/Despacho'
import ProductoTerminado from '@/models/ProductoTerminado'
import LuminariaComercial from '@/models/LuminariaComercial'
import { registrarAuditoria } from '@/lib/auditoria'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()
    const { id } = await params
    const despacho = await Despacho.findById(id)
    if (!despacho) return NextResponse.json({ ok: false, error: 'Despacho no encontrado' }, { status: 404 })
    if (despacho.estado !== 'despachado') return NextResponse.json({ ok: false, error: 'Solo se pueden anular despachos confirmados' }, { status: 400 })

    // Devolver stock
    for (const item of despacho.items) {
      if (item.tipo === 'fabricada') {
        await ProductoTerminado.findOneAndUpdate(
          { codigo_luminaria: item.codigo.toUpperCase() },
          { $inc: { stock_actual: item.cantidad } }
        )
      } else {
        await LuminariaComercial.findOneAndUpdate(
          { codigo: item.codigo.toUpperCase() },
          { $inc: { stock_actual: item.cantidad } }
        )
      }
    }

    const despachoActualizado = await Despacho.findByIdAndUpdate(
      id, { $set: { estado: 'anulado' } }, { new: true }
    )

    await registrarAuditoria({ req, accion: 'editar', modulo: 'Despachos', detalle: `Anuló despacho ${despacho.numero}`, dato_id: id })
    return NextResponse.json({ ok: true, data: despachoActualizado })
  } catch {
    return NextResponse.json({ ok: false, error: 'Error al anular despacho' }, { status: 500 })
  }
}