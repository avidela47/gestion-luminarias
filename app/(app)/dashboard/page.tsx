'use client'

import { useEffect, useState } from 'react'
import { Package, AlertTriangle, Factory, TrendingUp, Zap, Wrench, ClipboardCheck, Lightbulb, ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'

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
  totalLuminariasFabricadas: number
  totalLuminariasComerciales: number
  totalLuminariasDeposito: number
}

const estadoValeLabel: Record<string, string> = { abierto: 'ABIERTO', devolucion_parcial: 'PARCIAL' }
const estadoValeColor: Record<string, { bg: string; color: string }> = {
  abierto: { bg: 'var(--warning-bg)', color: 'var(--warning)' },
  devolucion_parcial: { bg: 'var(--info-bg)', color: 'var(--info)' },
}
const estadoHerramientaColor: Record<string, { bg: string; color: string }> = {
  en_uso: { bg: 'var(--warning-bg)', color: 'var(--warning)' },
  reparacion: { bg: 'var(--danger-bg)', color: 'var(--danger)' },
}

function KpiCard({ titulo, valor, subtitulo, icon: Icon, color, href, router }: {
  titulo: string; valor: string | number; subtitulo?: string; icon: React.ElementType; color: string; href?: string; router?: ReturnType<typeof useRouter>
}) {
  return (
    <div
      onClick={() => href && router?.push(href)}
      style={{
        backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)',
        borderRadius: '12px', padding: '20px', cursor: href ? 'pointer' : 'default',
        transition: 'box-shadow 0.15s', display: 'flex', flexDirection: 'column', gap: '12px',
      }}
      onMouseEnter={(e) => { if (href) e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)' }}
      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={20} color={color} strokeWidth={1.8} />
        </div>
        {href && <ArrowRight size={14} color="var(--text-muted)" />}
      </div>
      <div>
        <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>{valor}</div>
        <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px', fontWeight: 500 }}>{titulo}</div>
        {subtitulo && <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{subtitulo}</div>}
      </div>
    </div>
  )
}

function AlertaBadge({ count, label }: { count: number; label: string }) {
  if (count === 0) return null
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '4px',
      backgroundColor: 'var(--danger-bg)', color: 'var(--danger)',
      fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '20px',
    }}>
      <AlertTriangle size={10} /> {count} {label}
    </span>
  )
}

