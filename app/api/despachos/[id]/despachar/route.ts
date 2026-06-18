import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/mongoose'
import Despacho from '@/models/Despacho'
import ProductoTerminado from '@/models/ProductoTerminado'
import LuminariaComercial from '@/models/LuminariaComercial'
import { registrarAuditoria } from '@/lib/auditoria'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()
    const { id } = await params
    const despacho = await Despacho.findById(id)
    if (!despacho) return NextResponse.json({ ok: false, error: 'Despacho no encontrado' }, { status: 404 })
    if (despacho.estado !== 'pendiente') return NextResponse.json({ ok: false, error: 'El despacho ya fue procesado' }, { status: 400 })

    // Verificar stock
    const faltantes: string[] = []
    for (const item of despacho.items) {
      if (item.tipo === 'fabricada') {
        const prod = await ProductoTerminado.findOne({ codigo_luminaria: item.codigo.toUpperCase() })
        if (!prod || prod.stock_actual < item.cantidad) {
          faltantes.push(`${item.codigo} — necesitás ${item.cantidad}, tenés ${prod?.stock_actual ?? 0}`)
        }
      } else {
        const com = await LuminariaComercial.findOne({ codigo: item.codigo.toUpperCase() })
        if (!com || com.stock_actual < item.cantidad) {
          faltantes.push(`${item.codigo} — necesitás ${item.cantidad}, tenés ${com?.stock_actual ?? 0}`)
        }
      }
    }

    if (faltantes.length > 0) return NextResponse.json({ ok: false, error: 'Stock insuficiente', faltantes }, { status: 400 })

    // Descontar stock
    for (const item of despacho.items) {
      if (item.tipo === 'fabricada') {
        await ProductoTerminado.findOneAndUpdate(
          { codigo_luminaria: item.codigo.toUpperCase() },
          { $inc: { stock_actual: -item.cantidad } }
        )
      } else {
        await LuminariaComercial.findOneAndUpdate(
          { codigo: item.codigo.toUpperCase() },
          { $inc: { stock_actual: -item.cantidad } }
        )
      }
    }

    const despachoActualizado = await Despacho.findByIdAndUpdate(
      id, { $set: { estado: 'despachado', fecha: new Date() } }, { new: true }
    )

    await registrarAuditoria({ req, accion: 'editar', modulo: 'Despachos', detalle: `Despachó ${despacho.numero} para ${despacho.razon_social}`, dato_id: id })
    return NextResponse.json({ ok: true, data: despachoActualizado })
  } catch {
    return NextResponse.json({ ok: false, error: 'Error al despachar' }, { status: 500 })
  }
}