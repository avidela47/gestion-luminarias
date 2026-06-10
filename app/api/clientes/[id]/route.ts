import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/mongoose'
import Cliente from '@/models/Cliente'
import { registrarAuditoria } from '@/lib/auditoria'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()
    const { id } = await params
    const cliente = await Cliente.findOne({ id_cliente: decodeURIComponent(id).toUpperCase() })
    if (!cliente) return NextResponse.json({ ok: false, error: 'Cliente no encontrado' }, { status: 404 })
    return NextResponse.json({ ok: true, data: cliente })
  } catch {
    return NextResponse.json({ ok: false, error: 'Error al obtener cliente' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()
    const { id } = await params
    const body = await req.json()
    const cliente = await Cliente.findOneAndUpdate(
      { id_cliente: decodeURIComponent(id).toUpperCase() }, { $set: body }, { new: true, runValidators: true }
    )
    if (!cliente) return NextResponse.json({ ok: false, error: 'Cliente no encontrado' }, { status: 404 })
    await registrarAuditoria({ req, accion: 'editar', modulo: 'Clientes', detalle: `Editó cliente ${cliente.nombre}`, dato_id: cliente._id.toString() })
    return NextResponse.json({ ok: true, data: cliente })
  } catch {
    return NextResponse.json({ ok: false, error: 'Error al editar cliente' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()
    const { id } = await params
    const cliente = await Cliente.findOneAndDelete({ id_cliente: decodeURIComponent(id).toUpperCase() })
    if (!cliente) return NextResponse.json({ ok: false, error: 'Cliente no encontrado' }, { status: 404 })
    await registrarAuditoria({ req, accion: 'eliminar', modulo: 'Clientes', detalle: `Eliminó cliente ${cliente.nombre}`, dato_id: cliente._id.toString() })
    return NextResponse.json({ ok: true, data: cliente })
  } catch {
    return NextResponse.json({ ok: false, error: 'Error al eliminar cliente' }, { status: 500 })
  }
}