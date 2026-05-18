import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/mongoose'
import SensorFuente from '@/models/SensorFuente'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()
    const { id } = await params
    const item = await SensorFuente.findOne({ codigo: decodeURIComponent(id).toUpperCase() })
    if (!item) return NextResponse.json({ ok: false, error: 'Producto no encontrado' }, { status: 404 })
    return NextResponse.json({ ok: true, data: item })
  } catch {
    return NextResponse.json({ ok: false, error: 'Error al obtener producto' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()
    const { id } = await params
    const body = await req.json()
    const item = await SensorFuente.findOneAndUpdate(
      { codigo: decodeURIComponent(id).toUpperCase() },
      { $set: body },
      { new: true, runValidators: true }
    )
    if (!item) return NextResponse.json({ ok: false, error: 'Producto no encontrado' }, { status: 404 })
    return NextResponse.json({ ok: true, data: item })
  } catch {
    return NextResponse.json({ ok: false, error: 'Error al editar producto' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()
    const { id } = await params
    await SensorFuente.findOneAndDelete({ codigo: decodeURIComponent(id).toUpperCase() })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false, error: 'Error al eliminar producto' }, { status: 500 })
  }
}