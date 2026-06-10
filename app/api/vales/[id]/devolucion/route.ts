import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/mongoose'
import Vale from '@/models/Vale'
import Componente from '@/models/Componente'
import Movimiento from '@/models/Movimiento'
import { registrarAuditoria } from '@/lib/auditoria'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()
    const { id } = await params
    const { items_devueltos, observaciones_devolucion } = await req.json()

    const vale = await Vale.findById(id)
    if (!vale) return NextResponse.json({ ok: false, error: 'Vale no encontrado' }, { status: 404 })
    if (vale.estado === 'cerrado') return NextResponse.json({ ok: false, error: 'El vale ya está cerrado' }, { status: 400 })

    // Actualizar cantidades devueltas
    const itemsActualizados = vale.items.map((item: { descripcion: string; cantidad_salida: number; cantidad_devuelta: number; tipo: string; notas: string }, i: number) => {
  const devuelto = items_devueltos[i] ?? 0
  return {
    descripcion: item.descripcion,
    cantidad_salida: item.cantidad_salida,
    cantidad_devuelta: item.cantidad_devuelta + devuelto,
    tipo: item.tipo,
    notas: item.notas,
  }
})

    // Determinar estado
    const todoCerrado = itemsActualizados.every(
      (item: { cantidad_salida: number; cantidad_devuelta: number }) => item.cantidad_devuelta >= item.cantidad_salida
    )
    const algo = itemsActualizados.some((item: { cantidad_devuelta: number }) => item.cantidad_devuelta > 0)
    const nuevoEstado = todoCerrado ? 'cerrado' : algo ? 'devolucion_parcial' : 'abierto'

    // Descontar stock de ítems tipo 'stock' que no volvieron
    const fecha = new Date()
    for (let i = 0; i < itemsActualizados.length; i++) {
      const item = itemsActualizados[i]
      if (item.tipo !== 'stock') continue
      const devueltoEstaVez = items_devueltos[i] ?? 0
      if (devueltoEstaVez <= 0) continue

      // Intentar descontar del stock si existe el componente
      const componente = await Componente.findOne({
        descripcion: { $regex: item.descripcion, $options: 'i' },
        activo: true,
      })
      if (componente) {
        const faltante = item.cantidad_salida - itemsActualizados[i].cantidad_devuelta
        if (faltante > 0) {
          await Componente.findOneAndUpdate(
            { _id: componente._id },
            { $inc: { stock_actual: -faltante } },
            { new: true }
          )
          const idMov = `MOV-${fecha.getFullYear()}-${Date.now()}-VALE`
          const comp = await Componente.findById(componente._id)
          await Movimiento.create({
            id_movimiento: idMov,
            tipo: 'ajuste_manual_salida',
            id_componente: componente.id_componente,
            cantidad: -faltante,
            stock_resultante: comp?.stock_actual ?? 0,
            referencia: vale.numero,
            notas: `Faltante vale ${vale.numero}`,
            usuario: vale.responsable,
          })
        }
      }
    }

    const valeActualizado = await Vale.findByIdAndUpdate(
      id,
      {
        $set: {
          items: itemsActualizados,
          estado: nuevoEstado,
          fecha_devolucion: new Date(),
          observaciones_devolucion,
        },
      },
      { new: true }
    )

    await registrarAuditoria({ req, accion: 'editar', modulo: 'Vales', detalle: `Registró devolución en vale ${vale.numero} — estado: ${nuevoEstado}`, dato_id: vale._id.toString() })
    return NextResponse.json({ ok: true, data: valeActualizado })
  } catch {
    return NextResponse.json({ ok: false, error: 'Error al registrar devolución' }, { status: 500 })
  }
}