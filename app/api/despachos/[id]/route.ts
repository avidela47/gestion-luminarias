import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/mongoose'
import Despacho from '@/models/Despacho'
import { registrarAuditoria } from '@/lib/auditoria'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()
    const { id } = await params
    const despacho = await Despacho.findById(id)
    if (!despacho) return NextResponse.json({ ok: false, error: 'Despacho no encontrado' }, { status: 404 })
    return NextResponse.json({ ok: true, data: despacho })
  } catch {
    return NextResponse.json({ ok: false, error: 'Error al obtener despacho' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()
    const { id } = await params
    const despacho = await Despacho.findByIdAndDelete(id)
    if (!despacho) return NextResponse.json({ ok: false, error: 'Despacho no encontrado' }, { status: 404 })
    await registrarAuditoria({ req, accion: 'eliminar', modulo: 'Despachos', detalle: `Eliminó despacho ${despacho.numero}`, dato_id: id })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false, error: 'Error al eliminar despacho' }, { status: 500 })
  }
}