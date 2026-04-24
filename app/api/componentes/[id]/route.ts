import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/mongoose'
import Componente from '@/models/Componente'

// GET — obtener un componente por id_componente
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()
    const componente = await Componente.findOne({ id_componente: params.id.toUpperCase() })
    if (!componente) {
      return NextResponse.json({ ok: false, error: 'Componente no encontrado' }, { status: 404 })
    }
    return NextResponse.json({ ok: true, data: componente })
  } catch {
    return NextResponse.json({ ok: false, error: 'Error al obtener componente' }, { status: 500 })
  }
}

// PUT — editar un componente
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()
    const body = await req.json()

    const componente = await Componente.findOneAndUpdate(
      { id_componente: params.id.toUpperCase() },
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

// DELETE — baja lógica (no borra de la base, solo desactiva)
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()

    const componente = await Componente.findOneAndUpdate(
      { id_componente: params.id.toUpperCase() },
      { $set: { activo: false } },
      { new: true }
    )

    if (!componente) {
      return NextResponse.json({ ok: false, error: 'Componente no encontrado' }, { status: 404 })
    }

    return NextResponse.json({ ok: true, data: componente })
  } catch {
    return NextResponse.json({ ok: false, error: 'Error al eliminar componente' }, { status: 500 })
  }
}