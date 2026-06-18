import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/mongoose'
import Despacho from '@/models/Despacho'
import { registrarAuditoria } from '@/lib/auditoria'

async function generarNumero(): Promise<string> {
  const ultimo = await Despacho.findOne().sort({ createdAt: -1 })
  if (!ultimo) return `DESP-${new Date().getFullYear()}-0001`
  const partes = ultimo.numero.split('-')
  const num = parseInt(partes[2]) + 1
  return `DESP-${new Date().getFullYear()}-${String(num).padStart(4, '0')}`
}

export async function GET() {
  try {
    await connectDB()
    const despachos = await Despacho.find().sort({ createdAt: -1 })
    return NextResponse.json({ ok: true, data: despachos })
  } catch {
    return NextResponse.json({ ok: false, error: 'Error al obtener despachos' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const body = await req.json()
    if (!body.razon_social || !body.items?.length) {
      return NextResponse.json({ ok: false, error: 'Datos incompletos' }, { status: 400 })
    }
    const numero = await generarNumero()
    const despacho = await Despacho.create({ ...body, numero })
    await registrarAuditoria({ req, accion: 'crear', modulo: 'Despachos', detalle: `Creó despacho ${despacho.numero} para ${despacho.razon_social}`, dato_id: despacho._id.toString() })
    return NextResponse.json({ ok: true, data: despacho }, { status: 201 })
  } catch {
    return NextResponse.json({ ok: false, error: 'Error al crear despacho' }, { status: 500 })
  }
}