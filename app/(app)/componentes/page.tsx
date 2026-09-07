'use client'

import { useEffect, useState } from 'react'
import { Plus, Search, Pencil, Trash2, Cpu, ChevronUp, ChevronDown } from 'lucide-react'
import ModalComponente from './ModalComponente'

export interface Componente {
  _id: string
  id_componente: string
  nombre: string
  unidad: string
  stock_actual: number
  stock_minimo: number
  proveedor: string
  precio_unitario: number
  ubicacion: string
  activo: boolean
}

type SortKey = 'id_componente' | 'nombre' | 'unidad' | 'stock_actual' | 'stock_minimo' | 'proveedor' | 'precio_unitario' | 'ubicacion'

export default function ComponentesPage() {
  const [componentes, setComponentes] = useState<Componente[]>([])
  const [loading, setLoading] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [modalAbierto, setModalAbierto] = useState(false)
  const [componenteEditar, setComponenteEditar] = useState<Componente | null>(null)
  const [confirmarEliminar, setConfirmarEliminar] = useState<string | null>(null)
  const [sortKey, setSortKey] = useState<SortKey>('id_componente')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')

  useEffect(() => {
    fetch('/api/componentes')
      .then((r) => r.json())
      .then((data) => {
        if (data.ok) setComponentes(data.data)
        setLoading(false)
      })
  }, [])

  const cargarComponentes = () => {
    fetch('/api/componentes')
      .then((r) => r.json())
      .then((data) => { if (data.ok) setComponentes(data.data) })
  }

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const filtrados = componentes
    .filter((c) =>
      c.id_componente.toLowerCase().includes(busqueda.toLowerCase()) ||
      c.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      c.proveedor?.toLowerCase().includes(busqueda.toLowerCase()) ||
      c.ubicacion?.toLowerCase().includes(busqueda.toLowerCase())
    )
    .sort((a, b) => {
      const aVal = a[sortKey] ?? ''
      const bVal = b[sortKey] ?? ''
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDir === 'asc' ? aVal - bVal : bVal - aVal
      }
      return sortDir === 'asc'
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal))
    })

  const eliminar = async (id: string) => {
    await fetch(`/api/componentes/${encodeURIComponent(id)}`, { method: 'DELETE' })
    setConfirmarEliminar(null)
    cargarComponentes()
  }

  const SortIcon = ({ k }: { k: SortKey }) => {
    if (sortKey !== k) return <ChevronUp size={12} style={{ opacity: 0.3 }} />
    return sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />
  }

  const thStyle = (k: SortKey) => ({
    padding: '10px 16px',
    textAlign: 'left' as const,
    fontWeight: 600,
    color: 'var(--text-secondary)',
    whiteSpace: 'nowrap' as const,
    cursor: 'pointer',
    userSelect: 'none' as const,
    backgroundColor: sortKey === k ? '#f1f5f9' : undefined,
  })

  return (
    <div style={{ padding: '32px', maxWidth: '1400px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)' }}>Componentes</h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Insumos y materiales para fabricación
          </p>
        </div>
        <button
          onClick={() => { setComponenteEditar(null); setModalAbierto(true) }}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            backgroundColor: 'var(--primary)', color: '#fff',
            border: 'none', borderRadius: '8px',
            padding: '9px 16px', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
          }}
        >
          <Plus size={16} /> Nuevo componente
        </button>
      </div>

      <div style={{ position: 'relative', marginBottom: '16px', maxWidth: '360px' }}>
        <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input
          type="text"
          placeholder="Buscar por código, nombre o proveedor..."
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
            <Cpu size={32} style={{ marginBottom: '8px', opacity: 0.4 }} />
            <div>No hay componentes{busqueda ? ' que coincidan' : ' cargados aún'}</div>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid var(--border)' }}>
                {([
                  { label: 'Código', key: 'id_componente' },
                  { label: 'Nombre', key: 'nombre' },
                  { label: 'Unidad', key: 'unidad' },
                  { label: 'Stock actual', key: 'stock_actual' },
                  { label: 'Stock mínimo', key: 'stock_minimo' },
                  { label: 'Proveedor', key: 'proveedor' },
                  { label: 'Precio unit.', key: 'precio_unitario' },
                  { label: 'Ubicación', key: 'ubicacion' },
                ] as { label: string; key: SortKey }[]).map(({ label, key }) => (
                  <th key={key} onClick={() => handleSort(key)} style={thStyle(key)}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {label} <SortIcon k={key} />
                    </div>
                  </th>
                ))}
                <th style={{ padding: '10px 16px' }} />
              </tr>
            </thead>
            <tbody>
              {filtrados.map((c) => {
                const bajoMinimo = c.stock_actual <= c.stock_minimo && c.stock_minimo > 0
                return (
                  <tr key={c._id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '10px 16px', fontWeight: 600, color: 'var(--primary)' }}>{c.id_componente}</td>
                    <td style={{ padding: '10px 16px', color: 'var(--text-primary)' }}>{c.nombre}</td>
                    <td style={{ padding: '10px 16px', color: 'var(--text-secondary)' }}>{c.unidad || '—'}</td>
                    <td style={{ padding: '10px 16px', fontWeight: 600, color: bajoMinimo ? 'var(--danger)' : 'var(--success)' }}>
                      {c.stock_actual}
                      {bajoMinimo && (
                        <span style={{ marginLeft: '6px', fontSize: '10px', backgroundColor: 'var(--danger-bg)', color: 'var(--danger)', padding: '2px 6px', borderRadius: '4px' }}>
                          BAJO
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '10px 16px', color: 'var(--text-secondary)' }}>{c.stock_minimo}</td>
                    <td style={{ padding: '10px 16px', color: 'var(--text-secondary)' }}>{c.proveedor || '—'}</td>
                    <td style={{ padding: '10px 16px', color: 'var(--text-secondary)' }}>
                      {c.precio_unitario > 0 ? `U$S ${c.precio_unitario.toLocaleString('es-AR', { minimumFractionDigits: 2 })}` : '—'}
                    </td>
                    <td style={{ padding: '10px 16px', color: 'var(--text-secondary)' }}>{c.ubicacion || '—'}</td>
                    <td style={{ padding: '10px 16px' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => { setComponenteEditar(c); setModalAbierto(true) }} title="Editar"
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '4px' }}>
                          <Pencil size={15} />
                        </button>
                        <button onClick={() => setConfirmarEliminar(c.id_componente)} title="Eliminar"
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

      {modalAbierto && (
        <ModalComponente
          componente={componenteEditar}
          onClose={() => setModalAbierto(false)}
          onGuardado={() => { setModalAbierto(false); cargarComponentes() }}
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
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
              Eliminar componente
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '24px' }}>
              ¿Confirmás que querés eliminar <b>{confirmarEliminar}</b>? Esta acción no se puede deshacer.
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