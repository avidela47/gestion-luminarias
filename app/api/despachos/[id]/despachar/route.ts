import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/mongoose'
import Despacho from '@/models/Despacho'
import { registrarAuditoria } from '@/lib/auditoria'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()
    const { id } = await params
    const despacho = await Despacho.findById(id)
    if (!despacho) return NextResponse.json({ ok: false, error: 'Despacho no encontrado' }, { status: 404 })
    if (despacho.estado !== 'pendiente') return NextResponse.json({ ok: false, error: 'El despacho ya fue procesado' }, { status: 400 })

    const despachoActualizado = await Despacho.findByIdAndUpdate(
      id, { $set: { estado: 'despachado', fecha: new Date() } }, { new: true }
    )
    await registrarAuditoria({ req, accion: 'editar', modulo: 'Despachos', detalle: `Confirmó entrega ${despacho.numero} para ${despacho.razon_social}`, dato_id: id })
    return NextResponse.json({ ok: true, data: despachoActualizado })
  } catch {
    return NextResponse.json({ ok: false, error: 'Error al confirmar despacho' }, { status: 500 })
  }
}