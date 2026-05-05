import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/mongoose'
import OrdenTrabajo from '@/models/OrdenTrabajo'
import Receta from '@/models/Receta'
import Componente from '@/models/Componente'
import ProductoTerminado from '@/models/ProductoTerminado'
import Movimiento from '@/models/Movimiento'
import Produccion from '@/models/Produccion'

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

    const fecha = new Date()
    const errores: string[] = []
    const componentesDescontados: { id_componente: string; cantidad: number }[] = []

    for (const linea of orden.lineas) {
      const { codigo_luminaria, cantidad_stock, cantidad_fabricar } = linea

      if (cantidad_stock > 0) {
        const producto = await ProductoTerminado.findOne({ codigo_luminaria })
        if (!producto || producto.stock_actual < cantidad_stock) {
          errores.push(`Stock insuficiente de ${codigo_luminaria} en depósito`)
          continue
        }
        await ProductoTerminado.findOneAndUpdate(
          { codigo_luminaria },
          { $inc: { stock_actual: -cantidad_stock } }
        )
      }

      if (cantidad_fabricar > 0) {
        const receta = await Receta.findOne({ codigo: codigo_luminaria, activa: true })
        if (!receta) {
          errores.push(`No existe receta activa para ${codigo_luminaria}`)
          continue
        }

        for (const item of receta.componentes) {
          const comp = await Componente.findOne({ id_componente: item.id_componente })
          const necesario = item.cantidad * cantidad_fabricar
          if (!comp || comp.stock_actual < necesario) {
            errores.push(`Stock insuficiente de ${item.id_componente} para fabricar ${codigo_luminaria}`)
          }
        }

        if (errores.length > 0) continue

        for (const item of receta.componentes) {
          const cantDesc = item.cantidad * cantidad_fabricar
          const comp = await Componente.findOneAndUpdate(
            { id_componente: item.id_componente },
            { $inc: { stock_actual: -cantDesc } },
            { new: true }
          )
          componentesDescontados.push({ id_componente: item.id_componente, cantidad: cantDesc })

          const idMov = `MOV-${fecha.getFullYear()}-${Date.now()}-${item.id_componente}`
          await Movimiento.create({
            id_movimiento: idMov,
            tipo: 'salida_produccion',
            id_componente: item.id_componente,
            cantidad: -cantDesc,
            stock_resultante: comp!.stock_actual,
            referencia: orden.numero,
            notas: `OT ${orden.numero} — ${codigo_luminaria} x${cantidad_fabricar}`,
            usuario: orden.vendedor || 'admin',
          })
        }

        const idProd = `PROD-${fecha.getFullYear()}-${Date.now()}-OT`
        await Produccion.create({
          id_produccion: idProd,
          codigo_luminaria,
          version_receta: receta.version,
          cantidad: cantidad_fabricar,
          operario: orden.vendedor || 'admin',
          notas: `OT ${orden.numero}`,
          componentes_descontados: componentesDescontados,
        })
      }
    }

    if (errores.length > 0) {
      return NextResponse.json({ ok: false, error: 'Errores al ejecutar', errores }, { status: 400 })
    }

    // Solo marca como ejecutada, NO cambia el estado
    await OrdenTrabajo.findByIdAndUpdate(id, {
      $set: {
        ejecutada: true,
        fecha_ejecucion: fecha,
      }
    })

    return NextResponse.json({ ok: true, mensaje: 'Orden ejecutada correctamente' })
  } catch {
    return NextResponse.json({ ok: false, error: 'Error al ejecutar orden' }, { status: 500 })
  }
}