import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/mongoose'
import Receta from '@/models/Receta'

// GET — obtener una receta por codigo
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()
    const receta = await Receta.findOne({ codigo: params.id.toUpperCase() })
    if (!receta) {
      return NextResponse.json({ ok: false, error: 'Receta no encontrada' }, { status: 404 })
    }
    return NextResponse.json({ ok: true, data: receta })
  } catch {
    return NextResponse.json({ ok: false, error: 'Error al obtener receta' }, { status: 500 })
  }
}

// PUT — editar una receta (crea nueva versión automáticamente)
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()
    const body = await req.json()

    const receta = await Receta.findOne({ codigo: params.id.toUpperCase() })
    if (!receta) {
      return NextResponse.json({ ok: false, error: 'Receta no encontrada' }, { status: 404 })
    }

    // Si cambian los componentes, incrementa la versión
    const componentesCambiaron =
      JSON.stringify(receta.componentes) !== JSON.stringify(body.componentes)

    const update = {
      ...body,
      version: componentesCambiaron ? receta.version + 1 : receta.version,
      fecha_version: componentesCambiaron ? new Date() : receta.fecha_version,
    }

    const recetaActualizada = await Receta.findOneAndUpdate(
      { codigo: params.id.toUpperCase() },
      { $set: update },
      { new: true, runValidators: true }
    )

    return NextResponse.json({ ok: true, data: recetaActualizada })
  } catch {
    return NextResponse.json({ ok: false, error: 'Error al editar receta' }, { status: 500 })
  }
}

// DELETE — desactivar receta
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()

    const receta = await Receta.findOneAndUpdate(
      { codigo: params.id.toUpperCase() },
      { $set: { activa: false } },
      { new: true }
    )

    if (!receta) {
      return NextResponse.json({ ok: false, error: 'Receta no encontrada' }, { status: 404 })
    }

    return NextResponse.json({ ok: true, data: receta })
  } catch {
    return NextResponse.json({ ok: false, error: 'Error al eliminar receta' }, { status: 500 })
  }
}