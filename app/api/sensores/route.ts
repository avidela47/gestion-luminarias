import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/mongoose'
import SensorFuente from '@/models/SensorFuente'
import { registrarAuditoria } from '@/lib/auditoria'

export async function GET() {
  try {
    await connectDB()
    const items = await SensorFuente.find({ activo: true }).sort({ codigo: 1 })
    return NextResponse.json({ ok: true, data: items })
  } catch {
    return NextResponse.json({ ok: false, error: 'Error al obtener sensores y fuentes' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const body = await req.json()
    const existe = await SensorFuente.findOne({ codigo: body.codigo?.toUpperCase() })
    if (existe) return NextResponse.json({ ok: false, error: `Ya existe un producto con el código ${body.codigo}` }, { status: 400 })
    const item = await SensorFuente.create(body)
    await registrarAuditoria({ req, accion: 'crear', modulo: 'Sensores', detalle: `Creó sensor/fuente ${item.codigo}`, dato_id: item._id.toString() })
    return NextResponse.json({ ok: true, data: item }, { status: 201 })
  } catch {
    return NextResponse.json({ ok: false, error: 'Error al crear producto' }, { status: 500 })
  }
}