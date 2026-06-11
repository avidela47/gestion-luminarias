import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/mongoose'
import Herramienta from '@/models/Herramienta'
import { registrarAuditoria } from '@/lib/auditoria'

export async function GET() {
  try {
    await connectDB()
    const herramientas = await Herramienta.find({ activo: true }).sort({ codigo: 1 })
    return NextResponse.json({ ok: true, data: herramientas })
  } catch {
    return NextResponse.json({ ok: false, error: 'Error al obtener herramientas' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const body = await req.json()
    const existe = await Herramienta.findOne({ codigo: body.codigo?.toUpperCase() })
    if (existe) return NextResponse.json({ ok: false, error: `Ya existe una herramienta con el código ${body.codigo}` }, { status: 400 })
    const herramienta = await Herramienta.create(body)
    await registrarAuditoria({ req, accion: 'crear', modulo: 'Herramientas', detalle: `Creó herramienta ${herramienta.codigo}`, dato_id: herramienta._id.toString() })
    return NextResponse.json({ ok: true, data: herramienta }, { status: 201 })
  } catch {
    return NextResponse.json({ ok: false, error: 'Error al crear herramienta' }, { status: 500 })
  }
}