function SectionCard({ title, icon: Icon, color, children, empty, emptyMsg }: {
  title: string; icon: React.ElementType; color: string; children?: React.ReactNode; empty: boolean; emptyMsg: string
}) {
  return (
    <div style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '12px', overflow: 'hidden' }}>
      <div style={{ padding: '16px 20px', borderBottom: empty ? 'none' : '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ width: '28px', height: '28px', borderRadius: '8px', backgroundColor: color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={14} color={color} strokeWidth={2} />
        </div>
        <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>{title}</span>
      </div>
      {empty ? (
        <div style={{ padding: '20px', fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ color: 'var(--success)', fontWeight: 700 }}>✓</span> {emptyMsg}
        </div>
      ) : children}
    </div>
  )
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetch('/api/dashboard')
      .then((r) => r.json())
      .then((res) => { if (res.ok) setData(res.data) })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div style={{ padding: '32px', color: 'var(--text-secondary)' }}>Cargando...</div>

  const totalAlertasComponentes = data?.bajoMinimo.length ?? 0
  const totalAlertasSensores = data?.sensoresBajoMinimo.length ?? 0

  return (
    <div style={{ padding: '32px', maxWidth: '1280px' }}>
      <div style={{ marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)' }}>Dashboard</h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            {new Date().toLocaleDateString('es-AR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {totalAlertasComponentes > 0 && <AlertaBadge count={totalAlertasComponentes} label="componentes" />}
          {totalAlertasSensores > 0 && <AlertaBadge count={totalAlertasSensores} label="sensores" />}
          {(data?.valesAbiertos.length ?? 0) > 0 && <AlertaBadge count={data?.valesAbiertos.length ?? 0} label="vales" />}
        </div>
      </div>

      {/* KPIs — fila 1 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '16px' }}>
        <KpiCard titulo="Componentes activos" valor={data?.totalComponentes ?? 0} subtitulo={totalAlertasComponentes > 0 ? `${totalAlertasComponentes} bajo mínimo` : 'Todo en orden'} icon={Package} color="var(--primary)" href="/componentes" router={router} />
        <KpiCard titulo="Producciones del mes" valor={data?.produccionesMes ?? 0} subtitulo="lotes fabricados" icon={Factory} color="var(--secondary)" href="/fabricar" router={router} />
        <KpiCard titulo="Top luminaria del mes" valor={data?.topLuminaria?._id ?? '—'} subtitulo={data?.topLuminaria ? `${data.topLuminaria.total} unidades` : 'sin datos'} icon={TrendingUp} color="var(--success)" />
        <KpiCard titulo="Vales pendientes" valor={data?.valesAbiertos.length ?? 0} subtitulo="de cierre" icon={ClipboardCheck} color="var(--danger)" href="/vales" router={router} />
      </div>

      {/* KPIs — fila 2 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <KpiCard titulo="Sensores y Fuentes" valor={data?.totalSensores ?? 0} subtitulo={totalAlertasSensores > 0 ? `${totalAlertasSensores} bajo mínimo` : 'Todo en orden'} icon={Zap} color="var(--info)" href="/sensores" router={router} />
        <KpiCard titulo="Herramientas" valor={data?.totalHerramientas ?? 0} subtitulo={`${data?.herramientasNoDisponibles.length ?? 0} no disponibles`} icon={Wrench} color="#8b5cf6" href="/herramientas" router={router} />

        {/* Card luminarias — ocupa 2 columnas */}
        <div style={{
          gridColumn: 'span 2',
          backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)',
          borderRadius: '12px', padding: '20px', cursor: 'pointer',
          transition: 'box-shadow 0.15s',
        }}
          onClick={() => router.push('/luminarias')}
          onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)' }}
          onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'var(--primary)18', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Lightbulb size={20} color="var(--primary)" strokeWidth={1.8} />
              </div>
              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>Stock de Luminarias</span>
            </div>
            <ArrowRight size={14} color="var(--text-muted)" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
            {[
              { label: 'Fabricadas', valor: data?.totalLuminariasFabricadas ?? 0, color: 'var(--success)' },
              { label: 'Importadas', valor: data?.totalLuminariasComerciales ?? 0, color: 'var(--info)' },
              { label: 'Depósito', valor: data?.totalLuminariasDeposito ?? 0, color: '#8b5cf6' },
            ].map((item) => (
              <div key={item.label} style={{ backgroundColor: 'var(--input-bg)', borderRadius: '8px', padding: '12px 16px' }}>
                <div style={{ fontSize: '24px', fontWeight: 800, color: item.color, lineHeight: 1 }}>{item.valor}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', fontWeight: 500 }}>{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Alertas + Producción */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>

        <SectionCard title="Componentes a reponer" icon={AlertTriangle} color="var(--warning)" empty={totalAlertasComponentes === 0} emptyMsg="Todo en orden">
          <div style={{ maxHeight: '240px', overflowY: 'auto' }}>
            {data?.bajoMinimo.map((c) => (
              <div key={c.id_componente} style={{ padding: '10px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>{c.id_componente}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{c.nombre}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--danger)' }}>{c.stock_actual}</div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>mín {c.stock_minimo}</div>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Sensores/Fuentes a reponer" icon={Zap} color="var(--info)" empty={totalAlertasSensores === 0} emptyMsg="Todo en orden">
          <div style={{ maxHeight: '240px', overflowY: 'auto' }}>
            {data?.sensoresBajoMinimo.map((s) => (
              <div key={s.codigo} style={{ padding: '10px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>{s.codigo}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{s.descripcion}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--danger)' }}>{s.stock_actual}</div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>mín {s.stock_minimo}</div>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Últimas producciones" icon={Factory} color="var(--secondary)" empty={(data?.ultimasProducciones.length ?? 0) === 0} emptyMsg="Sin producciones registradas">
          <div>
            {data?.ultimasProducciones.map((p) => (
              <div key={p.id_produccion} style={{ padding: '10px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>{p.codigo_luminaria}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{p.operario}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>{p.cantidad}</div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{new Date(p.createdAt).toLocaleDateString('es-AR')}</div>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      {/* Herramientas + Vales */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>

        <SectionCard title="Herramientas no disponibles" icon={Wrench} color="#8b5cf6" empty={(data?.herramientasNoDisponibles.length ?? 0) === 0} emptyMsg="Todas disponibles">
          <div>
            {data?.herramientasNoDisponibles.map((h) => {
              const cfg = estadoHerramientaColor[h.estado] ?? { bg: 'var(--info-bg)', color: 'var(--info)' }
              return (
                <div key={h.codigo} style={{ padding: '10px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>{h.nombre}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{h.codigo}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', backgroundColor: cfg.bg, color: cfg.color }}>
                      {h.estado.replace('_', ' ').toUpperCase()}
                    </span>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: h.cantidad_disponible === 0 ? 'var(--danger)' : 'var(--warning)' }}>
                      {h.cantidad_disponible}/{h.cantidad_total}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </SectionCard>

        <SectionCard title="Vales pendientes de cierre" icon={ClipboardCheck} color="var(--danger)" empty={(data?.valesAbiertos.length ?? 0) === 0} emptyMsg="No hay vales pendientes">
          <div>
            {data?.valesAbiertos.map((v) => {
              const cfg = estadoValeColor[v.estado] ?? { bg: 'var(--info-bg)', color: 'var(--info)' }
              const pendiente = v.items.reduce((acc, i) => acc + (i.cantidad_salida - i.cantidad_devuelta), 0)
              return (
                <div key={v._id} style={{ padding: '10px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--primary)' }}>{v.numero}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{v.responsable} — {new Date(v.fecha_salida).toLocaleDateString('es-AR')}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', backgroundColor: cfg.bg, color: cfg.color }}>
                      {estadoValeLabel[v.estado]}
                    </span>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--danger)' }}>{pendiente} pend.</span>
                  </div>
                </div>
              )
            })}
          </div>
        </SectionCard>
      </div>
    </div>
  )
}