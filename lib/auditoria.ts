import { connectDB } from '@/lib/db/mongoose'
import AuditoriaLog from '@/models/AuditoriaLog'
import { auth } from '@/auth'
import { NextRequest } from 'next/server'

export async function registrarAuditoria({
  req,
  accion,
  modulo,
  detalle,
  dato_id,
}: {
  req: NextRequest
  accion: 'crear' | 'editar' | 'eliminar' | 'ver'
  modulo: string
  detalle: string
  dato_id?: string
}) {
  try {
    await connectDB()
    const session = await auth()
    if (!session?.user) return

    const user = session.user as { id?: string; name?: string; email?: string }
    const ip = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? ''

    await AuditoriaLog.create({
      usuario_id: user.id ?? '',
      usuario_nombre: user.name ?? '',
      usuario_username: user.email ?? '',
      accion,
      modulo,
      detalle,
      dato_id: dato_id ?? '',
      ip,
    })
  } catch (e) {
    console.error('[auditoria]', e)
  }
}