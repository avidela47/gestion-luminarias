'use client'

import { useEffect, useState } from 'react'
import { Plus, Search, Pencil, Trash2, FileText, Eye } from 'lucide-react'
import { useRouter } from 'next/navigation'

export interface Presupuesto {
  _id: string
  numero: string
  fecha: string
  validez_dias: number
  vendedor: string
  id_cliente: string
  razon_social: string
  condicion_iva: string
  lineas: { codigo: string; descripcion: string; cantidad: number; bonificacion: number; precio_unitario: number; precio_total: number }[]
  moneda: string
  subtotal: number
  iva: number
  total: number
  forma_pago: string
  plazo_entrega: string
  comentario: string
  estado: string
}

const estadoConfig: Record<string, { color: string; bg: string }> = {
  Borrador:  { color: 'var(--text-secondary)', bg: '#f1f5f9' },
  Enviado:   { color: 'var(--info)',           bg: 'var(--info-bg)' },
  Aceptado:  { color: 'var(--success)',        bg: 'var(--success-bg)' },
  Cancelado: { color: 'var(--danger)',         bg: 'var(--danger-bg)' },
}

export default function PresupuestosPage() {
  const router = useRouter()
  const [presupuestos, setPresupuestos] = useState<Presupuesto[]>([])
  const [loading, setLoading] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [confirmarEliminar, setConfirmarEliminar] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/presupuestos')
      .then((r) => r.json())
      .then((data) => {
        if (data.ok) setPresupuestos(data.data)
        setLoading(false)
      })
  }, [])

  const cargarPresupuestos = () => {
    fetch('/api/presupuestos')
      .then((r) => r.json())
      .then((data) => { if (data.ok) setPresupuestos(data.data) })
  }

  const filtrados = presupuestos.filter((p) =>
    p.numero.includes(busqueda) ||
    p.razon_social.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.estado.toLowerCase().includes(busqueda.toLowerCase())
  )

  const eliminar = async (id: string) => {
    await fetch(`/api/presupuestos/${id}`, { method: 'DELETE' })
    setConfirmarEliminar(null)
    cargarPresupuestos()
  }

  const cambiarEstado = async (id: string, estado: string) => {
    await fetch(`/api/presupuestos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado }),
    })
    cargarPresupuestos()
  }

  return (
    <div style={{ padding: '32px', maxWidth: '1200px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)' }}>Presupuestos</h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Cotizaciones a clientes
          </p>
        </div>
        <button
          onClick={() => router.push('/presupuestos/nuevo')}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            backgroundColor: 'var(--primary)', color: '#fff',
            border: 'none', borderRadius: '8px',
            padding: '9px 16px', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
          }}
        >
          <Plus size={16} /> Nuevo presupuesto
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
            <FileText size={32} style={{ marginBottom: '8px', opacity: 0.4 }} />
            <div>No hay presupuestos{busqueda ? ' que coincidan' : ' cargados aún'}</div>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid var(--border)' }}>
                {['Número', 'Fecha', 'Cliente', 'Items', 'Total', 'Estado', 'Acciones'].map((h) => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtrados.map((p) => {
                const cfg = estadoConfig[p.estado] ?? estadoConfig.Borrador
                return (
                  <tr key={p._id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '10px 16px', fontWeight: 600, color: 'var(--primary)' }}>{p.numero}</td>
                    <td style={{ padding: '10px 16px', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                      {new Date(p.fecha).toLocaleDateString('es-AR')}
                    </td>
                    <td style={{ padding: '10px 16px' }}>
                      <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{p.razon_social}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{p.condicion_iva}</div>
                    </td>
                    <td style={{ padding: '10px 16px', color: 'var(--text-secondary)' }}>
                      {p.lineas.length} {p.lineas.length === 1 ? 'ítem' : 'ítems'}
                    </td>
                    <td style={{ padding: '10px 16px', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {p.moneda} {p.total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ padding: '10px 16px' }}>
                      <select
                        value={p.estado}
                        onChange={(e) => cambiarEstado(p._id, e.target.value)}
                        style={{
                          fontSize: '11px', fontWeight: 600, padding: '3px 8px', borderRadius: '4px',
                          backgroundColor: cfg.bg, color: cfg.color,
                          border: `1px solid ${cfg.color}`, cursor: 'pointer', outline: 'none',
                        }}
                      >
                        <option value="Borrador">Borrador</option>
                        <option value="Enviado">Enviado</option>
                        <option value="Aceptado">Aceptado</option>
                        <option value="Cancelado">Cancelado</option>
                      </select>
                    </td>
                    <td style={{ padding: '10px 16px' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => router.push(`/presupuestos/${p._id}`)} title="Ver / Imprimir"
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', padding: '4px' }}>
                          <Eye size={15} />
                        </button>
                        <button onClick={() => router.push(`/presupuestos/${p._id}/editar`)} title="Editar"
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '4px' }}>
                          <Pencil size={15} />
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
              Eliminar presupuesto
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '24px' }}>
              ¿Confirmás que querés eliminar este presupuesto? Esta acción no se puede deshacer.
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