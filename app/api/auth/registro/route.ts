import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/mongoose'
import Usuario from '@/models/Usuario'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const { nombre, username, password, rol } = await req.json()

    if (!nombre || !username || !password) {
      return NextResponse.json({ ok: false, error: 'Datos incompletos' }, { status: 400 })
    }

    const existe = await Usuario.findOne({ username: username.toLowerCase() })
    if (existe) {
      return NextResponse.json({ ok: false, error: 'El usuario ya existe' }, { status: 400 })
    }

    const hash = await bcrypt.hash(password, 10)
    const usuario = await Usuario.create({
      nombre,
      username: username.toLowerCase(),
      password: hash,
      rol: rol ?? 'usuario',
    })

    return NextResponse.json({ ok: true, data: { id: usuario._id, nombre: usuario.nombre, username: usuario.username, rol: usuario.rol } }, { status: 201 })
  } catch (e) {
    console.error('[registro]', e)
    return NextResponse.json({ ok: false, error: 'Error al registrar usuario' }, { status: 500 })
  }
}