import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/mongoose'
import LuminariaComercial from '@/models/LuminariaComercial'

export async function GET() {
  try {
    await connectDB()
    const items = await LuminariaComercial.find({ activo: true }).sort({ codigo: 1 })
    return NextResponse.json({ ok: true, data: items })
  } catch {
    return NextResponse.json({ ok: false, error: 'Error al obtener luminarias comerciales' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const body = await req.json()
    const existe = await LuminariaComercial.findOne({ codigo: body.codigo?.toUpperCase() })
    if (existe) {
      return NextResponse.json(
        { ok: false, error: `Ya existe una luminaria con el código ${body.codigo}` },
        { status: 400 }
      )
    }
    const item = await LuminariaComercial.create(body)
    return NextResponse.json({ ok: true, data: item }, { status: 201 })
  } catch {
    return NextResponse.json({ ok: false, error: 'Error al crear luminaria' }, { status: 500 })
  }
}