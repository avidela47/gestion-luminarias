import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/mongoose'
import Produccion from '@/models/Produccion'
import Componente from '@/models/Componente'
import Cliente from '@/models/Cliente'
import Recibo from '@/models/Recibo'

export async function GET(req: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(req.url)
    const meses = parseInt(searchParams.get('meses') ?? '6')

    const hoy = new Date()
    const inicio = new Date(hoy.getFullYear(), hoy.getMonth() - (meses - 1), 1)

    // Producción
    const producciones = await Produccion.find({ createdAt: { $gte: inicio } })
    const totalProducciones = producciones.length
    const unidadesFabricadas = producciones.reduce((acc, p) => acc + p.cantidad, 0)

    const produccionPorLuminaria = await Produccion.aggregate([
      { $match: { createdAt: { $gte: inicio } } },
      { $group: { _id: '$codigo_luminaria', total: { $sum: '$cantidad' }, lotes: { $sum: 1 } } },
      { $sort: { total: -1 } },
    ])

    const produccionPorMes = await Produccion.aggregate([
      { $match: { createdAt: { $gte: inicio } } },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          total: { $sum: '$cantidad' },
          lotes: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ])

    // Stock bajo mínimo
    const componentesBajoMinimo = await Componente.find({
      activo: true,
      $expr: { $lt: ['$stock_actual', '$stock_minimo'] },
    }).sort({ id_componente: 1 })

    // Clientes
    const totalClientes = await Cliente.countDocuments({ activo: true })

    // Recibos
    const recibos = await Recibo.find()
    const totalRecibos = recibos.length
    const totalFacturadoUsd = recibos.reduce((acc, r) => acc + r.total_usd, 0)
    const totalCobradoUsd = recibos.reduce((acc, r) => acc + r.total_pagado_usd, 0)
    const totalSaldoUsd = recibos.reduce((acc, r) => acc + r.saldo_usd, 0)

    const recibosPorEstado = await Recibo.aggregate([
      {
        $group: {
          _id: '$estado',
          total: { $sum: 1 },
          monto: { $sum: '$total_usd' },
        },
      },
      { $sort: { total: -1 } },
    ])

    return NextResponse.json({
      ok: true,
      data: {
        totalProducciones,
        unidadesFabricadas,
        produccionPorLuminaria,
        produccionPorMes,
        componentesBajoMinimo,
        totalClientes,
        totalRecibos,
        totalFacturadoUsd,
        totalCobradoUsd,
        totalSaldoUsd,
        recibosPorEstado,
      },
    })
  } catch {
    return NextResponse.json({ ok: false, error: 'Error al generar reportes' }, { status: 500 })
  }
}