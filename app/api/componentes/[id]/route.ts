import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/mongoose'
import Componente from '@/models/Componente'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()
    const { id } = await params
    const componente = await Componente.findOne({ id_componente: decodeURIComponent(id).toUpperCase() })
    if (!componente) {
      return NextResponse.json({ ok: false, error: 'Componente no encontrado' }, { status: 404 })
    }
    return NextResponse.json({ ok: true, data: componente })
  } catch {
    return NextResponse.json({ ok: false, error: 'Error al obtener componente' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()
    const { id } = await params
    const body = await req.json()
    const componente = await Componente.findOneAndUpdate(
      { id_componente: decodeURIComponent(id).toUpperCase() },
      { $set: body },
      { new: true, runValidators: true }
    )
    if (!componente) {
      return NextResponse.json({ ok: false, error: 'Componente no encontrado' }, { status: 404 })
    }
    return NextResponse.json({ ok: true, data: componente })
  } catch {
    return NextResponse.json({ ok: false, error: 'Error al editar componente' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()
    const { id } = await params
    const componente = await Componente.findOneAndDelete({
      id_componente: decodeURIComponent(id).toUpperCase()
    })
    if (!componente) {
      return NextResponse.json({ ok: false, error: 'Componente no encontrado' }, { status: 404 })
    }
    return NextResponse.json({ ok: true, data: componente })
  } catch {
    return NextResponse.json({ ok: false, error: 'Error al eliminar componente' }, { status: 500 })
  }
}