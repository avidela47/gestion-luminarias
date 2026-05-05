'use client'

import { useEffect, useState } from 'react'
import { BarChart3, TrendingUp, Package, Users, Factory, DollarSign } from 'lucide-react'

interface ReporteData {
  // Producción
  totalProducciones: number
  unidadesFabricadas: number
  produccionPorLuminaria: { _id: string; total: number; lotes: number }[]
  produccionPorMes: { _id: { year: number; month: number }; total: number; lotes: number }[]
  // Stock
  componentesBajoMinimo: { id_componente: string; nombre: string; stock_actual: number; stock_minimo: number }[]
  // Clientes
  totalClientes: number
  // Recibos
  totalRecibos: number
  totalFacturadoUsd: number
  totalCobradoUsd: number
  totalSaldoUsd: number
  recibosPorEstado: { _id: string; total: number; monto: number }[]
  // Presupuestos
  presupuestosPorEstado: { _id: string; total: number; monto: number }[]
}

const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

function StatCard({ titulo, valor, subtitulo, icon: Icon, color }: {
  titulo: string; valor: string | number; subtitulo?: string; icon: React.ElementType; color: string
}) {
  return (
    <div style={{
      backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)',
      borderRadius: '10px', padding: '20px 24px',
      display: 'flex', alignItems: 'flex-start', gap: '16px',
    }}>
      <div style={{
        width: '44px', height: '44px', borderRadius: '10px',
        backgroundColor: color + '18',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <Icon size={22} color={color} strokeWidth={1.8} />
      </div>
      <div>
        <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '4px' }}>{titulo}</div>
        <div style={{ fontSize: '26px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>{valor}</div>
        {subtitulo && <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>{subtitulo}</div>}
      </div>
    </div>
  )
}

export default function ReportesPage() {
  const [data, setData] = useState<ReporteData | null>(null)
  const [loading, setLoading] = useState(true)
  const [periodo, setPeriodo] = useState('6')

  useEffect(() => {
    fetch(`/api/reportes?meses=${periodo}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.ok) setData(res.data)
        setLoading(false)
      })
  }, [periodo])

  if (loading) return <div style={{ padding: '32px', color: 'var(--text-muted)' }}>Cargando reportes...</div>
  if (!data) return <div style={{ padding: '32px', color: 'var(--danger)' }}>Error al cargar reportes</div>

  const maxProd = Math.max(...data.produccionPorMes.map((m) => m.total), 1)

  return (
    <div style={{ padding: '32px', maxWidth: '1200px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)' }}>Reportes</h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Resumen ejecutivo del sistema
          </p>
        </div>
        <select
          value={periodo}
          onChange={(e) => { setPeriodo(e.target.value); setLoading(true) }}
          style={{
            padding: '8px 12px', border: '1px solid var(--border)', borderRadius: '8px',
            fontSize: '13px', backgroundColor: 'var(--input-bg)', color: 'var(--text-primary)', outline: 'none',
          }}
        >
          <option value="3">Últimos 3 meses</option>
          <option value="6">Últimos 6 meses</option>
          <option value="12">Últimos 12 meses</option>
        </select>
      </div>

      {/* Tarjetas principales */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '28px' }}>
        <StatCard titulo="Unidades fabricadas" valor={data.unidadesFabricadas} subtitulo={`en ${data.totalProducciones} lotes`} icon={Factory} color="var(--primary)" />
        <StatCard titulo="Clientes activos" valor={data.totalClientes} icon={Users} color="var(--secondary)" />
        <StatCard titulo="Total facturado" valor={`U$S ${data.totalFacturadoUsd.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`} subtitulo={`${data.totalRecibos} recibos`} icon={DollarSign} color="var(--success)" />
        <StatCard titulo="Saldo pendiente" valor={`U$S ${data.totalSaldoUsd.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`} subtitulo="por cobrar" icon={TrendingUp} color="var(--warning)" />
        <StatCard titulo="Bajo stock mínimo" valor={data.componentesBajoMinimo.length} subtitulo="componentes a reponer" icon={Package} color="var(--danger)" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>

        {/* Gráfico producción por mes */}
        <div style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '10px', padding: '20px 24px' }}>
          <h2 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BarChart3 size={16} color="var(--primary)" /> Producción por mes
          </h2>
          {data.produccionPorMes.length === 0 ? (
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Sin datos en el período</p>
          ) : (
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '160px' }}>
              {data.produccionPorMes.map((m, i) => (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', height: '100%', justifyContent: 'flex-end' }}>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-primary)' }}>{m.total}</div>
                  <div style={{
                    width: '40%', borderRadius: '4px 4px 0 0',
                    backgroundColor: 'var(--primary)',
                    height: `${Math.max((m.total / maxProd) * 120, 4)}px`,
                    opacity: 0.85,
                  }} />
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                    {MESES[m._id.month - 1]}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top luminarias */}
        <div style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '10px', padding: '20px 24px' }}>
          <h2 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Factory size={16} color="var(--secondary)" /> Top luminarias fabricadas
          </h2>
          {data.produccionPorLuminaria.length === 0 ? (
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Sin datos en el período</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ textAlign: 'left', padding: '6px 0', color: 'var(--text-secondary)', fontWeight: 500 }}>Código</th>
                  <th style={{ textAlign: 'right', padding: '6px 0', color: 'var(--text-secondary)', fontWeight: 500 }}>Unidades</th>
                  <th style={{ textAlign: 'right', padding: '6px 0', color: 'var(--text-secondary)', fontWeight: 500 }}>Lotes</th>
                </tr>
              </thead>
              <tbody>
                {data.produccionPorLuminaria.slice(0, 8).map((l) => (
                  <tr key={l._id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '8px 0', fontWeight: 600, color: 'var(--primary)' }}>{l._id}</td>
                    <td style={{ padding: '8px 0', textAlign: 'right', fontWeight: 700 }}>{l.total}</td>
                    <td style={{ padding: '8px 0', textAlign: 'right', color: 'var(--text-secondary)' }}>{l.lotes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>

        {/* Recibos por estado */}
        <div style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '10px', padding: '20px 24px' }}>
          <h2 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <DollarSign size={16} color="var(--success)" /> Recibos por estado
          </h2>
          {data.recibosPorEstado.length === 0 ? (
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Sin recibos registrados</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ textAlign: 'left', padding: '6px 0', color: 'var(--text-secondary)', fontWeight: 500 }}>Estado</th>
                  <th style={{ textAlign: 'right', padding: '6px 0', color: 'var(--text-secondary)', fontWeight: 500 }}>Cantidad</th>
                  <th style={{ textAlign: 'right', padding: '6px 0', color: 'var(--text-secondary)', fontWeight: 500 }}>Total U$S</th>
                </tr>
              </thead>
              <tbody>
                {data.recibosPorEstado.map((r) => (
                  <tr key={r._id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '8px 0', fontWeight: 500 }}>{r._id}</td>
                    <td style={{ padding: '8px 0', textAlign: 'right' }}>{r.total}</td>
                    <td style={{ padding: '8px 0', textAlign: 'right', fontWeight: 600, color: 'var(--success)' }}>
                      {r.monto.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Componentes bajo mínimo */}
        <div style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '10px', padding: '20px 24px' }}>
          <h2 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Package size={16} color="var(--danger)" /> Componentes a reponer
          </h2>
          {data.componentesBajoMinimo.length === 0 ? (
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>✓ Todos los componentes tienen stock suficiente</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ textAlign: 'left', padding: '6px 0', color: 'var(--text-secondary)', fontWeight: 500 }}>Código</th>
                  <th style={{ textAlign: 'right', padding: '6px 0', color: 'var(--text-secondary)', fontWeight: 500 }}>Stock</th>
                  <th style={{ textAlign: 'right', padding: '6px 0', color: 'var(--text-secondary)', fontWeight: 500 }}>Mínimo</th>
                </tr>
              </thead>
              <tbody>
                {data.componentesBajoMinimo.map((c) => (
                  <tr key={c.id_componente} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '8px 0' }}>
                      <div style={{ fontWeight: 600, color: 'var(--danger)' }}>{c.id_componente}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{c.nombre}</div>
                    </td>
                    <td style={{ padding: '8px 0', textAlign: 'right', fontWeight: 700, color: 'var(--danger)' }}>{c.stock_actual}</td>
                    <td style={{ padding: '8px 0', textAlign: 'right', color: 'var(--text-secondary)' }}>{c.stock_minimo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}