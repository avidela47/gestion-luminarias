import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/mongoose'
import Proyecto from '@/models/Proyecto'
import { auth } from '@/auth'
import { registrarAuditoria } from '@/lib/auditoria'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()
    const { id } = await params
    const proyecto = await Proyecto.findById(id)
    if (!proyecto) return NextResponse.json({ ok: false, error: 'Proyecto no encontrado' }, { status: 404 })
    return NextResponse.json({ ok: true, data: proyecto })
  } catch (e) {
    console.error('[proyecto GET]', e)
    return NextResponse.json({ ok: false, error: 'Error al obtener proyecto' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ ok: false, error: 'No autorizado' }, { status: 401 })
    }

    await connectDB()
    const { id } = await params
    const proyectoActual = await Proyecto.findById(id)
    if (!proyectoActual) return NextResponse.json({ ok: false, error: 'Proyecto no encontrado' }, { status: 404 })

    if (proyectoActual.estado === 'LISTO') {
      return NextResponse.json({ ok: false, error: 'No se puede editar un proyecto ya finalizado' }, { status: 400 })
    }

    const body = await req.json()

    const cambios: string[] = []
    if (body.prioridad && body.prioridad !== proyectoActual.prioridad) {
      cambios.push(`Prioridad cambiada a ${body.prioridad}`)
    }
    if (body.fecha_objetivo !== undefined && String(body.fecha_objetivo) !== String(proyectoActual.fecha_objetivo)) {
      cambios.push('Fecha objetivo modificada')
    }
    if (body.items) {
      const itemsAntes = JSON.stringify(proyectoActual.items.map((i: { modelo: string; cantidad_solicitada: number }) => ({ m: i.modelo, c: i.cantidad_solicitada })))
      const itemsDespues = JSON.stringify(body.items.map((i: { modelo: string; cantidad_solicitada: number }) => ({ m: i.modelo, c: i.cantidad_solicitada })))
      if (itemsAntes !== itemsDespues) cambios.push('Modelos, cantidades u ópticas modificados')
    }
    if (body.notas !== undefined && body.notas !== proyectoActual.notas) {
      cambios.push('Notas actualizadas')
    }

    const update: Record<string, unknown> = { ...body }

    if (cambios.length > 0) {
      update.alerta_activa = true
      update.alerta_revision = proyectoActual.alerta_revision + 1
      update.alerta_cambios = cambios
      update.alerta_confirmada_por = []
    }

    const proyecto = await Proyecto.findByIdAndUpdate(id, { $set: update }, { new: true, runValidators: true })

    await registrarAuditoria({
      req, accion: 'editar', modulo: 'Proyectos',
      detalle: `Editó proyecto ${proyecto!.numero}${cambios.length > 0 ? ` — ${cambios.join(', ')}` : ''}`,
      dato_id: id,
    })

    return NextResponse.json({ ok: true, data: proyecto })
  } catch (e) {
    console.error('[proyecto PUT]', e)
    return NextResponse.json({ ok: false, error: 'Error al editar proyecto' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ ok: false, error: 'No autorizado' }, { status: 401 })
    }

    await connectDB()
    const { id } = await params
    const proyecto = await Proyecto.findById(id)
    if (!proyecto) return NextResponse.json({ ok: false, error: 'Proyecto no encontrado' }, { status: 404 })

    await Proyecto.findByIdAndDelete(id)

    await registrarAuditoria({
      req, accion: 'eliminar', modulo: 'Proyectos',
      detalle: `Eliminó proyecto ${proyecto.numero}`,
      dato_id: id,
    })

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('[proyecto DELETE]', e)
    return NextResponse.json({ ok: false, error: 'Error al eliminar proyecto' }, { status: 500 })
  }
}
