import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/mongoose'
import ProductoTerminado from '@/models/ProductoTerminado'
import Receta from '@/models/Receta'
import Componente from '@/models/Componente'
import Produccion from '@/models/Produccion'
import { registrarAuditoria } from '@/lib/auditoria'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()
    const { id } = await params
    const producto = await ProductoTerminado.findOne({ codigo_luminaria: decodeURIComponent(id).toUpperCase() })
    if (!producto) return NextResponse.json({ ok: false, error: 'Producto no encontrado' }, { status: 404 })
    return NextResponse.json({ ok: true, data: producto })
  } catch {
    return NextResponse.json({ ok: false, error: 'Error al obtener producto' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()
    const { id } = await params
    const body = await req.json()
    const producto = await ProductoTerminado.findOneAndUpdate(
      { codigo_luminaria: decodeURIComponent(id).toUpperCase() }, { $set: body }, { new: true, runValidators: true }
    )
    if (!producto) return NextResponse.json({ ok: false, error: 'Producto no encontrado' }, { status: 404 })
    await registrarAuditoria({ req, accion: 'editar', modulo: 'Productos', detalle: `Editó producto ${producto.codigo_luminaria}`, dato_id: producto._id.toString() })
    return NextResponse.json({ ok: true, data: producto })
  } catch {
    return NextResponse.json({ ok: false, error: 'Error al editar producto' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()
    const { id } = await params
    const codigoUpper = decodeURIComponent(id).toUpperCase()

    const producto = await ProductoTerminado.findOne({ codigo_luminaria: codigoUpper })
    if (!producto) return NextResponse.json({ ok: false, error: 'Producto no encontrado' }, { status: 404 })

    // Buscar producciones para saber cuántos componentes devolver
    const producciones = await Produccion.find({ codigo_luminaria: codigoUpper })
    const totalFabricado = producciones.reduce((acc, p) => acc + p.cantidad, 0)

    if (totalFabricado > 0) {
      const receta = await Receta.findOne({ codigo: codigoUpper })
      if (receta) {
        for (const item of receta.componentes) {
          const cantidadDevolver = item.cantidad * totalFabricado
          await Componente.findOneAndUpdate(
            { id_componente: item.id_componente },
            { $inc: { stock_actual: cantidadDevolver } }
          )
        }
      }
    }

    await ProductoTerminado.findOneAndUpdate(
      { codigo_luminaria: codigoUpper }, { $set: { activo: false } }, { new: true }
    )

    await registrarAuditoria({ req, accion: 'eliminar', modulo: 'Productos', detalle: `Eliminó producto ${codigoUpper} — devolvió stock de ${totalFabricado} unidades`, dato_id: producto._id.toString() })
    return NextResponse.json({ ok: true, data: producto })
  } catch {
    return NextResponse.json({ ok: false, error: 'Error al eliminar producto' }, { status: 500 })
  }
}