'use client'

import { useEffect, useState } from 'react'
import { Plus, ClipboardCheck, Trash2, Eye } from 'lucide-react'
import ModalVale from './ModalVale'
import VerVale from './VerVale'

export interface ItemVale {
  descripcion: string
  cantidad_salida: number
  cantidad_devuelta: number
  tipo: 'stock' | 'herramienta' | 'otro'
  notas: string
}

export interface Vale {
  _id: string
  numero: string
  fecha_salida: string
  fecha_devolucion?: string
  responsable: string
  emitido_por: string
  estado: 'abierto' | 'devolucion_parcial' | 'cerrado'
  items: ItemVale[]
  observaciones_salida: string
  observaciones_devolucion: string
}

const estadoConfig = {
  abierto: { label: 'ABIERTO', bg: 'var(--warning-bg)', color: 'var(--warning)' },
  devolucion_parcial: { label: 'DEVOLUCIÓN PARCIAL', bg: 'var(--info-bg)', color: 'var(--info)' },
  cerrado: { label: 'CERRADO', bg: 'var(--success-bg)', color: 'var(--success)' },
}

export default function ValesPage() {
  const [vales, setVales] = useState<Vale[]>([])
  const [loading, setLoading] = useState(true)
  const [modalAbierto, setModalAbierto] = useState(false)
  const [valeVer, setValeVer] = useState<Vale | null>(null)
  const [confirmarEliminar, setConfirmarEliminar] = useState<string | null>(null)

  const cargar = () => {
  fetch('/api/vales')
    .then((r) => r.json())
    .then((data) => {
      if (data.ok) setVales(data.data)
      setLoading(false)
    })
}

useEffect(() => { cargar() }, [])

  const eliminar = async (id: string) => {
    await fetch(`/api/vales/${id}`, { method: 'DELETE' })
    setConfirmarEliminar(null)
    cargar()
  }

  return (
    <div style={{ padding: '32px', maxWidth: '1200px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)' }}>Vales</h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Control interno de salidas y devoluciones
          </p>
        </div>
        <button onClick={() => setModalAbierto(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            backgroundColor: 'var(--primary)', color: '#fff',
            border: 'none', borderRadius: '8px',
            padding: '9px 16px', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
          }}>
          <Plus size={16} /> Nuevo vale
        </button>
      </div>

      <div style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '10px', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Cargando...</div>
        ) : vales.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <ClipboardCheck size={32} style={{ marginBottom: '8px', opacity: 0.4 }} />
            <div>No hay vales cargados</div>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid var(--border)' }}>
                {['Número', 'Fecha salida', 'Responsable', 'Emitido por', 'Ítems', 'Estado', ''].map((h) => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {vales.map((v) => {
                const cfg = estadoConfig[v.estado]
                return (
                  <tr key={v._id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '10px 16px', fontWeight: 600, color: 'var(--primary)' }}>{v.numero}</td>
                    <td style={{ padding: '10px 16px', color: 'var(--text-secondary)' }}>
                      {new Date(v.fecha_salida).toLocaleDateString('es-AR')}
                    </td>
                    <td style={{ padding: '10px 16px', color: 'var(--text-primary)', fontWeight: 500 }}>{v.responsable}</td>
                    <td style={{ padding: '10px 16px', color: 'var(--text-secondary)' }}>{v.emitido_por}</td>
                    <td style={{ padding: '10px 16px', color: 'var(--text-secondary)' }}>
                      {v.items.length} {v.items.length === 1 ? 'ítem' : 'ítems'}
                    </td>
                    <td style={{ padding: '10px 16px' }}>
                      <span style={{
                        fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '4px',
                        backgroundColor: cfg.bg, color: cfg.color,
                      }}>
                        {cfg.label}
                      </span>
                    </td>
                    <td style={{ padding: '10px 16px' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => setValeVer(v)} title="Ver / Imprimir"
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', padding: '4px' }}>
                          <Eye size={15} />
                        </button>
                        {v.estado !== 'cerrado' && (
                          <button onClick={() => setConfirmarEliminar(v._id)} title="Eliminar"
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
        <ModalVale
          onClose={() => setModalAbierto(false)}
          onGuardado={() => { setModalAbierto(false); cargar() }}
        />
      )}

      {valeVer && (
        <VerVale
          vale={valeVer}
          onClose={() => setValeVer(null)}
          onDevolucion={() => { setValeVer(null); cargar() }}
        />
      )}

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
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>Eliminar vale</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '24px' }}>
              ¿Confirmás que querés eliminar este vale? Esta acción no se puede deshacer.
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