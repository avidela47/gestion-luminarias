import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/mongoose'
import Componente from '@/models/Componente'
import Produccion from '@/models/Produccion'
import Movimiento from '@/models/Movimiento'
import SensorFuente from '@/models/SensorFuente'
import Herramienta from '@/models/Herramienta'
import Vale from '@/models/Vale'

export async function GET() {
  try {
    await connectDB()
    const hoy = new Date()
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1)
    const seisMesesAtras = new Date(hoy.getFullYear(), hoy.getMonth() - 5, 1)

    const [
      totalComponentes,
      bajoMinimo,
      produccionesMes,
      ultimasProducciones,
      produccionPorMes,
      topLuminaria,
      ultimosMovimientos,
      totalSensores,
      sensoresBajoMinimo,
      totalHerramientas,
      herramientasNoDisponibles,
      valesAbiertos,
    ] = await Promise.all([
      Componente.countDocuments({ activo: true }),
      Componente.find({ activo: true, $expr: { $lt: ['$stock_actual', '$stock_minimo'] } }).sort({ id_componente: 1 }),
      Produccion.countDocuments({ createdAt: { $gte: inicioMes } }),
      Produccion.find().sort({ createdAt: -1 }).limit(5),
      Produccion.aggregate([
        { $match: { createdAt: { $gte: seisMesesAtras } } },
        { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, total: { $sum: '$cantidad' }, lotes: { $sum: 1 } } },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
      ]),
      Produccion.aggregate([
        { $match: { createdAt: { $gte: inicioMes } } },
        { $group: { _id: '$codigo_luminaria', total: { $sum: '$cantidad' } } },
        { $sort: { total: -1 } },
        { $limit: 1 },
      ]),
      Movimiento.find().sort({ createdAt: -1 }).limit(10),
      SensorFuente.countDocuments({ activo: true }),
      SensorFuente.find({ activo: true, $expr: { $lt: ['$stock_actual', '$stock_minimo'] } }).sort({ codigo: 1 }).limit(10),
      Herramienta.countDocuments({ activo: true }),
      Herramienta.find({ activo: true, estado: { $in: ['en_uso', 'reparacion'] } }).sort({ nombre: 1 }),
      Vale.find({ estado: { $in: ['abierto', 'devolucion_parcial'] } }).sort({ createdAt: -1 }).limit(5),
    ])

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
        totalSensores,
        sensoresBajoMinimo,
        totalHerramientas,
        herramientasNoDisponibles,
        valesAbiertos,
      },
    })
  } catch {
    return NextResponse.json({ ok: false, error: 'Error al obtener datos del dashboard' }, { status: 500 })
  }
}