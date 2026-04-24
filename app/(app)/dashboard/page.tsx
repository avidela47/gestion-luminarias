'use client'

import { useEffect, useState } from 'react'
import {
  Package,
  AlertTriangle,
  Factory,
  TrendingUp,
} from 'lucide-react'

interface DashboardData {
  totalComponentes: number
  bajoMinimo: Array<{
    id_componente: string
    nombre: string
    stock_actual: number
    stock_minimo: number
  }>
  produccionesMes: number
  ultimasProducciones: Array<{
    id_produccion: string
    codigo_luminaria: string
    cantidad: number
    operario: string
    createdAt: string
  }>
  topLuminaria: { _id: string; total: number } | null
}

function StatCard({
  titulo,
  valor,
  subtitulo,
  icon: Icon,
  color,
}: {
  titulo: string
  valor: string | number
  subtitulo?: string
  icon: React.ElementType
  color: string
}) {
  return (
    <div
      style={{
        backgroundColor: 'var(--card-bg)',
        border: '1px solid var(--card-border)',
        borderRadius: '10px',
        padding: '20px 24px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '16px',
      }}
    >
      <div
        style={{
          width: '44px',
          height: '44px',
          borderRadius: '10px',
          backgroundColor: color + '18',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Icon size={22} color={color} strokeWidth={1.8} />
      </div>
      <div>
        <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
          {titulo}
        </div>
        <div style={{ fontSize: '26px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>
          {valor}
        </div>
        {subtitulo && (
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
            {subtitulo}
          </div>
        )}
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/dashboard')
      .then((r) => r.json())
      .then((res) => {
        if (res.ok) setData(res.data)
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div style={{ padding: '32px', color: 'var(--text-secondary)' }}>
        Cargando...
      </div>
    )
  }

  return (
    <div style={{ padding: '32px', maxWidth: '1200px' }}>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)' }}>
          Dashboard
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
          Resumen general del sistema
        </p>
      </div>

      {/* Tarjetas */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
          marginBottom: '28px',
        }}
      >
        <StatCard
          titulo="Componentes activos"
          valor={data?.totalComponentes ?? 0}
          subtitulo="en catálogo"
          icon={Package}
          color="var(--primary)"
        />
        <StatCard
          titulo="Bajo stock mínimo"
          valor={data?.bajoMinimo.length ?? 0}
          subtitulo="requieren reposición"
          icon={AlertTriangle}
          color="var(--warning)"
        />
        <StatCard
          titulo="Producciones del mes"
          valor={data?.produccionesMes ?? 0}
          subtitulo="lotes fabricados"
          icon={Factory}
          color="var(--secondary)"
        />
        <StatCard
          titulo="Top luminaria"
          valor={data?.topLuminaria?._id ?? '—'}
          subtitulo={
            data?.topLuminaria ? `${data.topLuminaria.total} unidades este mes` : 'sin datos'
          }
          icon={TrendingUp}
          color="var(--success)"
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        {/* Componentes bajo mínimo */}
        <div
          style={{
            backgroundColor: 'var(--card-bg)',
            border: '1px solid var(--card-border)',
            borderRadius: '10px',
            padding: '20px 24px',
          }}
        >
          <h2
            style={{
              fontSize: '14px',
              fontWeight: 600,
              color: 'var(--text-primary)',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <AlertTriangle size={16} color="var(--warning)" />
            Componentes a reponer
          </h2>
          {data?.bajoMinimo.length === 0 ? (
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              ✓ Todos los componentes tienen stock suficiente
            </p>
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
                {data?.bajoMinimo.map((c) => (
                  <tr key={c.id_componente} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '8px 0' }}>
                      <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{c.id_componente}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{c.nombre}</div>
                    </td>
                    <td style={{ textAlign: 'right', padding: '8px 0', color: 'var(--danger)', fontWeight: 600 }}>
                      {c.stock_actual}
                    </td>
                    <td style={{ textAlign: 'right', padding: '8px 0', color: 'var(--text-secondary)' }}>
                      {c.stock_minimo}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Últimas producciones */}
        <div
          style={{
            backgroundColor: 'var(--card-bg)',
            border: '1px solid var(--card-border)',
            borderRadius: '10px',
            padding: '20px 24px',
          }}
        >
          <h2
            style={{
              fontSize: '14px',
              fontWeight: 600,
              color: 'var(--text-primary)',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <Factory size={16} color="var(--secondary)" />
            Últimas producciones
          </h2>
          {data?.ultimasProducciones.length === 0 ? (
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              No hay producciones registradas
            </p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ textAlign: 'left', padding: '6px 0', color: 'var(--text-secondary)', fontWeight: 500 }}>Luminaria</th>
                  <th style={{ textAlign: 'right', padding: '6px 0', color: 'var(--text-secondary)', fontWeight: 500 }}>Cant.</th>
                  <th style={{ textAlign: 'right', padding: '6px 0', color: 'var(--text-secondary)', fontWeight: 500 }}>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {data?.ultimasProducciones.map((p) => (
                  <tr key={p.id_produccion} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '8px 0' }}>
                      <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{p.codigo_luminaria}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{p.operario}</div>
                    </td>
                    <td style={{ textAlign: 'right', padding: '8px 0', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {p.cantidad}
                    </td>
                    <td style={{ textAlign: 'right', padding: '8px 0', color: 'var(--text-secondary)' }}>
                      {new Date(p.createdAt).toLocaleDateString('es-AR')}
                    </td>
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