import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/mongoose'
import Proyecto from '@/models/Proyecto'
import ProductoTerminado from '@/models/ProductoTerminado'
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

    const totalSolicitado = proyecto.items.reduce((a: number, i: { cantidad_solicitada: number }) => a + i.cantidad_solicitada, 0)
    const totalCompletado = proyecto.items.reduce((a: number, i: { cantidad_completada: number }) => a + i.cantidad_completada, 0)

    if (totalCompletado < totalSolicitado) {
      return NextResponse.json({ ok: false, error: 'Todavía falta completar producción' }, { status: 409 })
    }
    if (proyecto.estado === 'LISTO') {
      return NextResponse.json({ ok: false, error: 'El proyecto ya estaba marcado como listo' }, { status: 409 })
    }

    // Acreditar stock: cada modelo del proyecto sube en ProductoTerminado
    for (const item of proyecto.items) {
      const cod = item.modelo.toUpperCase()
      const existente = await ProductoTerminado.findOne({ codigo_luminaria: cod })
      if (existente) {
        await ProductoTerminado.findOneAndUpdate(
          { codigo_luminaria: cod },
          { $inc: { stock_actual: item.cantidad_completada }, $set: { activo: true } }
        )
      } else {
        await ProductoTerminado.create({
          codigo_luminaria: cod,
          nombre: item.modelo,
          stock_actual: item.cantidad_completada,
          activo: true,
        })
      }
    }

    const actualizado = await Proyecto.findByIdAndUpdate(
      id,
      { $set: { estado: 'LISTO', fecha_listo: new Date() } },
      { new: true }
    )

    await registrarAuditoria({
      req, accion: 'editar', modulo: 'Proyectos',
      detalle: `${nombre} marcó como LISTO el proyecto ${proyecto.numero} — stock acreditado`,
      dato_id: id,
    })

    return NextResponse.json({ ok: true, data: actualizado })
  } catch (e) {
    console.error('[proyecto listo]', e)
    return NextResponse.json({ ok: false, error: 'Error al marcar proyecto como listo' }, { status: 500 })
  }
}