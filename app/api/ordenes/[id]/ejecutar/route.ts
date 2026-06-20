import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/mongoose'
import OrdenTrabajo from '@/models/OrdenTrabajo'
import ProductoTerminado from '@/models/ProductoTerminado'
import { registrarAuditoria } from '@/lib/auditoria'

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

    // 1. VALIDAR todo el stock de depósito ANTES de descontar nada
    const errores: string[] = []
    for (const linea of orden.lineas) {
      if (linea.cantidad_stock > 0) {
        const producto = await ProductoTerminado.findOne({ codigo_luminaria: linea.codigo_luminaria })
        const disponible = producto?.stock_actual ?? 0
        if (disponible < linea.cantidad_stock) {
          errores.push(`${linea.codigo_luminaria}: necesitás ${linea.cantidad_stock} en depósito, hay ${disponible}`)
        }
      }
    }

    if (errores.length > 0) {
      return NextResponse.json({ ok: false, error: 'Stock de depósito insuficiente', errores }, { status: 400 })
    }

    // 2. DESCONTAR del depósito (ya validado, seguro)
    for (const linea of orden.lineas) {
      if (linea.cantidad_stock > 0) {
        await ProductoTerminado.findOneAndUpdate(
          { codigo_luminaria: linea.codigo_luminaria },
          { $inc: { stock_actual: -linea.cantidad_stock } }
        )
      }
    }

    // 3. ARMAR el resumen de lo que falta fabricar (NO fabrica, solo informa)
    const aFabricar = orden.lineas
      .filter((l: { cantidad_fabricar: number }) => l.cantidad_fabricar > 0)
      .map((l: { codigo_luminaria: string; descripcion: string; cantidad_fabricar: number }) => ({
        codigo_luminaria: l.codigo_luminaria,
        descripcion: l.descripcion,
        cantidad: l.cantidad_fabricar,
      }))

    // 4. Marcar como ejecutada
    await OrdenTrabajo.findByIdAndUpdate(id, {
      $set: { ejecutada: true, fecha_ejecucion: new Date() },
    })

    await registrarAuditoria({
      req,
      accion: 'editar',
      modulo: 'Ordenes',
      detalle: `Ejecutó OT ${orden.numero} — descontó depósito${aFabricar.length > 0 ? `, pendiente fabricar ${aFabricar.length} ítem(s)` : ''}`,
      dato_id: id,
    })

    const mensaje = aFabricar.length > 0
      ? 'Orden ejecutada. Se descontó el stock de depósito. Quedan ítems para fabricar (ver detalle).'
      : 'Orden ejecutada. Se descontó todo del stock de depósito.'

    return NextResponse.json({ ok: true, mensaje, a_fabricar: aFabricar })
  } catch (e) {
    console.error('[ejecutar OT] error:', e)
    return NextResponse.json({ ok: false, error: 'Error al ejecutar orden' }, { status: 500 })
  }
}