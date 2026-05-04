import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/mongoose'
import ProductoTerminado from '@/models/ProductoTerminado'

export async function GET() {
  try {
    await connectDB()
    const productos = await ProductoTerminado.find({ activo: true }).sort({ codigo_luminaria: 1 })
    return NextResponse.json({ ok: true, data: productos })
  } catch {
    return NextResponse.json({ ok: false, error: 'Error al obtener productos' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const body = await req.json()
    const existe = await ProductoTerminado.findOne({ codigo_luminaria: body.codigo_luminaria?.toUpperCase() })
    if (existe) {
      return NextResponse.json(
        { ok: false, error: `Ya existe un producto con el código ${body.codigo_luminaria}` },
        { status: 400 }
      )
    }
    const producto = await ProductoTerminado.create(body)
    return NextResponse.json({ ok: true, data: producto }, { status: 201 })
  } catch {
    return NextResponse.json({ ok: false, error: 'Error al crear producto' }, { status: 500 })
  }
}