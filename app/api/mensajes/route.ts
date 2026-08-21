import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/mongoose'
import Mensaje from '@/models/Mensaje'
import { auth } from '@/auth'

export async function GET() {
  try {
    await connectDB()
    const mensajes = await Mensaje.find().sort({ createdAt: -1 }).limit(100)
    return NextResponse.json({ ok: true, data: mensajes.reverse() })
  } catch (e) {
    console.error('[mensajes GET]', e)
    return NextResponse.json({ ok: false, error: 'Error al obtener mensajes' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ ok: false, error: 'No autorizado' }, { status: 401 })

    await connectDB()
    const { texto } = await req.json()
    if (!texto || !texto.trim()) return NextResponse.json({ ok: false, error: 'Mensaje vacío' }, { status: 400 })

    const mensaje = await Mensaje.create({
      autor: session.user.name ?? 'Usuario',
      texto: texto.trim(),
    })

    return NextResponse.json({ ok: true, data: mensaje }, { status: 201 })
  } catch (e) {
    console.error('[mensajes POST]', e)
    return NextResponse.json({ ok: false, error: 'Error al enviar mensaje' }, { status: 500 })
  }
}
