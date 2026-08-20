import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/mongoose'
import Proyecto from '@/models/Proyecto'
import ProyectoAvance from '@/models/ProyectoAvance'
import bcrypt from 'bcryptjs'
import { registrarAuditoria } from '@/lib/auditoria'

const PERFILES: Record<string, string | undefined> = {
  FABIO: process.env.FACTORY_FABIO_PASSWORD_HASH,
  CRISTIAN: process.env.FACTORY_CRISTIAN_PASSWORD_HASH,
  PAJARITO: process.env.FACTORY_PAJARITO_PASSWORD_HASH,
}
const NOMBRES: Record<string, string> = { FABIO: 'Fabio', CRISTIAN: 'Cristian', PAJARITO: 'Pajarito' }

async function validarFabrica(perfil: string, password: string): Promise<string | null> {
  const hash = PERFILES[perfil]
  if (!hash) return null
  const valido = await bcrypt.compare(password, hash)
  return valido ? NOMBRES[perfil] : null
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()
    const { id } = await params
    const { perfil, password, item_id, cantidad } = await req.json()

    const nombre = await validarFabrica(perfil, password)
    if (!nombre) return NextResponse.json({ ok: false, error: 'Identificación inválida' }, { status: 401 })

    if (!item_id || !Number.isInteger(cantidad) || cantidad <= 0) {
      return NextResponse.json({ ok: false, error: 'Cantidad inválida' }, { status: 400 })
    }

    const proyecto = await Proyecto.findById(id)
    if (!proyecto) return NextResponse.json({ ok: false, error: 'Proyecto no encontrado' }, { status: 404 })
    if (proyecto.estado === 'NUEVO') {
      return NextResponse.json({ ok: false, error: 'El proyecto todavía no fue tomado' }, { status: 409 })
    }
    if (proyecto.estado === 'LISTO') {
      return NextResponse.json({ ok: false, error: 'El proyecto ya está finalizado' }, { status: 409 })
    }

    const item = proyecto.items.find((i: { id: string }) => i.id === item_id)
    if (!item) return NextResponse.json({ ok: false, error: 'Modelo no encontrado en este proyecto' }, { status: 404 })

    const pendiente = item.cantidad_solicitada - item.cantidad_completada
    if (cantidad > pendiente) {
      return NextResponse.json({ ok: false, error: `Solo quedan ${pendiente} unidades pendientes de este modelo` }, { status: 409 })
    }

    item.cantidad_completada += cantidad

    const totalSolicitado = proyecto.items.reduce((a: number, i: { cantidad_solicitada: number }) => a + i.cantidad_solicitada, 0)
    const totalCompletado = proyecto.items.reduce((a: number, i: { cantidad_completada: number }) => a + i.cantidad_completada, 0)

    const nuevoEstado = proyecto.estado === 'PREPARACION' ? 'FABRICACION' : proyecto.estado

    proyecto.estado = nuevoEstado
    await proyecto.save()

    await ProyectoAvance.create({
      id_proyecto: id,
      numero_proyecto: proyecto.numero,
      item_id,
      modelo: item.modelo,
      optica: item.optica,
      cantidad,
      realizado_por: nombre,
    })

    await registrarAuditoria({
      req, accion: 'editar', modulo: 'Proyectos',
      detalle: `${nombre} cargó ${cantidad} de ${item.modelo} (${item.optica}) en ${proyecto.numero}`,
      dato_id: id,
    })

    return NextResponse.json({
      ok: true,
      data: {
        proyecto: { id, estado: proyecto.estado, completado: totalCompletado, solicitado: totalSolicitado },
        item: { id: item.id, modelo: item.modelo, optica: item.optica, solicitado: item.cantidad_solicitada, completado: item.cantidad_completada },
      },
    })
  } catch (e) {
    console.error('[proyecto avance]', e)
    return NextResponse.json({ ok: false, error: 'Error al cargar avance' }, { status: 500 })
  }
}