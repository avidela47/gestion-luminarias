import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/mongoose'
import Proveedor from '@/models/Proveedor'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()
    const { id } = await params
    const proveedor = await Proveedor.findOne({ id_proveedor: decodeURIComponent(id).toUpperCase() })
    if (!proveedor) {
      return NextResponse.json({ ok: false, error: 'Proveedor no encontrado' }, { status: 404 })
    }
    return NextResponse.json({ ok: true, data: proveedor })
  } catch {
    return NextResponse.json({ ok: false, error: 'Error al obtener proveedor' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()
    const { id } = await params
    const body = await req.json()
    const proveedor = await Proveedor.findOneAndUpdate(
      { id_proveedor: decodeURIComponent(id).toUpperCase() },
      { $set: body },
      { new: true, runValidators: true }
    )
    if (!proveedor) {
      return NextResponse.json({ ok: false, error: 'Proveedor no encontrado' }, { status: 404 })
    }
    return NextResponse.json({ ok: true, data: proveedor })
  } catch {
    return NextResponse.json({ ok: false, error: 'Error al editar proveedor' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()
    const { id } = await params
    const proveedor = await Proveedor.findOneAndDelete({
      id_proveedor: decodeURIComponent(id).toUpperCase()
    })
    if (!proveedor) {
      return NextResponse.json({ ok: false, error: 'Proveedor no encontrado' }, { status: 404 })
    }
    return NextResponse.json({ ok: true, data: proveedor })
  } catch {
    return NextResponse.json({ ok: false, error: 'Error al eliminar proveedor' }, { status: 500 })
  }
}