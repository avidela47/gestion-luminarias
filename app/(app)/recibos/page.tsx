'use client'

import { useEffect, useState } from 'react'
import { Plus, Search, Trash2, Receipt, Eye } from 'lucide-react'
import { useRouter } from 'next/navigation'

export interface Recibo {
  _id: string
  numero: string
  fecha: string
  id_cliente: string
  razon_social: string
  numero_presupuesto: string
  numero_orden: string
  concepto: string
  total_usd: number
  total_pagado_usd: number
  saldo_usd: number
  estado: string
  pagos: {
    _id: string
    fecha: string
    monto_usd: number
    tipo_cambio: number
    monto_pesos: number
    forma_pago: string
    notas: string
  }[]
}

const estadoConfig: Record<string, { color: string; bg: string }> = {
  'Pendiente de pago': { color: 'var(--warning)', bg: 'var(--warning-bg)' },
  'Pago parcial':      { color: 'var(--secondary)', bg: 'var(--info-bg)' },
  'Cancelado':         { color: 'var(--success)', bg: 'var(--success-bg)' },
}

export default function RecibosPage() {
  const router = useRouter()
  const [recibos, setRecibos] = useState<Recibo[]>([])
  const [loading, setLoading] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [confirmarEliminar, setConfirmarEliminar] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/recibos')
      .then((r) => r.json())
      .then((data) => {
        if (data.ok) setRecibos(data.data)
        setLoading(false)
      })
  }, [])

  const cargarRecibos = () => {
    fetch('/api/recibos')
      .then((r) => r.json())
      .then((data) => { if (data.ok) setRecibos(data.data) })
  }

  const filtrados = recibos.filter((r) =>
    r.numero.toLowerCase().includes(busqueda.toLowerCase()) ||
    r.razon_social.toLowerCase().includes(busqueda.toLowerCase()) ||
    r.estado.toLowerCase().includes(busqueda.toLowerCase())
  )

  const eliminar = async (id: string) => {
    await fetch(`/api/recibos/${id}`, { method: 'DELETE' })
    setConfirmarEliminar(null)
    cargarRecibos()
  }

  return (
    <div style={{ padding: '32px', maxWidth: '1200px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)' }}>Recibos</h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Gestión de cobros a clientes
          </p>
        </div>
        <button
          onClick={() => router.push('/recibos/nuevo')}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            backgroundColor: 'var(--primary)', color: '#fff',
            border: 'none', borderRadius: '8px',
            padding: '9px 16px', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
          }}
        >
          <Plus size={16} /> Nuevo recibo
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
        ) : filtrados.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Receipt size={32} style={{ marginBottom: '8px', opacity: 0.4 }} />
            <div>No hay recibos{busqueda ? ' que coincidan' : ' registrados aún'}</div>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid var(--border)' }}>
                {['Número', 'Fecha', 'Cliente', 'Referencia', 'Total U$S', 'Pagado U$S', 'Saldo U$S', 'Estado', ''].map((h) => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtrados.map((r) => {
                const cfg = estadoConfig[r.estado] ?? estadoConfig['Pendiente de pago']
                return (
                  <tr key={r._id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '10px 16px', fontWeight: 600, color: 'var(--primary)' }}>{r.numero}</td>
                    <td style={{ padding: '10px 16px', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                      {new Date(r.fecha).toLocaleDateString('es-AR')}
                    </td>
                    <td style={{ padding: '10px 16px', fontWeight: 500, color: 'var(--text-primary)' }}>{r.razon_social}</td>
                    <td style={{ padding: '10px 16px', color: 'var(--text-secondary)', fontSize: '12px' }}>
                      {r.numero_presupuesto && <div>Pres: {r.numero_presupuesto}</div>}
                      {r.numero_orden && <div>OT: {r.numero_orden}</div>}
                      {!r.numero_presupuesto && !r.numero_orden && '—'}
                    </td>
                    <td style={{ padding: '10px 16px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {r.total_usd.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ padding: '10px 16px', fontWeight: 600, color: 'var(--success)' }}>
                      {r.total_pagado_usd.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ padding: '10px 16px', fontWeight: 600, color: r.saldo_usd > 0 ? 'var(--danger)' : 'var(--success)' }}>
                      {r.saldo_usd.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ padding: '10px 16px' }}>
                      <span style={{
                        fontSize: '11px', fontWeight: 600, padding: '3px 8px', borderRadius: '4px',
                        backgroundColor: cfg.bg, color: cfg.color,
                      }}>
                        {r.estado}
                      </span>
                    </td>
                    <td style={{ padding: '10px 16px' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => router.push(`/recibos/${r._id}`)} title="Ver / Cobrar"
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', padding: '4px' }}>
                          <Eye size={15} />
                        </button>
                        <button onClick={() => setConfirmarEliminar(r._id)} title="Eliminar"
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
              Eliminar recibo
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '24px' }}>
              ¿Confirmás que querés eliminar este recibo? Esta acción no se puede deshacer.
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