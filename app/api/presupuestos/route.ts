import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/mongoose'
import Presupuesto from '@/models/Presupuesto'

async function generarNumero(): Promise<string> {
  const ultimo = await Presupuesto.findOne().sort({ createdAt: -1 })
  if (!ultimo) return '0001-00010001'
  const partes = ultimo.numero.split('-')
  const num = parseInt(partes[1]) + 1
  return `0001-${String(num).padStart(8, '0')}`
}

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
    const numero = await generarNumero()
    const presupuesto = await Presupuesto.create({ ...body, numero })
    return NextResponse.json({ ok: true, data: presupuesto }, { status: 201 })
  } catch {
    return NextResponse.json({ ok: false, error: 'Error al crear presupuesto' }, { status: 500 })
  }
}