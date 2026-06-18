'use client'

import { useEffect, useState } from 'react'
import { Plus, PackageCheck, Eye, Trash2 } from 'lucide-react'
import ModalDespacho from './ModalDespacho'
import VerDespacho from './VerDespacho'

export interface ItemDespacho {
  codigo: string
  descripcion: string
  cantidad: number
  tipo: 'fabricada' | 'comercial' | 'deposito'
  precio_unitario: number
}

export interface Despacho {
  _id: string
  numero: string
  fecha: string
  id_presupuesto: string
  numero_presupuesto: string
  razon_social: string
  id_cliente: string
  items: ItemDespacho[]
  estado: 'pendiente' | 'despachado' | 'anulado'
  observaciones: string
}

const estadoConfig = {
  pendiente: { label: 'PENDIENTE', bg: 'var(--warning-bg)', color: 'var(--warning)' },
  despachado: { label: 'DESPACHADO', bg: 'var(--success-bg)', color: 'var(--success)' },
  anulado: { label: 'ANULADO', bg: 'var(--danger-bg)', color: 'var(--danger)' },
}

export default function DespachosPage() {
  const [despachos, setDespachos] = useState<Despacho[]>([])
  const [loading, setLoading] = useState(true)
  const [modalAbierto, setModalAbierto] = useState(false)
  const [despachoVer, setDespachoVer] = useState<Despacho | null>(null)
  const [confirmarEliminar, setConfirmarEliminar] = useState<string | null>(null)

  const cargar = () => {
    fetch('/api/despachos')
      .then((r) => r.json())
      .then((data) => {
        if (data.ok) setDespachos(data.data)
        setLoading(false)
      })
  }

  useEffect(() => { cargar() }, [])

  const eliminar = async (id: string) => {
    await fetch(`/api/despachos/${id}`, { method: 'DELETE' })
    setConfirmarEliminar(null)
    cargar()
  }

  return (
    <div style={{ padding: '32px', maxWidth: '1200px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)' }}>Despachos</h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Salida de luminarias con descuento de stock
          </p>
        </div>
        <button onClick={() => setModalAbierto(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            backgroundColor: 'var(--primary)', color: '#fff',
            border: 'none', borderRadius: '8px',
            padding: '9px 16px', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
          }}>
          <Plus size={16} /> Nuevo despacho
        </button>
      </div>

      <div style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '10px', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Cargando...</div>
        ) : despachos.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <PackageCheck size={32} style={{ marginBottom: '8px', opacity: 0.4 }} />
            <div>No hay despachos registrados</div>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid var(--border)' }}>
                {['Número', 'Fecha', 'Cliente', 'Presupuesto', 'Ítems', 'Estado', ''].map((h) => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {despachos.map((d) => {
                const cfg = estadoConfig[d.estado]
                return (
                  <tr key={d._id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '10px 16px', fontWeight: 600, color: 'var(--primary)' }}>{d.numero}</td>
                    <td style={{ padding: '10px 16px', color: 'var(--text-secondary)' }}>
                      {new Date(d.fecha).toLocaleDateString('es-AR')}
                    </td>
                    <td style={{ padding: '10px 16px', color: 'var(--text-primary)', fontWeight: 500 }}>{d.razon_social}</td>
                    <td style={{ padding: '10px 16px', color: 'var(--text-secondary)' }}>{d.numero_presupuesto || '—'}</td>
                    <td style={{ padding: '10px 16px', color: 'var(--text-secondary)' }}>
                      {d.items.length} {d.items.length === 1 ? 'ítem' : 'ítems'}
                    </td>
                    <td style={{ padding: '10px 16px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', backgroundColor: cfg.bg, color: cfg.color }}>
                        {cfg.label}
                      </span>
                    </td>
                    <td style={{ padding: '10px 16px' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => setDespachoVer(d)} title="Ver"
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', padding: '4px' }}>
                          <Eye size={15} />
                        </button>
                        {d.estado === 'pendiente' && (
                          <button onClick={() => setConfirmarEliminar(d._id)} title="Eliminar"
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)', padding: '4px' }}>
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {modalAbierto && (
        <ModalDespacho
          onClose={() => setModalAbierto(false)}
          onGuardado={() => { setModalAbierto(false); cargar() }}
        />
      )}

      {despachoVer && (
        <VerDespacho
          despacho={despachoVer}
          onClose={() => setDespachoVer(null)}
          onActualizado={() => { setDespachoVer(null); cargar() }}
        />
      )}

      {confirmarEliminar && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ backgroundColor: 'var(--card-bg)', borderRadius: '12px', padding: '28px', maxWidth: '380px', width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>Eliminar despacho</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '24px' }}>
              ¿Confirmás que querés eliminar este despacho?
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