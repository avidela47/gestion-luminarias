import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/mongoose'
import Presupuesto from '@/models/Presupuesto'
import { registrarAuditoria } from '@/lib/auditoria'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()
    const { id } = await params
    const presupuesto = await Presupuesto.findById(id)
    if (!presupuesto) return NextResponse.json({ ok: false, error: 'Presupuesto no encontrado' }, { status: 404 })
    return NextResponse.json({ ok: true, data: presupuesto })
  } catch {
    return NextResponse.json({ ok: false, error: 'Error al obtener presupuesto' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()
    const { id } = await params
    const body = await req.json()
    const presupuesto = await Presupuesto.findByIdAndUpdate(id, { $set: body }, { new: true, runValidators: true })
    if (!presupuesto) return NextResponse.json({ ok: false, error: 'Presupuesto no encontrado' }, { status: 404 })
    await registrarAuditoria({ req, accion: 'editar', modulo: 'Presupuestos', detalle: `Editó presupuesto ${presupuesto.numero}`, dato_id: presupuesto._id.toString() })
    return NextResponse.json({ ok: true, data: presupuesto })
  } catch {
    return NextResponse.json({ ok: false, error: 'Error al editar presupuesto' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()
    const { id } = await params
    const presupuesto = await Presupuesto.findByIdAndDelete(id)
    if (!presupuesto) return NextResponse.json({ ok: false, error: 'Presupuesto no encontrado' }, { status: 404 })
    await registrarAuditoria({ req, accion: 'eliminar', modulo: 'Presupuestos', detalle: `Eliminó presupuesto ${presupuesto.numero}`, dato_id: id })
    return NextResponse.json({ ok: true, data: presupuesto })
  } catch {
    return NextResponse.json({ ok: false, error: 'Error al eliminar presupuesto' }, { status: 500 })
  }
}