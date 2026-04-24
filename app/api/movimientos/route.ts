import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/mongoose'
import Movimiento from '@/models/Movimiento'
import Componente from '@/models/Componente'

// GET — obtener todos los movimientos
export async function GET() {
  try {
    await connectDB()
    const movimientos = await Movimiento.find().sort({ createdAt: -1 })
    return NextResponse.json({ ok: true, data: movimientos })
  } catch {
    return NextResponse.json({ ok: false, error: 'Error al obtener movimientos' }, { status: 500 })
  }
}

// POST — registrar entrada de compra o ajuste manual
export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const body = await req.json()
    const { tipo, id_componente, cantidad, referencia, notas, usuario } = body

    if (!tipo || !id_componente || !cantidad || cantidad < 1) {
      return NextResponse.json({ ok: false, error: 'Datos incompletos' }, { status: 400 })
    }

    // Verificar que el componente existe
    const componente = await Componente.findOne({
      id_componente: id_componente.toUpperCase(),
      activo: true,
    })
    if (!componente) {
      return NextResponse.json({ ok: false, error: 'Componente no encontrado' }, { status: 404 })
    }

    // Calcular nuevo stock según tipo
    const esEntrada = tipo === 'entrada_compra' || tipo === 'ajuste_manual_entrada'
    const delta = esEntrada ? cantidad : -cantidad

    if (!esEntrada && componente.stock_actual + delta < 0) {
      return NextResponse.json(
        { ok: false, error: 'Stock insuficiente para el ajuste' },
        { status: 400 }
      )
    }

    // Actualizar stock
    const componenteActualizado = await Componente.findOneAndUpdate(
      { id_componente: id_componente.toUpperCase() },
      { $inc: { stock_actual: delta } },
      { new: true }
    )

    // Registrar movimiento
    const fecha = new Date()
    const idMov = `MOV-${fecha.getFullYear()}-${Date.now()}`
    const movimiento = await Movimiento.create({
      id_movimiento: idMov,
      tipo,
      id_componente: id_componente.toUpperCase(),
      cantidad: delta,
      stock_resultante: componenteActualizado!.stock_actual,
      referencia: referencia || '',
      notas: notas || '',
      usuario: usuario || 'admin',
    })

    return NextResponse.json({ ok: true, data: movimiento }, { status: 201 })
  } catch {
    return NextResponse.json({ ok: false, error: 'Error al registrar movimiento' }, { status: 500 })
  }
}