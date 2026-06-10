import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/mongoose'
import Proveedor from '@/models/Proveedor'
import { registrarAuditoria } from '@/lib/auditoria'

export async function GET() {
  try {
    await connectDB()
    const proveedores = await Proveedor.find({ activo: true }).sort({ nombre: 1 })
    return NextResponse.json({ ok: true, data: proveedores })
  } catch {
    return NextResponse.json({ ok: false, error: 'Error al obtener proveedores' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const body = await req.json()
    const proveedor = await Proveedor.create(body)
    await registrarAuditoria({ req, accion: 'crear', modulo: 'Proveedores', detalle: `Creó proveedor ${proveedor.nombre}`, dato_id: proveedor._id.toString() })
    return NextResponse.json({ ok: true, data: proveedor }, { status: 201 })
  } catch {
    return NextResponse.json({ ok: false, error: 'Error al crear proveedor' }, { status: 500 })
  }
}