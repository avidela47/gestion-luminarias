import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/mongoose'
import OrdenTrabajo from '@/models/OrdenTrabajo'

async function generarNumero(): Promise<string> {
  const ultima = await OrdenTrabajo.findOne().sort({ createdAt: -1 })
  if (!ultima) return 'OT-2026-0001'
  const partes = ultima.numero.split('-')
  const num = parseInt(partes[2]) + 1
  return `OT-${new Date().getFullYear()}-${String(num).padStart(4, '0')}`
}

export async function GET() {
  try {
    await connectDB()
    const ordenes = await OrdenTrabajo.find().sort({ createdAt: -1 })
    return NextResponse.json({ ok: true, data: ordenes })
  } catch {
    return NextResponse.json({ ok: false, error: 'Error al obtener órdenes' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const body = await req.json()
    const numero = await generarNumero()
    const orden = await OrdenTrabajo.create({ ...body, numero })
    return NextResponse.json({ ok: true, data: orden }, { status: 201 })
  } catch {
    return NextResponse.json({ ok: false, error: 'Error al crear orden' }, { status: 500 })
  }
}