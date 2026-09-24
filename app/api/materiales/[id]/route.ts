import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/mongoose'
import Material from '@/models/Material'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()
    const { id } = await params
    const material = await Material.findById(id)
    if (!material) return NextResponse.json({ ok: false, error: 'Material no encontrado' }, { status: 404 })
    return NextResponse.json({ ok: true, data: material })
  } catch {
    return NextResponse.json({ ok: false, error: 'Error al obtener material' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()
    const { id } = await params
    const body = await req.json()
    const material = await Material.findByIdAndUpdate(id, { $set: body }, { new: true, runValidators: true })
    if (!material) return NextResponse.json({ ok: false, error: 'Material no encontrado' }, { status: 404 })
    return NextResponse.json({ ok: true, data: material })
  } catch {
    return NextResponse.json({ ok: false, error: 'Error al editar material' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()
    const { id } = await params
    await Material.findByIdAndUpdate(id, { $set: { activo: false } })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false, error: 'Error al eliminar material' }, { status: 500 })
  }
}