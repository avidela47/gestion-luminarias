import { auth } from './auth'
import { NextResponse } from 'next/server'

const RUTAS_SOLO_ADMIN = [
  '/movimientos',
  '/clientes',
  '/proveedores',
  '/presupuestos',
  '/ordenes',
  '/recibos',
  '/despachos',
  '/reportes',
  '/auditoria',
  '/proyectos',
]

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const isLoginPage = req.nextUrl.pathname === '/login'
  const isRegistroPage = req.nextUrl.pathname === '/registro'

  if (!isLoggedIn && !isLoginPage && !isRegistroPage) {
    return NextResponse.redirect(new URL('/login', req.url))
  }
  if (isLoggedIn && isLoginPage) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  if (isLoggedIn) {
    const rol = (req.auth?.user as { rol?: string } | undefined)?.rol
    const pathname = req.nextUrl.pathname
    const esRutaAdmin = RUTAS_SOLO_ADMIN.some((ruta) => pathname === ruta || pathname.startsWith(ruta + '/'))
    if (esRutaAdmin && rol !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!api/auth|_next/static|_next/image|favicon.ico|logo.png).*)'],
}
