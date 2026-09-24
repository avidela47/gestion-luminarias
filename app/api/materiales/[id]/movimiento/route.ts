import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/mongoose'
import Material from '@/models/Material'
import MovimientoMaterial from '@/models/MovimientoMaterial'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()
    const { id } = await params
    const movimientos = await MovimientoMaterial.find({ id_material: id }).sort({ createdAt: -1 })
    return NextResponse.json({ ok: true, data: movimientos })
  } catch {
    return NextResponse.json({ ok: false, error: 'Error al obtener movimientos' }, { status: 500 })
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()
    const { id } = await params
    const body = await req.json()
    const { tipo, cantidad, id_orden, numero_orden, notas, usuario } = body

    if (!tipo || !cantidad || cantidad <= 0) {
      return NextResponse.json({ ok: false, error: 'Datos incompletos' }, { status: 400 })
    }

    if ((tipo === 'salida') && !numero_orden) {
      return NextResponse.json({ ok: false, error: 'La salida requiere una OT asociada' }, { status: 400 })
    }

    const material = await Material.findById(id)
    if (!material) return NextResponse.json({ ok: false, error: 'Material no encontrado' }, { status: 404 })

    if (tipo === 'salida' && material.stock_actual < cantidad) {
      return NextResponse.json(
        { ok: false, error: `Stock insuficiente. Disponible: ${material.stock_actual}` },
        { status: 400 }
      )
    }

    const delta = tipo === 'entrada' || tipo === 'devolucion' ? cantidad : -cantidad
    const stock_resultante = material.stock_actual + delta

    await Material.findByIdAndUpdate(id, { $inc: { stock_actual: delta } })

    const movimiento = await MovimientoMaterial.create({
      tipo,
      id_material: id,
      codigo_material: material.codigo,
      descripcion_material: material.descripcion,
      cantidad,
      stock_resultante,
      precio_unitario: material.precio_unitario,
      id_orden: id_orden || '',
      numero_orden: numero_orden || '',
      notas: notas || '',
      usuario: usuario || 'admin',
    })

    return NextResponse.json({ ok: true, data: movimiento }, { status: 201 })
  } catch {
    return NextResponse.json({ ok: false, error: 'Error al registrar movimiento' }, { status: 500 })
  }
}