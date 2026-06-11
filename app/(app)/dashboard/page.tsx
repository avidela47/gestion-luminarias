'use client'

import { useEffect, useState } from 'react'
import { Package, AlertTriangle, Factory, TrendingUp, Zap, Wrench, ClipboardCheck } from 'lucide-react'

interface DashboardData {
  totalComponentes: number
  bajoMinimo: Array<{ id_componente: string; nombre: string; stock_actual: number; stock_minimo: number }>
  produccionesMes: number
  ultimasProducciones: Array<{ id_produccion: string; codigo_luminaria: string; cantidad: number; operario: string; createdAt: string }>
  topLuminaria: { _id: string; total: number } | null
  totalSensores: number
  sensoresBajoMinimo: Array<{ codigo: string; descripcion: string; stock_actual: number; stock_minimo: number }>
  totalHerramientas: number
  herramientasNoDisponibles: Array<{ codigo: string; nombre: string; estado: string; cantidad_total: number; cantidad_disponible: number }>
  valesAbiertos: Array<{ _id: string; numero: string; responsable: string; estado: string; fecha_salida: string; items: Array<{ descripcion: string; cantidad_salida: number; cantidad_devuelta: number }> }>
}

function StatCard({ titulo, valor, subtitulo, icon: Icon, color }: {
  titulo: string; valor: string | number; subtitulo?: string; icon: React.ElementType; color: string
}) {
  return (
    <div style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '10px', padding: '20px 24px', display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
      <div style={{ width: '44px', height: '44px', borderRadius: '10px', backgroundColor: color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
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

const estadoValeLabel: Record<string, string> = {
  abierto: 'ABIERTO',
  devolucion_parcial: 'PARCIAL',
}
const estadoValeColor: Record<string, { bg: string; color: string }> = {
  abierto: { bg: 'var(--warning-bg)', color: 'var(--warning)' },
  devolucion_parcial: { bg: 'var(--info-bg)', color: 'var(--info)' },
}
const estadoHerramientaColor: Record<string, { bg: string; color: string }> = {
  en_uso: { bg: 'var(--warning-bg)', color: 'var(--warning)' },
  reparacion: { bg: 'var(--danger-bg)', color: 'var(--danger)' },
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/dashboard')
      .then((r) => r.json())
      .then((res) => { if (res.ok) setData(res.data) })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div style={{ padding: '32px', color: 'var(--text-secondary)' }}>Cargando...</div>

  return (
    <div style={{ padding: '32px', maxWidth: '1200px' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)' }}>Dashboard</h1>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>Resumen general del sistema</p>
      </div>

      {/* Tarjetas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '28px' }}>
        <StatCard titulo="Componentes activos" valor={data?.totalComponentes ?? 0} subtitulo="en catálogo" icon={Package} color="var(--primary)" />
        <StatCard titulo="Componentes bajo mínimo" valor={data?.bajoMinimo.length ?? 0} subtitulo="requieren reposición" icon={AlertTriangle} color="var(--warning)" />
        <StatCard titulo="Producciones del mes" valor={data?.produccionesMes ?? 0} subtitulo="lotes fabricados" icon={Factory} color="var(--secondary)" />
        <StatCard titulo="Top luminaria" valor={data?.topLuminaria?._id ?? '—'} subtitulo={data?.topLuminaria ? `${data.topLuminaria.total} uds este mes` : 'sin datos'} icon={TrendingUp} color="var(--success)" />
        <StatCard titulo="Sensores y Fuentes" valor={data?.totalSensores ?? 0} subtitulo="productos activos" icon={Zap} color="var(--info)" />
        <StatCard titulo="Herramientas" valor={data?.totalHerramientas ?? 0} subtitulo={`${data?.herramientasNoDisponibles.length ?? 0} no disponibles`} icon={Wrench} color="#8b5cf6" />
        <StatCard titulo="Vales abiertos" valor={data?.valesAbiertos.length ?? 0} subtitulo="pendientes de cierre" icon={ClipboardCheck} color="var(--danger)" />
      </div>

      {/* Fila 1 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>

        {/* Componentes bajo mínimo */}
        <div style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '10px', padding: '20px 24px' }}>
          <h2 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={16} color="var(--warning)" /> Componentes a reponer
          </h2>
          {data?.bajoMinimo.length === 0 ? (
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
                {data?.bajoMinimo.map((c) => (
                  <tr key={c.id_componente} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '8px 0' }}>
                      <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{c.id_componente}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{c.nombre}</div>
                    </td>
                    <td style={{ textAlign: 'right', padding: '8px 0', color: 'var(--danger)', fontWeight: 600 }}>{c.stock_actual}</td>
                    <td style={{ textAlign: 'right', padding: '8px 0', color: 'var(--text-secondary)' }}>{c.stock_minimo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Últimas producciones */}
        <div style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '10px', padding: '20px 24px' }}>
          <h2 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Factory size={16} color="var(--secondary)" /> Últimas producciones
          </h2>
          {data?.ultimasProducciones.length === 0 ? (
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No hay producciones registradas</p>
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
                    <td style={{ textAlign: 'right', padding: '8px 0', fontWeight: 600, color: 'var(--text-primary)' }}>{p.cantidad}</td>
                    <td style={{ textAlign: 'right', padding: '8px 0', color: 'var(--text-secondary)' }}>{new Date(p.createdAt).toLocaleDateString('es-AR')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Fila 2 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>

        {/* Sensores bajo mínimo */}
        <div style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '10px', padding: '20px 24px' }}>
          <h2 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Zap size={16} color="var(--info)" /> Sensores/Fuentes a reponer
          </h2>
          {data?.sensoresBajoMinimo.length === 0 ? (
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>✓ Todos los sensores tienen stock suficiente</p>
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
                {data?.sensoresBajoMinimo.map((s) => (
                  <tr key={s.codigo} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '8px 0' }}>
                      <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{s.codigo}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{s.descripcion}</div>
                    </td>
                    <td style={{ textAlign: 'right', padding: '8px 0', color: 'var(--danger)', fontWeight: 600 }}>{s.stock_actual}</td>
                    <td style={{ textAlign: 'right', padding: '8px 0', color: 'var(--text-secondary)' }}>{s.stock_minimo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Herramientas no disponibles */}
        <div style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '10px', padding: '20px 24px' }}>
          <h2 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Wrench size={16} color="#8b5cf6" /> Herramientas no disponibles
          </h2>
          {data?.herramientasNoDisponibles.length === 0 ? (
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>✓ Todas las herramientas están disponibles</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ textAlign: 'left', padding: '6px 0', color: 'var(--text-secondary)', fontWeight: 500 }}>Herramienta</th>
                  <th style={{ textAlign: 'center', padding: '6px 0', color: 'var(--text-secondary)', fontWeight: 500 }}>Estado</th>
                  <th style={{ textAlign: 'right', padding: '6px 0', color: 'var(--text-secondary)', fontWeight: 500 }}>Disp.</th>
                </tr>
              </thead>
              <tbody>
                {data?.herramientasNoDisponibles.map((h) => {
                  const cfg = estadoHerramientaColor[h.estado] ?? { bg: 'var(--info-bg)', color: 'var(--info)' }
                  return (
                    <tr key={h.codigo} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '8px 0' }}>
                        <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{h.nombre}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{h.codigo}</div>
                      </td>
                      <td style={{ textAlign: 'center', padding: '8px 0' }}>
                        <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', backgroundColor: cfg.bg, color: cfg.color }}>
                          {h.estado.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right', padding: '8px 0', fontWeight: 600, color: h.cantidad_disponible === 0 ? 'var(--danger)' : 'var(--warning)' }}>
                        {h.cantidad_disponible}/{h.cantidad_total}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Fila 3 — Vales abiertos */}
      <div style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '10px', padding: '20px 24px' }}>
        <h2 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ClipboardCheck size={16} color="var(--danger)" /> Vales pendientes de cierre
        </h2>
        {data?.valesAbiertos.length === 0 ? (
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>✓ No hay vales pendientes</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={{ textAlign: 'left', padding: '6px 0', color: 'var(--text-secondary)', fontWeight: 500 }}>Número</th>
                <th style={{ textAlign: 'left', padding: '6px 0', color: 'var(--text-secondary)', fontWeight: 500 }}>Responsable</th>
                <th style={{ textAlign: 'center', padding: '6px 0', color: 'var(--text-secondary)', fontWeight: 500 }}>Estado</th>
                <th style={{ textAlign: 'right', padding: '6px 0', color: 'var(--text-secondary)', fontWeight: 500 }}>Fecha</th>
                <th style={{ textAlign: 'right', padding: '6px 0', color: 'var(--text-secondary)', fontWeight: 500 }}>Ítems</th>
              </tr>
            </thead>
            <tbody>
              {data?.valesAbiertos.map((v) => {
                const cfg = estadoValeColor[v.estado] ?? { bg: 'var(--info-bg)', color: 'var(--info)' }
                const totalPendiente = v.items.reduce((acc, i) => acc + (i.cantidad_salida - i.cantidad_devuelta), 0)
                return (
                  <tr key={v._id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '8px 0', fontWeight: 600, color: 'var(--primary)' }}>{v.numero}</td>
                    <td style={{ padding: '8px 0', color: 'var(--text-primary)' }}>{v.responsable}</td>
                    <td style={{ padding: '8px 0', textAlign: 'center' }}>
                      <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', backgroundColor: cfg.bg, color: cfg.color }}>
                        {estadoValeLabel[v.estado]}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right', padding: '8px 0', color: 'var(--text-secondary)' }}>
                      {new Date(v.fecha_salida).toLocaleDateString('es-AR')}
                    </td>
                    <td style={{ textAlign: 'right', padding: '8px 0', fontWeight: 600, color: 'var(--danger)' }}>
                      {totalPendiente} pendiente{totalPendiente !== 1 ? 's' : ''}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}