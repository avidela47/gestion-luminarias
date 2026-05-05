import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/mongoose'
import Recibo from '@/models/Recibo'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()
    const { id } = await params
    const body = await req.json()
    const { monto_usd, tipo_cambio, forma_pago, notas } = body

    if (!monto_usd || !tipo_cambio || !forma_pago) {
      return NextResponse.json({ ok: false, error: 'Datos incompletos' }, { status: 400 })
    }

    const recibo = await Recibo.findById(id)
    if (!recibo) {
      return NextResponse.json({ ok: false, error: 'Recibo no encontrado' }, { status: 404 })
    }
    if (recibo.estado === 'Cancelado') {
      return NextResponse.json({ ok: false, error: 'El recibo ya está cancelado' }, { status: 400 })
    }
    if (monto_usd > recibo.saldo_usd) {
      return NextResponse.json({ ok: false, error: `El monto supera el saldo pendiente de U$S ${recibo.saldo_usd.toFixed(2)}` }, { status: 400 })
    }

    const monto_pesos = Math.round(monto_usd * tipo_cambio * 100) / 100
    const nuevo_total_pagado = Math.round((recibo.total_pagado_usd + monto_usd) * 100) / 100
    const nuevo_saldo = Math.round((recibo.total_usd - nuevo_total_pagado) * 100) / 100
    const nuevo_estado = nuevo_saldo <= 0 ? 'Cancelado' : 'Pago parcial'

    const reciboActualizado = await Recibo.findByIdAndUpdate(
      id,
      {
        $push: {
          pagos: {
            fecha: new Date(),
            monto_usd,
            tipo_cambio,
            monto_pesos,
            forma_pago,
            notas: notas || '',
          }
        },
        $set: {
          total_pagado_usd: nuevo_total_pagado,
          saldo_usd: nuevo_saldo,
          estado: nuevo_estado,
        }
      },
      { new: true }
    )

    return NextResponse.json({ ok: true, data: reciboActualizado })
  } catch {
    return NextResponse.json({ ok: false, error: 'Error al registrar pago' }, { status: 500 })
  }
}