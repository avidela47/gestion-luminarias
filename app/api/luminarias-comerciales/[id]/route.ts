import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/mongoose'
import LuminariaComercial from '@/models/LuminariaComercial'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()
    const { id } = await params
    const item = await LuminariaComercial.findOne({ codigo: decodeURIComponent(id).toUpperCase() })
    if (!item) return NextResponse.json({ ok: false, error: 'Luminaria no encontrada' }, { status: 404 })
    return NextResponse.json({ ok: true, data: item })
  } catch {
    return NextResponse.json({ ok: false, error: 'Error al obtener luminaria' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()
    const { id } = await params
    const body = await req.json()
    const item = await LuminariaComercial.findOneAndUpdate(
      { codigo: decodeURIComponent(id).toUpperCase() },
      { $set: body },
      { new: true, runValidators: true }
    )
    if (!item) return NextResponse.json({ ok: false, error: 'Luminaria no encontrada' }, { status: 404 })
    return NextResponse.json({ ok: true, data: item })
  } catch {
    return NextResponse.json({ ok: false, error: 'Error al editar luminaria' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()
    const { id } = await params
    await LuminariaComercial.findOneAndDelete({ codigo: decodeURIComponent(id).toUpperCase() })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false, error: 'Error al eliminar luminaria' }, { status: 500 })
  }
}