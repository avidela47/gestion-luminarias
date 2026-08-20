import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/mongoose'
import Proyecto from '@/models/Proyecto'
import { auth } from '@/auth'
import { registrarAuditoria } from '@/lib/auditoria'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ ok: false, error: 'No autorizado' }, { status: 401 })

    await connectDB()
    const { id } = await params
    const nombre = session.user.name ?? 'Usuario'

    const proyecto = await Proyecto.findById(id)
    if (!proyecto) return NextResponse.json({ ok: false, error: 'Proyecto no encontrado' }, { status: 404 })
    if (proyecto.estado !== 'NUEVO') {
      return NextResponse.json({ ok: false, error: 'Este proyecto ya fue tomado' }, { status: 409 })
    }

    const actualizado = await Proyecto.findByIdAndUpdate(
      id,
      { $set: { estado: 'PREPARACION', tomado_por: nombre, fecha_tomado: new Date() } },
      { new: true }
    )

    await registrarAuditoria({
      req, accion: 'editar', modulo: 'Proyectos',
      detalle: `${nombre} tomó el proyecto ${proyecto.numero}`,
      dato_id: id,
    })

    return NextResponse.json({ ok: true, data: actualizado })
  } catch (e) {
    console.error('[proyecto tomar]', e)
    return NextResponse.json({ ok: false, error: 'Error al tomar proyecto' }, { status: 500 })
  }
}
