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
    if (proyecto.estado === 'LISTO') {
      return NextResponse.json({ ok: false, error: 'El proyecto ya estaba marcado como listo' }, { status: 409 })
    }

    const totalSolicitado = proyecto.items.reduce((a: number, i: { cantidad_solicitada: number }) => a + i.cantidad_solicitada, 0)
    const totalCompletado = proyecto.items.reduce((a: number, i: { cantidad_completada: number }) => a + i.cantidad_completada, 0)

    if (totalCompletado < totalSolicitado) {
      return NextResponse.json({ ok: false, error: 'Todavía falta completar producción' }, { status: 409 })
    }

    const actualizado = await Proyecto.findByIdAndUpdate(
      id,
      { $set: { estado: 'LISTO', fecha_listo: new Date() } },
      { new: true }
    )

    await registrarAuditoria({
      req, accion: 'editar', modulo: 'Proyectos',
      detalle: `${nombre} marcó como LISTO el proyecto ${proyecto.numero}`,
      dato_id: id,
    })

    return NextResponse.json({ ok: true, data: actualizado })
  } catch (e) {
    console.error('[proyecto listo]', e)
    return NextResponse.json({ ok: false, error: 'Error al marcar proyecto como listo' }, { status: 500 })
  }
}
