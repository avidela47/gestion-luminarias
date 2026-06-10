import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/mongoose'
import Vale from '@/models/Vale'
import { registrarAuditoria } from '@/lib/auditoria'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()
    const { id } = await params
    const vale = await Vale.findById(id)
    if (!vale) return NextResponse.json({ ok: false, error: 'Vale no encontrado' }, { status: 404 })
    return NextResponse.json({ ok: true, data: vale })
  } catch {
    return NextResponse.json({ ok: false, error: 'Error al obtener vale' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()
    const { id } = await params
    const body = await req.json()
    const vale = await Vale.findByIdAndUpdate(id, { $set: body }, { new: true, runValidators: true })
    if (!vale) return NextResponse.json({ ok: false, error: 'Vale no encontrado' }, { status: 404 })
    await registrarAuditoria({ req, accion: 'editar', modulo: 'Vales', detalle: `Editó vale ${vale.numero}`, dato_id: vale._id.toString() })
    return NextResponse.json({ ok: true, data: vale })
  } catch {
    return NextResponse.json({ ok: false, error: 'Error al editar vale' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()
    const { id } = await params
    const vale = await Vale.findByIdAndDelete(id)
    if (!vale) return NextResponse.json({ ok: false, error: 'Vale no encontrado' }, { status: 404 })
    await registrarAuditoria({ req, accion: 'eliminar', modulo: 'Vales', detalle: `Eliminó vale ${vale.numero}`, dato_id: id })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false, error: 'Error al eliminar vale' }, { status: 500 })
  }
}