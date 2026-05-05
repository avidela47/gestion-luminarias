import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/mongoose'
import OrdenTrabajo from '@/models/OrdenTrabajo'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()
    const { id } = await params
    const orden = await OrdenTrabajo.findById(id)
    if (!orden) {
      return NextResponse.json({ ok: false, error: 'Orden no encontrada' }, { status: 404 })
    }
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
    if (!orden) {
      return NextResponse.json({ ok: false, error: 'Orden no encontrada' }, { status: 404 })
    }
    return NextResponse.json({ ok: true, data: orden })
  } catch {
    return NextResponse.json({ ok: false, error: 'Error al editar orden' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()
    const { id } = await params
    await OrdenTrabajo.findByIdAndDelete(id)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false, error: 'Error al eliminar orden' }, { status: 500 })
  }
}