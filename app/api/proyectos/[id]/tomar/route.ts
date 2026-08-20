import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/mongoose'
import Proyecto from '@/models/Proyecto'
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
    const { perfil, password } = await req.json()

    const nombre = await validarFabrica(perfil, password)
    if (!nombre) return NextResponse.json({ ok: false, error: 'Identificación inválida' }, { status: 401 })

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