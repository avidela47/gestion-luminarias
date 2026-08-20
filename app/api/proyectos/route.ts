import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/mongoose'
import Proyecto from '@/models/Proyecto'
import Counter from '@/models/Counter'
import { auth } from '@/auth'
import { registrarAuditoria } from '@/lib/auditoria'

async function generarNumero(): Promise<string> {
  const counter = await Counter.findOneAndUpdate(
    { _id: 'proyectos' },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  )
  return `AV-${1000 + counter.seq}`
}

export async function GET() {
  try {
    await connectDB()
    const proyectos = await Proyecto.find().sort({ createdAt: -1 })
    return NextResponse.json({ ok: true, data: proyectos })
  } catch (e) {
    console.error('[proyectos GET]', e)
    return NextResponse.json({ ok: false, error: 'Error al obtener proyectos' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ ok: false, error: 'No autorizado' }, { status: 401 })
    }
    await connectDB()
    const body = await req.json()
    if (!body.cliente) {
      return NextResponse.json({ ok: false, error: 'Falta el cliente' }, { status: 400 })
    }
    if (!Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json({ ok: false, error: 'Agregá al menos un modelo' }, { status: 400 })
    }
    const invalido = body.items.some((i: { modelo: string; cantidad_solicitada: number }) =>
      !i.modelo || i.cantidad_solicitada < 1
    )
    if (invalido) {
      return NextResponse.json({ ok: false, error: 'Cada modelo necesita código y cantidad válida' }, { status: 400 })
    }
    const numero = await generarNumero()
    const items = body.items.map((i: { modelo: string; cantidad_solicitada: number }, idx: number) => ({
      id: `${numero}-${idx + 1}`,
      modelo: i.modelo,
      cantidad_solicitada: i.cantidad_solicitada,
      cantidad_completada: 0,
    }))
    const proyecto = await Proyecto.create({
      numero,
      cliente: body.cliente,
      nombre: body.nombre ?? '',
      fecha_objetivo: body.fecha_objetivo || null,
      prioridad: body.prioridad === 'URGENTE' ? 'URGENTE' : 'NORMAL',
      notas: body.notas ?? '',
      items,
      alerta_activa: true,
      alerta_revision: 1,
      alerta_cambios: ['Proyecto nuevo'],
    })
    await registrarAuditoria({
      req, accion: 'crear', modulo: 'Proyectos',
      detalle: `Creó proyecto ${proyecto.numero} — ${proyecto.cliente}`,
      dato_id: proyecto._id.toString(),
    })
    return NextResponse.json({ ok: true, data: proyecto }, { status: 201 })
  } catch (e) {
    console.error('[proyectos POST]', e)
    return NextResponse.json({ ok: false, error: 'Error al crear proyecto' }, { status: 500 })
  }
}
