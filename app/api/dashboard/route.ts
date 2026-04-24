import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/mongoose'
import Componente from '@/models/Componente'
import Produccion from '@/models/Produccion'
import Movimiento from '@/models/Movimiento'

export async function GET() {
  try {
    await connectDB()

    const hoy = new Date()
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1)

    // Total de componentes activos
    const totalComponentes = await Componente.countDocuments({ activo: true })

    // Componentes bajo stock mínimo
    const bajoMinimo = await Componente.find({
      activo: true,
      $expr: { $lt: ['$stock_actual', '$stock_minimo'] },
    }).sort({ id_componente: 1 })

    // Producciones del mes
    const produccionesMes = await Produccion.countDocuments({
      createdAt: { $gte: inicioMes },
    })

    // Últimas 5 producciones
    const ultimasProducciones = await Produccion.find()
      .sort({ createdAt: -1 })
      .limit(5)

    // Producción por mes (últimos 6 meses)
    const seisMesesAtras = new Date(hoy.getFullYear(), hoy.getMonth() - 5, 1)
    const produccionPorMes = await Produccion.aggregate([
      { $match: { createdAt: { $gte: seisMesesAtras } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          total: { $sum: '$cantidad' },
          lotes: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ])

    // Luminaria más fabricada (último mes)
    const topLuminaria = await Produccion.aggregate([
      { $match: { createdAt: { $gte: inicioMes } } },
      {
        $group: {
          _id: '$codigo_luminaria',
          total: { $sum: '$cantidad' },
        },
      },
      { $sort: { total: -1 } },
      { $limit: 1 },
    ])

    // Últimos 10 movimientos
    const ultimosMovimientos = await Movimiento.find()
      .sort({ createdAt: -1 })
      .limit(10)

    return NextResponse.json({
      ok: true,
      data: {
        totalComponentes,
        bajoMinimo,
        produccionesMes,
        ultimasProducciones,
        produccionPorMes,
        topLuminaria: topLuminaria[0] || null,
        ultimosMovimientos,
      },
    })
  } catch {
    return NextResponse.json({ ok: false, error: 'Error al obtener datos del dashboard' }, { status: 500 })
  }
}