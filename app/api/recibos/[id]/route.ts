import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/mongoose'
import Recibo from '@/models/Recibo'
import { registrarAuditoria } from '@/lib/auditoria'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()
    const { id } = await params
    const recibo = await Recibo.findById(id)
    if (!recibo) return NextResponse.json({ ok: false, error: 'Recibo no encontrado' }, { status: 404 })
    return NextResponse.json({ ok: true, data: recibo })
  } catch {
    return NextResponse.json({ ok: false, error: 'Error al obtener recibo' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()
    const { id } = await params
    const body = await req.json()
    const recibo = await Recibo.findByIdAndUpdate(id, { $set: body }, { new: true, runValidators: true })
    if (!recibo) return NextResponse.json({ ok: false, error: 'Recibo no encontrado' }, { status: 404 })
    await registrarAuditoria({ req, accion: 'editar', modulo: 'Recibos', detalle: `Editó recibo ${recibo.numero}`, dato_id: recibo._id.toString() })
    return NextResponse.json({ ok: true, data: recibo })
  } catch {
    return NextResponse.json({ ok: false, error: 'Error al editar recibo' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()
    const { id } = await params
    await Recibo.findByIdAndDelete(id)
    await registrarAuditoria({ req, accion: 'eliminar', modulo: 'Recibos', detalle: `Eliminó recibo`, dato_id: id })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false, error: 'Error al eliminar recibo' }, { status: 500 })
  }
}