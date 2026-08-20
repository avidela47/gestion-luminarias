'use client'
import { useEffect, useState } from 'react'
import { Plus, Eye, Trash2, ClipboardList } from 'lucide-react'
import { useRouter } from 'next/navigation'

export interface Proyecto {
  _id: string
  numero: string
  cliente: string
  nombre: string
  fecha_objetivo: string | null
  prioridad: 'NORMAL' | 'URGENTE'
  estado: 'NUEVO' | 'PREPARACION' | 'FABRICACION' | 'LISTO'
  items: { id: string; modelo: string; cantidad_solicitada: number; cantidad_completada: number }[]
  tomado_por: string | null
  createdAt: string
}

const estadoConfig: Record<string, { color: string; bg: string; label: string }> = {
  NUEVO: { color: 'var(--warning)', bg: 'var(--warning-bg)', label: 'NUEVO' },
  PREPARACION: { color: 'var(--info)', bg: 'var(--info-bg)', label: 'PREPARACIÓN' },
  FABRICACION: { color: 'var(--secondary)', bg: 'var(--info-bg)', label: 'FABRICACIÓN' },
  LISTO: { color: 'var(--success)', bg: 'var(--success-bg)', label: 'LISTO' },
}

export default function ProyectosPage() {
  const router = useRouter()
  const [proyectos, setProyectos] = useState<Proyecto[]>([])
  const [loading, setLoading] = useState(true)
  const [confirmarEliminar, setConfirmarEliminar] = useState<string | null>(null)

  const cargar = () => {
    fetch('/api/proyectos')
      .then((r) => r.json())
      .then((data) => { if (data.ok) setProyectos(data.data) })
      .finally(() => setLoading(false))
  }

  useEffect(() => { cargar() }, [])

  const eliminar = async (id: string) => {
    await fetch(`/api/proyectos/${id}`, { method: 'DELETE' })
    setConfirmarEliminar(null)
    cargar()
  }

  const totalCompletado = (p: Proyecto) => p.items.reduce((a, i) => a + i.cantidad_completada, 0)
  const totalSolicitado = (p: Proyecto) => p.items.reduce((a, i) => a + i.cantidad_solicitada, 0)

  return (
    <div style={{ padding: '32px', maxWidth: '1200px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)' }}>Proyectos de Fábrica</h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Avisos de producción coordinados con el taller
          </p>
        </div>
        <button onClick={() => router.push('/proyectos/crear')}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            backgroundColor: 'var(--primary)', color: '#fff',
            border: 'none', borderRadius: '8px',
            padding: '9px 16px', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
          }}>
          <Plus size={16} /> Nuevo proyecto
        </button>
      </div>

      <div style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '10px', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Cargando...</div>
        ) : proyectos.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <ClipboardList size={32} style={{ marginBottom: '8px', opacity: 0.4 }} />
            <div>No hay proyectos registrados aún</div>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid var(--border)' }}>
                {['Número', 'Cliente', 'Prioridad', 'Progreso', 'Tomado por', 'Estado', 'Acciones'].map((h) => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {proyectos.map((p) => {
                const cfg = estadoConfig[p.estado]
                const completado = totalCompletado(p)
                const solicitado = totalSolicitado(p)
                const pct = solicitado > 0 ? Math.round((completado / solicitado) * 100) : 0
                return (
                  <tr key={p._id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '10px 16px', fontWeight: 600, color: 'var(--primary)' }}>{p.numero}</td>
                    <td style={{ padding: '10px 16px', color: 'var(--text-primary)' }}>{p.cliente}</td>
                    <td style={{ padding: '10px 16px' }}>
                      {p.prioridad === 'URGENTE' ? (
                        <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', backgroundColor: 'var(--danger-bg)', color: 'var(--danger)' }}>URGENTE</span>
                      ) : (
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Normal</span>
                      )}
                    </td>
                    <td style={{ padding: '10px 16px', color: 'var(--text-secondary)' }}>{completado}/{solicitado} ({pct}%)</td>
                    <td style={{ padding: '10px 16px', color: 'var(--text-secondary)' }}>{p.tomado_por || '—'}</td>
                    <td style={{ padding: '10px 16px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '6px', backgroundColor: cfg.bg, color: cfg.color }}>
                        {cfg.label}
                      </span>
                    </td>
                    <td style={{ padding: '10px 16px' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => router.push(`/proyectos/${p._id}`)} title="Ver"
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', padding: '4px' }}>
                          <Eye size={15} />
                        </button>
                        <button onClick={() => setConfirmarEliminar(p._id)} title="Eliminar"
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)', padding: '4px' }}>
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {confirmarEliminar && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ backgroundColor: 'var(--card-bg)', borderRadius: '12px', padding: '28px', maxWidth: '380px', width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>Eliminar proyecto</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '24px' }}>
              ¿Confirmás que querés eliminar este proyecto? Esta acción no se puede deshacer.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button onClick={() => setConfirmarEliminar(null)}
                style={{ padding: '8px 16px', borderRadius: '6px', fontSize: '13px', border: '1px solid var(--border)', backgroundColor: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                Cancelar
              </button>
              <button onClick={() => eliminar(confirmarEliminar)}
                style={{ padding: '8px 20px', borderRadius: '6px', fontSize: '13px', fontWeight: 600, border: 'none', backgroundColor: 'var(--danger)', color: '#fff', cursor: 'pointer' }}>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}