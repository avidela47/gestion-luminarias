import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/mongoose'
import Remito from '@/models/Remito'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()
    const { id } = await params
    const remito = await Remito.findById(id)
    if (!remito) return NextResponse.json({ ok: false, error: 'Remito no encontrado' }, { status: 404 })
    return NextResponse.json({ ok: true, data: remito })
  } catch {
    return NextResponse.json({ ok: false, error: 'Error al obtener remito' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()
    const { id } = await params
    const body = await req.json()
    const remito = await Remito.findByIdAndUpdate(id, { $set: body }, { new: true })
    if (!remito) return NextResponse.json({ ok: false, error: 'Remito no encontrado' }, { status: 404 })
    return NextResponse.json({ ok: true, data: remito })
  } catch {
    return NextResponse.json({ ok: false, error: 'Error al editar remito' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()
    const { id } = await params
    await Remito.findByIdAndDelete(id)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false, error: 'Error al eliminar remito' }, { status: 500 })
  }
}