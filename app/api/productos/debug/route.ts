import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/mongoose'
import ProductoTerminado from '@/models/ProductoTerminado'
import mongoose from 'mongoose'

export async function GET() {
  try {
    await connectDB()
    const todos = await ProductoTerminado.find({})
    return NextResponse.json({
      ok: true,
      baseDeDatos: mongoose.connection.name,
      total: todos.length,
      productos: todos.map(p => ({ codigo: p.codigo_luminaria, stock: p.stock_actual, activo: p.activo })),
    })
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 })
  }
}