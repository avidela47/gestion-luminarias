'use client'

import { useEffect, useState } from 'react'
import { Plus, Search, Pencil, Trash2, Wrench } from 'lucide-react'
import ModalHerramienta from './ModalHerramienta'

export interface Herramienta {
  _id: string
  codigo: string
  nombre: string
  descripcion: string
  cantidad_total: number
  cantidad_disponible: number
  estado: 'disponible' | 'en_uso' | 'reparacion' | 'baja'
  ubicacion: string
  notas: string
  activo: boolean
}

const estadoConfig = {
  disponible: { label: 'DISPONIBLE', bg: 'var(--success-bg)', color: 'var(--success)' },
  en_uso: { label: 'EN USO', bg: 'var(--warning-bg)', color: 'var(--warning)' },
  reparacion: { label: 'REPARACIÓN', bg: 'var(--info-bg)', color: 'var(--info)' },
  baja: { label: 'BAJA', bg: 'var(--danger-bg)', color: 'var(--danger)' },
}

export default function HerramientasPage() {
  const [items, setItems] = useState<Herramienta[]>([])
  const [loading, setLoading] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('todos')
  const [modalAbierto, setModalAbierto] = useState(false)
  const [itemEditar, setItemEditar] = useState<Herramienta | null>(null)
  const [confirmarEliminar, setConfirmarEliminar] = useState<string | null>(null)

  const cargar = () => {
    fetch('/api/herramientas')
      .then((r) => r.json())
      .then((data) => {
        if (data.ok) setItems(data.data)
        setLoading(false)
      })
  }

  useEffect(() => { cargar() }, [])

  const filtrados = items.filter((i) => {
    const matchBusqueda =
      i.codigo.toLowerCase().includes(busqueda.toLowerCase()) ||
      i.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      i.descripcion.toLowerCase().includes(busqueda.toLowerCase())
    const matchEstado = filtroEstado === 'todos' || i.estado === filtroEstado
    return matchBusqueda && matchEstado
  })

  const eliminar = async (codigo: string) => {
    await fetch(`/api/herramientas/${encodeURIComponent(codigo)}`, { method: 'DELETE' })
    setConfirmarEliminar(null)
    cargar()
  }

  return (
    <div style={{ padding: '32px', maxWidth: '1200px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)' }}>Herramientas</h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Inventario y control de herramientas
          </p>
        </div>
        <button onClick={() => { setItemEditar(null); setModalAbierto(true) }}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            backgroundColor: 'var(--primary)', color: '#fff',
            border: 'none', borderRadius: '8px',
            padding: '9px 16px', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
          }}>
          <Plus size={16} /> Nueva herramienta
        </button>
      </div>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative' }}>
          <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input type="text" placeholder="Buscar por código o nombre..."
            value={busqueda} onChange={(e) => setBusqueda(e.target.value)}
            style={{
              padding: '8px 12px 8px 32px', width: '280px',
              border: '1px solid var(--border)', borderRadius: '8px',
              fontSize: '13px', backgroundColor: 'var(--input-bg)',
              color: 'var(--text-primary)', outline: 'none',
            }}
          />
        </div>
        {(['todos', 'disponible', 'en_uso', 'reparacion', 'baja'] as const).map((e) => (
          <button key={e} onClick={() => setFiltroEstado(e)}
            style={{
              padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 500,
              border: '1px solid var(--border)', cursor: 'pointer',
              backgroundColor: filtroEstado === e ? 'var(--primary)' : 'transparent',
              color: filtroEstado === e ? '#fff' : 'var(--text-secondary)',
            }}>
            {e === 'todos' ? 'Todos' : estadoConfig[e].label}
          </button>
        ))}
      </div>

      <div style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '10px', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Cargando...</div>
        ) : filtrados.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Wrench size={32} style={{ marginBottom: '8px', opacity: 0.4 }} />
            <div>No hay herramientas{busqueda ? ' que coincidan' : ' cargadas aún'}</div>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid var(--border)' }}>
                {['Código', 'Nombre', 'Descripción', 'Total', 'Disponible', 'Estado', 'Ubicación', ''].map((h) => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtrados.map((item) => {
                const cfg = estadoConfig[item.estado]
                return (
                  <tr key={item._id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '10px 16px', fontWeight: 600, color: 'var(--primary)' }}>{item.codigo}</td>
                    <td style={{ padding: '10px 16px', fontWeight: 500, color: 'var(--text-primary)' }}>{item.nombre}</td>
                    <td style={{ padding: '10px 16px', color: 'var(--text-secondary)' }}>{item.descripcion || '—'}</td>
                    <td style={{ padding: '10px 16px', textAlign: 'center', color: 'var(--text-secondary)' }}>{item.cantidad_total}</td>
                    <td style={{ padding: '10px 16px', textAlign: 'center', fontWeight: 600, color: item.cantidad_disponible === 0 ? 'var(--danger)' : 'var(--success)' }}>
                      {item.cantidad_disponible}
                    </td>
                    <td style={{ padding: '10px 16px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', backgroundColor: cfg.bg, color: cfg.color }}>
                        {cfg.label}
                      </span>
                    </td>
                    <td style={{ padding: '10px 16px', color: 'var(--text-secondary)' }}>{item.ubicacion || '—'}</td>
                    <td style={{ padding: '10px 16px' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => { setItemEditar(item); setModalAbierto(true) }} title="Editar"
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '4px' }}>
                          <Pencil size={15} />
                        </button>
                        <button onClick={() => setConfirmarEliminar(item.codigo)} title="Eliminar"
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
        <ModalHerramienta
          item={itemEditar}
          onClose={() => setModalAbierto(false)}
          onGuardado={() => { setModalAbierto(false); cargar() }}
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
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>Eliminar herramienta</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '24px' }}>
              ¿Confirmás que querés eliminar <b>{confirmarEliminar}</b>? Esta acción no se puede deshacer.
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