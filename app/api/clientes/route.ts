import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/mongoose'
import Cliente from '@/models/Cliente'
import { registrarAuditoria } from '@/lib/auditoria'

export async function GET() {
  try {
    await connectDB()
    const clientes = await Cliente.find({ activo: true }).sort({ nombre: 1 })
    return NextResponse.json({ ok: true, data: clientes })
  } catch {
    return NextResponse.json({ ok: false, error: 'Error al obtener clientes' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const body = await req.json()
    const existe = await Cliente.findOne({ id_cliente: body.id_cliente?.toUpperCase() })
    if (existe) return NextResponse.json({ ok: false, error: `Ya existe un cliente con el código ${body.id_cliente}` }, { status: 400 })
    const cliente = await Cliente.create(body)
    await registrarAuditoria({ req, accion: 'crear', modulo: 'Clientes', detalle: `Creó cliente ${cliente.nombre}`, dato_id: cliente._id.toString() })
    return NextResponse.json({ ok: true, data: cliente }, { status: 201 })
  } catch {
    return NextResponse.json({ ok: false, error: 'Error al crear cliente' }, { status: 500 })
  }
}