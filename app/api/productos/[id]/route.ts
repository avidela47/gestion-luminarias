import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/mongoose'
import ProductoTerminado from '@/models/ProductoTerminado'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()
    const { id } = await params
    const producto = await ProductoTerminado.findOne({ codigo_luminaria: decodeURIComponent(id).toUpperCase() })
    if (!producto) {
      return NextResponse.json({ ok: false, error: 'Producto no encontrado' }, { status: 404 })
    }
    return NextResponse.json({ ok: true, data: producto })
  } catch {
    return NextResponse.json({ ok: false, error: 'Error al obtener producto' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()
    const { id } = await params
    const body = await req.json()
    const producto = await ProductoTerminado.findOneAndUpdate(
      { codigo_luminaria: decodeURIComponent(id).toUpperCase() },
      { $set: body },
      { new: true, runValidators: true }
    )
    if (!producto) {
      return NextResponse.json({ ok: false, error: 'Producto no encontrado' }, { status: 404 })
    }
    return NextResponse.json({ ok: true, data: producto })
  } catch {
    return NextResponse.json({ ok: false, error: 'Error al editar producto' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()
    const { id } = await params
    const producto = await ProductoTerminado.findOneAndDelete({
      codigo_luminaria: decodeURIComponent(id).toUpperCase()
    })
    if (!producto) {
      return NextResponse.json({ ok: false, error: 'Producto no encontrado' }, { status: 404 })
    }
    return NextResponse.json({ ok: true, data: producto })
  } catch {
    return NextResponse.json({ ok: false, error: 'Error al eliminar producto' }, { status: 500 })
  }
}