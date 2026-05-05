import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/mongoose'
import Recibo from '@/models/Recibo'

async function generarNumero(): Promise<string> {
  const ultimo = await Recibo.findOne().sort({ createdAt: -1 })
  if (!ultimo) return `REC-${new Date().getFullYear()}-0001`
  const partes = ultimo.numero.split('-')
  const num = parseInt(partes[2]) + 1
  return `REC-${new Date().getFullYear()}-${String(num).padStart(4, '0')}`
}

export async function GET() {
  try {
    await connectDB()
    const recibos = await Recibo.find().sort({ createdAt: -1 })
    return NextResponse.json({ ok: true, data: recibos })
  } catch {
    return NextResponse.json({ ok: false, error: 'Error al obtener recibos' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const body = await req.json()
    const numero = await generarNumero()
    const recibo = await Recibo.create({
      ...body,
      numero,
      total_pagado_usd: 0,
      saldo_usd: body.total_usd,
      estado: 'Pendiente de pago',
    })
    return NextResponse.json({ ok: true, data: recibo }, { status: 201 })
  } catch {
    return NextResponse.json({ ok: false, error: 'Error al crear recibo' }, { status: 500 })
  }
}