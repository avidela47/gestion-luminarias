import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

const PERFILES: Record<string, string | undefined> = {
  FABIO: process.env.FACTORY_FABIO_PASSWORD_HASH,
  CRISTIAN: process.env.FACTORY_CRISTIAN_PASSWORD_HASH,
  PAJARITO: process.env.FACTORY_PAJARITO_PASSWORD_HASH,
}

const NOMBRES: Record<string, string> = {
  FABIO: 'Fabio',
  CRISTIAN: 'Cristian',
  PAJARITO: 'Pajarito',
}

export async function POST(req: NextRequest) {
  try {
    const { perfil, password } = await req.json()

    if (!perfil || !password || !PERFILES[perfil]) {
      return NextResponse.json({ ok: false, error: 'Perfil o contraseña inválidos' }, { status: 400 })
    }

    const hash = PERFILES[perfil]
    if (!hash) {
      return NextResponse.json({ ok: false, error: 'Perfil no configurado' }, { status: 500 })
    }

    const valido = await bcrypt.compare(password, hash)
    if (!valido) {
      return NextResponse.json({ ok: false, error: 'Contraseña incorrecta' }, { status: 401 })
    }

    return NextResponse.json({ ok: true, nombre: NOMBRES[perfil] })
  } catch (e) {
    console.error('[fabrica-auth]', e)
    return NextResponse.json({ ok: false, error: 'Error de autenticación' }, { status: 500 })
  }
}