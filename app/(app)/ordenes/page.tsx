'use client'

import { useEffect, useState } from 'react'
import { Plus, Search, Trash2, ClipboardList, Eye } from 'lucide-react'
import { useRouter } from 'next/navigation'

export interface OrdenTrabajo {
  _id: string
  numero: string
  fecha: string
  fecha_entrega: string
  id_presupuesto: string
  numero_presupuesto: string
  id_cliente: string
  razon_social: string
  vendedor: string
  lineas: { codigo_luminaria: string; descripcion: string; cantidad: number; cantidad_stock: number; cantidad_fabricar: number }[]
  estado: string
  notas: string
  ejecutada: boolean
  fecha_ejecucion: string
}

const estadoConfig: Record<string, { color: string; bg: string }> = {
  Pendiente:    { color: 'var(--warning)',   bg: 'var(--warning-bg)' },
  'En proceso': { color: 'var(--secondary)', bg: 'var(--info-bg)' },
  Completada:   { color: 'var(--success)',   bg: 'var(--success-bg)' },
  Cancelada:    { color: 'var(--danger)',    bg: 'var(--danger-bg)' },
}

export default function OrdenesPage() {
  const router = useRouter()
  const [ordenes, setOrdenes] = useState<OrdenTrabajo[]>([])
  const [loading, setLoading] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [confirmarEliminar, setConfirmarEliminar] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/ordenes')
      .then((r) => r.json())
      .then((data) => {
        if (data.ok) setOrdenes(data.data)
        setLoading(false)
      })
  }, [])

  const cargarOrdenes = () => {
    fetch('/api/ordenes')
      .then((r) => r.json())
      .then((data) => { if (data.ok) setOrdenes(data.data) })
  }

  const filtradas = ordenes.filter((o) =>
    o.numero.toLowerCase().includes(busqueda.toLowerCase()) ||
    o.razon_social.toLowerCase().includes(busqueda.toLowerCase()) ||
    o.estado.toLowerCase().includes(busqueda.toLowerCase())
  )

const eliminar = async (id: string) => {
    await fetch(`/api/ordenes/${id}`, { method: 'DELETE' })
    setConfirmarEliminar(null)
    cargarOrdenes()
  }

  const cambiarEstado = async (id: string, estado: string) => {
    await fetch(`/api/ordenes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado }),
    })
    cargarOrdenes()
  }

  return (
    <div style={{ padding: '32px', maxWidth: '1200px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)' }}>Órdenes de Trabajo</h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Producción vinculada a clientes y presupuestos
          </p>
        </div>
        <button
          onClick={() => router.push('/ordenes/crear')}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            backgroundColor: 'var(--primary)', color: '#fff',
            border: 'none', borderRadius: '8px',
            padding: '9px 16px', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
          }}
        >
          <Plus size={16} /> Nueva orden
        </button>
      </div>

      <div style={{ position: 'relative', marginBottom: '16px', maxWidth: '360px' }}>
        <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input
          type="text"
          placeholder="Buscar por número, cliente o estado..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          style={{
            width: '100%', padding: '8px 12px 8px 32px',
            border: '1px solid var(--border)', borderRadius: '8px',
            fontSize: '13px', backgroundColor: 'var(--input-bg)',
            color: 'var(--text-primary)', outline: 'none',
          }}
        />
      </div>

      <div style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '10px', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Cargando...</div>
        ) : filtradas.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <ClipboardList size={32} style={{ marginBottom: '8px', opacity: 0.4 }} />
            <div>No hay órdenes{busqueda ? ' que coincidan' : ' registradas aún'}</div>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid var(--border)' }}>
                {['Número', 'Fecha', 'Cliente', 'Presupuesto', 'Items', 'Entrega', 'Estado', 'Acciones'].map((h) => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtradas.map((o) => {
                const cfg = estadoConfig[o.estado] ?? estadoConfig.Pendiente
                return (
                  <tr key={o._id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '10px 16px', fontWeight: 600, color: 'var(--primary)' }}>
                      {o.numero}
                    </td>
                    <td style={{ padding: '10px 16px', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                      {new Date(o.fecha).toLocaleDateString('es-AR')}
                    </td>
                    <td style={{ padding: '10px 16px', fontWeight: 500, color: 'var(--text-primary)' }}>{o.razon_social}</td>
                    <td style={{ padding: '10px 16px', color: 'var(--text-secondary)' }}>{o.numero_presupuesto || '—'}</td>
                    <td style={{ padding: '10px 16px', color: 'var(--text-secondary)' }}>
                      {o.lineas.length} {o.lineas.length === 1 ? 'ítem' : 'ítems'}
                    </td>
                    <td style={{ padding: '10px 16px', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                      {o.fecha_entrega ? new Date(o.fecha_entrega).toLocaleDateString('es-AR') : '—'}
                    </td>
                    <td style={{ padding: '10px 16px' }}>
                      <select
                        value={o.estado}
                        onChange={(e) => {
  if (!o.ejecutada) return
  cambiarEstado(o._id, e.target.value)
}}
                        style={{
                          fontSize: '11px', fontWeight: 600, padding: '3px 8px', borderRadius: '4px',
                          backgroundColor: cfg.bg, color: cfg.color,
                          border: `1px solid ${cfg.color}`,
                          cursor: 'pointer', outline: 'none',
                        }}
                      >
                        <option value="Pendiente">Pendiente</option>
                        <option value="En proceso">En proceso</option>
                        <option value="Completada">Completada</option>
                        <option value="Cancelada">Cancelada</option>
                      </select>
                    </td>
                    <td style={{ padding: '10px 16px' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => router.push(`/ordenes/${o._id}`)} title="Ver"
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', padding: '4px' }}>
                          <Eye size={15} />
                        </button>
                        <button onClick={() => setConfirmarEliminar(o._id)} title="Eliminar"
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
        <div style={{
          position: 'fixed', inset: 0, zIndex: 200,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            backgroundColor: 'var(--card-bg)', borderRadius: '12px',
            padding: '28px', maxWidth: '380px', width: '100%',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
              Eliminar orden
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '24px' }}>
              ¿Confirmás que querés eliminar esta orden? Esta acción no se puede deshacer.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button onClick={() => setConfirmarEliminar(null)}
                style={{
                  padding: '8px 16px', borderRadius: '6px', fontSize: '13px',
                  border: '1px solid var(--border)', backgroundColor: 'transparent',
                  color: 'var(--text-secondary)', cursor: 'pointer',
                }}>
                Cancelar
              </button>
              <button onClick={() => eliminar(confirmarEliminar)}
                style={{
                  padding: '8px 20px', borderRadius: '6px', fontSize: '13px', fontWeight: 600,
                  border: 'none', backgroundColor: 'var(--danger)', color: '#fff', cursor: 'pointer',
                }}>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}