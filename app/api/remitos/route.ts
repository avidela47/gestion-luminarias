import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/mongoose'
import Remito from '@/models/Remito'

async function generarNumero(): Promise<string> {
  const ultimo = await Remito.findOne().sort({ createdAt: -1 })
  if (!ultimo) return `REM-${new Date().getFullYear()}-0001`
  const partes = ultimo.numero.split('-')
  const num = parseInt(partes[2]) + 1
  return `REM-${new Date().getFullYear()}-${String(num).padStart(4, '0')}`
}

export async function GET() {
  try {
    await connectDB()
    const remitos = await Remito.find().sort({ createdAt: -1 })
    return NextResponse.json({ ok: true, data: remitos })
  } catch {
    return NextResponse.json({ ok: false, error: 'Error al obtener remitos' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const body = await req.json()
    const numero = await generarNumero()
    const remito = await Remito.create({ ...body, numero })
    return NextResponse.json({ ok: true, data: remito }, { status: 201 })
  } catch {
    return NextResponse.json({ ok: false, error: 'Error al crear remito' }, { status: 500 })
  }
}