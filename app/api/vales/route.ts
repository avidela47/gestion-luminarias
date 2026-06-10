import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/mongoose'
import Vale from '@/models/Vale'
import { registrarAuditoria } from '@/lib/auditoria'

async function generarNumero(): Promise<string> {
  const ultimo = await Vale.findOne().sort({ createdAt: -1 })
  if (!ultimo) return `VALE-${new Date().getFullYear()}-0001`
  const partes = ultimo.numero.split('-')
  const num = parseInt(partes[2]) + 1
  return `VALE-${new Date().getFullYear()}-${String(num).padStart(4, '0')}`
}

export async function GET() {
  try {
    await connectDB()
    const vales = await Vale.find().sort({ createdAt: -1 })
    return NextResponse.json({ ok: true, data: vales })
  } catch {
    return NextResponse.json({ ok: false, error: 'Error al obtener vales' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const body = await req.json()
    if (!body.responsable || !body.items?.length) {
      return NextResponse.json({ ok: false, error: 'Responsable e ítems son obligatorios' }, { status: 400 })
    }
    const numero = await generarNumero()
    const vale = await Vale.create({ ...body, numero })
    await registrarAuditoria({ req, accion: 'crear', modulo: 'Vales', detalle: `Creó vale ${vale.numero} para ${vale.responsable}`, dato_id: vale._id.toString() })
    return NextResponse.json({ ok: true, data: vale }, { status: 201 })
  } catch {
    return NextResponse.json({ ok: false, error: 'Error al crear vale' }, { status: 500 })
  }
}