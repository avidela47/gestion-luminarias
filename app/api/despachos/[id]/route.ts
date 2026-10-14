import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/mongoose'
import Despacho from '@/models/Despacho'
import ProductoTerminado from '@/models/ProductoTerminado'
import LuminariaComercial from '@/models/LuminariaComercial'
import SensorFuente from '@/models/SensorFuente'
import { registrarAuditoria } from '@/lib/auditoria'

async function devolverStock(items: { codigo: string; tipo: string; cantidad: number }[]) {
  for (const item of items) {
    if (item.tipo === 'fabricada') {
      await ProductoTerminado.findOneAndUpdate(
        { codigo_luminaria: item.codigo.toUpperCase() },
        { $inc: { stock_actual: item.cantidad } }
      )
    } else if (item.tipo === 'comercial') {
      await LuminariaComercial.findOneAndUpdate(
        { codigo: item.codigo.toUpperCase() },
        { $inc: { stock_actual: item.cantidad } }
      )
    } else if (item.tipo === 'sensor') {
      await SensorFuente.findOneAndUpdate(
        { codigo: item.codigo.toUpperCase() },
        { $inc: { stock_actual: item.cantidad } }
      )
    }
  }
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()
    const { id } = await params
    const despacho = await Despacho.findById(id)
    if (!despacho) return NextResponse.json({ ok: false, error: 'Despacho no encontrado' }, { status: 404 })
    return NextResponse.json({ ok: true, data: despacho })
  } catch {
    return NextResponse.json({ ok: false, error: 'Error al obtener despacho' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()
    const { id } = await params
    const despacho = await Despacho.findById(id)
    if (!despacho) return NextResponse.json({ ok: false, error: 'Despacho no encontrado' }, { status: 404 })

    // Devuelve el stock al eliminar el despacho
    await devolverStock(despacho.items)

    await Despacho.findByIdAndDelete(id)
    await registrarAuditoria({
      req, accion: 'eliminar', modulo: 'Despachos',
      detalle: `Eliminó despacho ${despacho.numero} — devolvió stock de ${despacho.items.length} ítem(s)`,
      dato_id: id
    })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false, error: 'Error al eliminar despacho' }, { status: 500 })
  }
}