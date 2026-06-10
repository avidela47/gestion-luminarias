import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/mongoose'
import Componente from '@/models/Componente'
import { registrarAuditoria } from '@/lib/auditoria'

export async function GET() {
  try {
    await connectDB()
    const componentes = await Componente.find({ activo: true }).sort({ id_componente: 1 })
    return NextResponse.json({ ok: true, data: componentes })
  } catch {
    return NextResponse.json({ ok: false, error: 'Error al obtener componentes' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const body = await req.json()
    const existe = await Componente.findOne({ id_componente: body.id_componente?.toUpperCase() })
    if (existe) {
      return NextResponse.json({ ok: false, error: `Ya existe un componente con el código ${body.id_componente}` }, { status: 400 })
    }
    const componente = await Componente.create(body)
    await registrarAuditoria({ req, accion: 'crear', modulo: 'Componentes', detalle: `Creó componente ${componente.id_componente}`, dato_id: componente._id.toString() })
    return NextResponse.json({ ok: true, data: componente }, { status: 201 })
  } catch {
    return NextResponse.json({ ok: false, error: 'Error al crear componente' }, { status: 500 })
  }
}