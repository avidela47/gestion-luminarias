import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/mongoose'
import OrdenTrabajo from '@/models/OrdenTrabajo'
import ProductoTerminado from '@/models/ProductoTerminado'
import LuminariaComercial from '@/models/LuminariaComercial'
import { registrarAuditoria } from '@/lib/auditoria'

type Tipo = 'fabricada' | 'comercial' | 'inexistente'

async function buscarStock(codigo: string): Promise<{ tipo: Tipo; disponible: number }> {
  const cod = codigo.toUpperCase()
  const fab = await ProductoTerminado.findOne({ codigo_luminaria: cod })
  if (fab) return { tipo: 'fabricada', disponible: fab.stock_actual }
  const com = await LuminariaComercial.findOne({ codigo: cod })
  if (com) return { tipo: 'comercial', disponible: com.stock_actual }
  return { tipo: 'inexistente', disponible: 0 }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()
    const { id } = await params
    const orden = await OrdenTrabajo.findById(id)

    if (!orden) {
      return NextResponse.json({ ok: false, error: 'Orden no encontrada' }, { status: 404 })
    }
    if (orden.ejecutada) {
      return NextResponse.json({ ok: false, error: 'Esta orden ya fue ejecutada' }, { status: 400 })
    }

    const enStock: { codigo: string; descripcion: string; cantidad: number; tipo: Tipo }[] = []
    const aFabricar: { codigo_luminaria: string; descripcion: string; cantidad: number }[] = []

    for (const linea of orden.lineas) {
      const { tipo, disponible } = await buscarStock(linea.codigo_luminaria)
      const desdeStock = Math.min(linea.cantidad, disponible)
      const fabricar = linea.cantidad - desdeStock

      if (desdeStock > 0) {
        enStock.push({ codigo: linea.codigo_luminaria, descripcion: linea.descripcion, cantidad: desdeStock, tipo })
      }
      if (fabricar > 0) {
        aFabricar.push({ codigo_luminaria: linea.codigo_luminaria, descripcion: linea.descripcion, cantidad: fabricar })
      }
    }

    await OrdenTrabajo.findByIdAndUpdate(id, {
      $set: { ejecutada: true, fecha_ejecucion: new Date(), estado: 'En proceso' },
    })

    await registrarAuditoria({
      req,
      accion: 'editar',
      modulo: 'Ordenes',
      detalle: `Ejecutó OT ${orden.numero} — ${enStock.length} ítem(s) cubiertos por stock, ${aFabricar.length} a fabricar`,
      dato_id: id,
    })

    const mensaje = aFabricar.length > 0
      ? 'Orden ejecutada. Revisá qué hay en stock y qué falta fabricar.'
      : 'Orden ejecutada. Todo el pedido está cubierto por stock disponible.'

    return NextResponse.json({ ok: true, mensaje, en_stock: enStock, a_fabricar: aFabricar })
  } catch (e) {
    console.error('[ejecutar OT] error:', e)
    return NextResponse.json({ ok: false, error: 'Error al ejecutar orden' }, { status: 500 })
  }
}