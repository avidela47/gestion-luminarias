import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/mongoose'
import AuditoriaLog from '@/models/AuditoriaLog'

export async function GET() {
  try {
    await connectDB()
    const logs = await AuditoriaLog.find().sort({ createdAt: -1 }).limit(500)
    return NextResponse.json({ ok: true, data: logs })
  } catch {
    return NextResponse.json({ ok: false, error: 'Error al obtener auditoría' }, { status: 500 })
  }
}