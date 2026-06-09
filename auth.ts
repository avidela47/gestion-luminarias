import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { connectDB } from '@/lib/db/mongoose'
import Usuario from '@/models/Usuario'
import bcrypt from 'bcryptjs'

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        username: { label: 'Usuario', type: 'text' },
        password: { label: 'Contraseña', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null

        await connectDB()
        const usuario = await Usuario.findOne({
          username: (credentials.username as string).toLowerCase(),
          activo: true,
        })

        if (!usuario) return null

        const ok = await bcrypt.compare(credentials.password as string, usuario.password)
        if (!ok) return null

        return {
          id: usuario._id.toString(),
          name: usuario.nombre,
          email: usuario.username,
          rol: usuario.rol,
        }
      },
    }),
  ],
  pages: { signIn: '/login' },
  session: { strategy: 'jwt' },
  secret: process.env.AUTH_SECRET,
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.rol = (user as { rol?: string }).rol
        token.id = user.id
      }
      return token
    },
    session({ session, token }) {
      if (session.user) {
        (session.user as { rol?: string; id?: string }).rol = token.rol as string
        ;(session.user as { id?: string }).id = token.id as string
      }
      return session
    },
  },
})