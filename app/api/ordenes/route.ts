import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/mongoose'
import OrdenTrabajo from '@/models/OrdenTrabajo'
import { registrarAuditoria } from '@/lib/auditoria'

async function generarNumero(): Promise<string> {
  const ultima = await OrdenTrabajo.findOne().sort({ createdAt: -1 })
  if (!ultima?.numero) return `OT-${new Date().getFullYear()}-0001`
  const partes = ultima.numero.split('-')
  const num = parseInt(partes[2] ?? '0') + 1
  return `OT-${new Date().getFullYear()}-${String(num).padStart(4, '0')}`
}

export async function GET() {
  try {
    await connectDB()
    const ordenes = await OrdenTrabajo.find().sort({ createdAt: -1 })
    return NextResponse.json({ ok: true, data: ordenes })
  } catch (e) {
    console.error('[ordenes GET]', e)
    return NextResponse.json({ ok: false, error: 'Error al obtener órdenes' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const body = await req.json()

    if (!body.id_cliente || !body.razon_social) {
      return NextResponse.json({ ok: false, error: 'Falta cliente o razón social' }, { status: 400 })
    }
    if (!Array.isArray(body.lineas) || body.lineas.length === 0) {
      return NextResponse.json({ ok: false, error: 'La orden no tiene líneas' }, { status: 400 })
    }

    // Solo persistimos los campos del modelo nuevo. Ignoramos cualquier campo viejo.
    const lineas = body.lineas.map((l: { codigo_luminaria: string; descripcion: string; cantidad: number }) => ({
      codigo_luminaria: l.codigo_luminaria,
      descripcion: l.descripcion,
      cantidad: l.cantidad,
    }))

    const numero = await generarNumero()
    const orden = await OrdenTrabajo.create({
      numero,
      id_cliente: body.id_cliente,
      razon_social: body.razon_social,
      vendedor: body.vendedor ?? '',
      id_presupuesto: body.id_presupuesto ?? '',
      numero_presupuesto: body.numero_presupuesto ?? '',
      fecha_entrega: body.fecha_entrega || null,
      lineas,
      notas: body.notas ?? '',
    })

    await registrarAuditoria({ req, accion: 'crear', modulo: 'Ordenes', detalle: `Creó orden de trabajo ${orden.numero}`, dato_id: orden._id.toString() })
    return NextResponse.json({ ok: true, data: orden }, { status: 201 })
  } catch (e) {
    console.error('[ordenes POST]', e)
    return NextResponse.json({ ok: false, error: 'Error al crear orden' }, { status: 500 })
  }
}