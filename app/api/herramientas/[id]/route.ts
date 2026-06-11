import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/mongoose'
import Herramienta from '@/models/Herramienta'
import { registrarAuditoria } from '@/lib/auditoria'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()
    const { id } = await params
    const herramienta = await Herramienta.findOne({ codigo: decodeURIComponent(id).toUpperCase() })
    if (!herramienta) return NextResponse.json({ ok: false, error: 'Herramienta no encontrada' }, { status: 404 })
    return NextResponse.json({ ok: true, data: herramienta })
  } catch {
    return NextResponse.json({ ok: false, error: 'Error al obtener herramienta' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()
    const { id } = await params
    const body = await req.json()
    const herramienta = await Herramienta.findOneAndUpdate(
      { codigo: decodeURIComponent(id).toUpperCase() }, { $set: body }, { new: true, runValidators: true }
    )
    if (!herramienta) return NextResponse.json({ ok: false, error: 'Herramienta no encontrada' }, { status: 404 })
    await registrarAuditoria({ req, accion: 'editar', modulo: 'Herramientas', detalle: `Editó herramienta ${herramienta.codigo}`, dato_id: herramienta._id.toString() })
    return NextResponse.json({ ok: true, data: herramienta })
  } catch {
    return NextResponse.json({ ok: false, error: 'Error al editar herramienta' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()
    const { id } = await params
    const herramienta = await Herramienta.findOneAndUpdate(
      { codigo: decodeURIComponent(id).toUpperCase() }, { $set: { activo: false } }, { new: true }
    )
    if (!herramienta) return NextResponse.json({ ok: false, error: 'Herramienta no encontrada' }, { status: 404 })
    await registrarAuditoria({ req, accion: 'eliminar', modulo: 'Herramientas', detalle: `Eliminó herramienta ${herramienta.codigo}`, dato_id: herramienta._id.toString() })
    return NextResponse.json({ ok: true, data: herramienta })
  } catch {
    return NextResponse.json({ ok: false, error: 'Error al eliminar herramienta' }, { status: 500 })
  }
}