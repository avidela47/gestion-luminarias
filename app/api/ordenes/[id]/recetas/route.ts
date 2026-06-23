import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/mongoose'
import OrdenTrabajo from '@/models/OrdenTrabajo'
import Receta from '@/models/Receta'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()
    const { id } = await params
    const orden = await OrdenTrabajo.findById(id)
    if (!orden) return NextResponse.json({ ok: false, error: 'Orden no encontrada' }, { status: 404 })

    const resultado = []
    for (const linea of orden.lineas) {
      const receta = await Receta.findOne({ codigo: linea.codigo_luminaria.toUpperCase(), activa: true })
      resultado.push({
        codigo_luminaria: linea.codigo_luminaria,
        descripcion: linea.descripcion,
        cantidad_pedida: linea.cantidad,
        tiene_receta: !!receta,
        componentes: receta
          ? receta.componentes.map((c: { id_componente: string; cantidad: number }) => ({
              id_componente: c.id_componente,
              cantidad_por_unidad: c.cantidad,
              cantidad_total: c.cantidad * linea.cantidad,
            }))
          : [],
      })
    }

    return NextResponse.json({ ok: true, data: resultado })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ ok: false, error: 'Error al obtener recetas' }, { status: 500 })
  }
}