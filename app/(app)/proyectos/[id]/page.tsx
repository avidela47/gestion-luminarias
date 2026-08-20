'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, AlertTriangle, CheckCircle } from 'lucide-react'
import type { Proyecto } from '../page'

const estadoConfig: Record<string, { color: string; bg: string; label: string }> = {
  NUEVO: { color: 'var(--warning)', bg: 'var(--warning-bg)', label: 'NUEVO' },
  PREPARACION: { color: 'var(--info)', bg: 'var(--info-bg)', label: 'PREPARACIÓN' },
  FABRICACION: { color: 'var(--secondary)', bg: 'var(--info-bg)', label: 'FABRICACIÓN' },
  LISTO: { color: 'var(--success)', bg: 'var(--success-bg)', label: 'LISTO' },
}

export default function VerProyectoPage() {
  const { id } = useParams()
  const router = useRouter()
  const [proyecto, setProyecto] = useState<Proyecto | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    fetch(`/api/proyectos/${id}`)
      .then((r) => r.json())
      .then((data) => { if (data.ok) setProyecto(data.data) })
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div style={{ padding: '32px', color: 'var(--text-muted)' }}>Cargando...</div>
  if (!proyecto) return <div style={{ padding: '32px', color: 'var(--danger)' }}>Proyecto no encontrado</div>

  const cfg = estadoConfig[proyecto.estado]
  const totalSolicitado = proyecto.items.reduce((a, i) => a + i.cantidad_solicitada, 0)
  const totalCompletado = proyecto.items.reduce((a, i) => a + i.cantidad_completada, 0)
  const pct = totalSolicitado > 0 ? Math.round((totalCompletado / totalSolicitado) * 100) : 0

  return (
    <div style={{ padding: '32px', maxWidth: '900px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <button onClick={() => router.push('/proyectos')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '4px' }}>
          <ArrowLeft size={20} />
        </button>
        <div style={{ flex: 1 }}>
          <span style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)' }}>{proyecto.numero}</span>
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)', marginLeft: '12px' }}>{proyecto.cliente}</span>
        </div>
        <span style={{ fontSize: '12px', fontWeight: 700, padding: '4px 12px', borderRadius: '6px', backgroundColor: cfg.bg, color: cfg.color }}>
          {cfg.label}
        </span>
      </div>

      {proyecto.prioridad === 'URGENTE' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'var(--danger-bg)', color: 'var(--danger)', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, marginBottom: '16px' }}>
          <AlertTriangle size={16} /> Proyecto marcado como URGENTE
        </div>
      )}

      <div style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '10px', padding: '20px 24px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>Progreso general</span>
          <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--primary)' }}>{totalCompletado}/{totalSolicitado} ({pct}%)</span>
        </div>
        <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--border)', borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{ width: `${pct}%`, height: '100%', backgroundColor: pct === 100 ? 'var(--success)' : 'var(--primary)', transition: 'width 0.3s' }} />
        </div>
        {proyecto.tomado_por && (
          <div style={{ marginTop: '10px', fontSize: '12px', color: 'var(--text-secondary)' }}>
            Tomado por: <b style={{ color: 'var(--text-primary)' }}>{proyecto.tomado_por}</b>
          </div>
        )}
      </div>

      <div style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '10px', padding: '20px 24px' }}>
        <h2 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px' }}>Modelos</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <th style={{ textAlign: 'left', padding: '6px 0', color: 'var(--text-secondary)', fontWeight: 500 }}>Modelo</th>
              <th style={{ textAlign: 'right', padding: '6px 0', color: 'var(--text-secondary)', fontWeight: 500 }}>Completado</th>
              <th style={{ textAlign: 'right', padding: '6px 0', color: 'var(--text-secondary)', fontWeight: 500 }}>Solicitado</th>
            </tr>
          </thead>
          <tbody>
            {proyecto.items.map((it) => (
              <tr key={it.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '8px 0', fontWeight: 500, color: 'var(--text-primary)' }}>{it.modelo}</td>
                <td style={{ padding: '8px 0', textAlign: 'right', fontWeight: 600, color: it.cantidad_completada >= it.cantidad_solicitada ? 'var(--success)' : 'var(--text-primary)' }}>
                  {it.cantidad_completada}
                </td>
                <td style={{ padding: '8px 0', textAlign: 'right', color: 'var(--text-secondary)' }}>{it.cantidad_solicitada}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {proyecto.estado === 'LISTO' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'var(--success-bg)', color: 'var(--success)', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, marginTop: '16px' }}>
          <CheckCircle size={16} /> Proyecto completado — el stock ya fue acreditado
        </div>
      )}
    </div>
  )
}