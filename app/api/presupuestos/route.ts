import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/mongoose'
import Presupuesto from '@/models/Presupuesto'
import { registrarAuditoria } from '@/lib/auditoria'

export async function GET() {
  try {
    await connectDB()
    const presupuestos = await Presupuesto.find().sort({ createdAt: -1 })
    return NextResponse.json({ ok: true, data: presupuestos })
  } catch {
    return NextResponse.json({ ok: false, error: 'Error al obtener presupuestos' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const body = await req.json()
    const ultimo = await Presupuesto.findOne().sort({ createdAt: -1 })
    let numero = '0001-00010001'
    if (ultimo?.numero) {
      const partes = ultimo.numero.split('-')
      const num = parseInt(partes[1]) + 1
      numero = `0001-${num.toString().padStart(8, '0')}`
    }
    const presupuesto = await Presupuesto.create({ ...body, numero })
    await registrarAuditoria({ req, accion: 'crear', modulo: 'Presupuestos', detalle: `Creó presupuesto ${presupuesto.numero} para ${presupuesto.razon_social}`, dato_id: presupuesto._id.toString() })
    return NextResponse.json({ ok: true, data: presupuesto }, { status: 201 })
  } catch {
    return NextResponse.json({ ok: false, error: 'Error al crear presupuesto' }, { status: 500 })
  }
}