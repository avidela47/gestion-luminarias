import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/mongoose'
import Receta from '@/models/Receta'

// GET — obtener todas las recetas
export async function GET() {
  try {
    await connectDB()
    const recetas = await Receta.find().sort({ codigo: 1 })
    return NextResponse.json({ ok: true, data: recetas })
  } catch {
    return NextResponse.json({ ok: false, error: 'Error al obtener recetas' }, { status: 500 })
  }
}

// POST — crear nueva receta
export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const body = await req.json()

    const existe = await Receta.findOne({ codigo: body.codigo?.toUpperCase() })
    if (existe) {
      return NextResponse.json(
        { ok: false, error: `Ya existe una receta con el código ${body.codigo}` },
        { status: 400 }
      )
    }

    const receta = await Receta.create(body)
    return NextResponse.json({ ok: true, data: receta }, { status: 201 })
  } catch {
    return NextResponse.json({ ok: false, error: 'Error al crear receta' }, { status: 500 })
  }
}