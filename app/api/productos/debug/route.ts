import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/mongoose'
import ProductoTerminado from '@/models/ProductoTerminado'

export async function GET() {
  try {
    await connectDB()
    const creado = await ProductoTerminado.create({
      codigo_luminaria: 'TEST-DEBUG-001',
      nombre: 'PRODUCTO DE PRUEBA',
      stock_actual: 5,
      stock_minimo: 0,
      precio_venta: 0,
      notas: '',
      foto: '',
      activo: true,
    })
    const todos = await ProductoTerminado.find({})
    return NextResponse.json({ ok: true, creado: creado._id, total: todos.length })
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 })
  }
}