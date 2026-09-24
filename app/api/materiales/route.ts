import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/mongoose'
import Material from '@/models/Material'

export async function GET() {
  try {
    await connectDB()
    const materiales = await Material.find({ activo: true }).sort({ codigo: 1 })
    return NextResponse.json({ ok: true, data: materiales })
  } catch {
    return NextResponse.json({ ok: false, error: 'Error al obtener materiales' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const body = await req.json()
    const existe = await Material.findOne({ codigo: body.codigo?.toUpperCase() })
    if (existe) {
      return NextResponse.json(
        { ok: false, error: `Ya existe un material con el código ${body.codigo}` },
        { status: 400 }
      )
    }
    const material = await Material.create(body)
    return NextResponse.json({ ok: true, data: material }, { status: 201 })
  } catch {
    return NextResponse.json({ ok: false, error: 'Error al crear material' }, { status: 500 })
  }
}