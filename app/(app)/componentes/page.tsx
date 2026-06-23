'use client'

import { useEffect, useState } from 'react'
import { Plus, Search, Pencil, Trash2, PackageX } from 'lucide-react'
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
  notas: string
  activo: boolean
  foto: string
}

export default function ComponentesPage() {
  const [componentes, setComponentes] = useState<Componente[]>([])
  const [loading, setLoading] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [modalAbierto, setModalAbierto] = useState(false)
  const [componenteEditar, setComponenteEditar] = useState<Componente | null>(null)
  const [confirmarDesactivar, setConfirmarDesactivar] = useState<string | null>(null)

  const cargarComponentes = async () => {
    setLoading(true)
    const res = await fetch('/api/componentes')
    const data = await res.json()
    if (data.ok) setComponentes(data.data)
    setLoading(false)
  }

  useEffect(() => {
    fetch('/api/componentes')
      .then((r) => r.json())
      .then((data) => {
        if (data.ok) setComponentes(data.data)
        setLoading(false)
      })
  }, [])

  const filtrados = componentes.filter(
    (c) =>
      c.id_componente.toLowerCase().includes(busqueda.toLowerCase()) ||
      c.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      c.proveedor.toLowerCase().includes(busqueda.toLowerCase())
  )

  const abrirNuevo = () => {
    setComponenteEditar(null)
    setModalAbierto(true)
  }

  const abrirEditar = (c: Componente) => {
    setComponenteEditar(c)
    setModalAbierto(true)
  }

  const desactivar = async (id: string) => {
    await fetch(`/api/componentes/${id}`, { method: 'DELETE' })
    setConfirmarDesactivar(null)
    void cargarComponentes()
  }

  return (
    <div style={{ padding: '32px', maxWidth: '1200px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)' }}>
            Componentes
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Catálogo de insumos y materiales
          </p>
        </div>
        <button
          onClick={abrirNuevo}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            backgroundColor: 'var(--primary)', color: '#fff',
            border: 'none', borderRadius: '8px',
            padding: '9px 16px', fontSize: '13px', fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          <Plus size={16} />
          Nuevo componente
        </button>
      </div>

      {/* Buscador + Monto total */}
<div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px', flexWrap: 'wrap' }}>
  <div style={{ position: 'relative' }}>
    <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
    <input
      type="text"
      placeholder="Buscar por código, nombre o proveedor..."
      value={busqueda}
      onChange={(e) => setBusqueda(e.target.value)}
      style={{
        width: '360px', padding: '8px 12px 8px 32px',
        border: '1px solid var(--border)', borderRadius: '8px',
        fontSize: '13px', backgroundColor: 'var(--input-bg)',
        color: 'var(--text-primary)', outline: 'none',
      }}
    />
  </div>
  <div style={{
    display: 'flex', flexDirection: 'column', gap: '2px',
    padding: '10px 20px', borderRadius: '10px',
    backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
  }}>
    <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '1px', textTransform: 'uppercase' }}>
      Monto total insumos
    </span>
    <span style={{ fontSize: '18px', fontWeight: 700, color: 'var(--primary)', lineHeight: 1 }}>
      U$S {componentes.reduce((acc, c) => acc + (c.precio_unitario * c.stock_actual), 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
    </span>
  </div>
</div>

      {/* Tabla */}
      <div style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '10px', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Cargando...</div>
        ) : filtrados.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <PackageX size={32} style={{ marginBottom: '8px', opacity: 0.4 }} />
            <div>No hay componentes{busqueda ? ' que coincidan con la búsqueda' : ' cargados aún'}</div>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid var(--border)' }}>
                {['Código', 'Nombre', 'Unidad', 'Stock actual', 'Stock mínimo', 'Proveedor', 'Precio unit.', 'Ubicación', ''].map((h) => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtrados.map((c) => {
                const bajominimo = c.stock_actual < c.stock_minimo
                return (
                  <tr key={c._id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '10px 16px', fontWeight: 600, color: 'var(--primary)' }}>{c.id_componente}</td>
                    <td style={{ padding: '10px 16px', color: 'var(--text-primary)' }}>{c.nombre}</td>
                    <td style={{ padding: '10px 16px', color: 'var(--text-secondary)' }}>{c.unidad}</td>
                    <td style={{ padding: '10px 16px', fontWeight: 600, color: bajominimo ? 'var(--danger)' : 'var(--success)' }}>
                      {c.stock_actual}
                      {bajominimo && (
                        <span style={{ marginLeft: '6px', fontSize: '10px', backgroundColor: 'var(--danger-bg)', color: 'var(--danger)', padding: '2px 6px', borderRadius: '4px' }}>
                          BAJO
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '10px 16px', color: 'var(--text-secondary)' }}>{c.stock_minimo}</td>
                    <td style={{ padding: '10px 16px', color: 'var(--text-secondary)' }}>{c.proveedor || '—'}</td>
                    <td style={{ padding: '10px 16px', color: 'var(--text-secondary)' }}>
                      {c.precio_unitario > 0 ? `U$S ${c.precio_unitario.toLocaleString('es-AR')}` : '—'}
                    </td>
                    <td style={{ padding: '10px 16px', color: 'var(--text-secondary)' }}>{c.ubicacion || '—'}</td>
                    <td style={{ padding: '10px 16px' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => abrirEditar(c)} title="Editar"
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '4px' }}>
                          <Pencil size={15} />
                        </button>
                        <button onClick={() => setConfirmarDesactivar(c.id_componente)} title="Eliminar"
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

      {/* Modal componente */}
      {modalAbierto && (
        <ModalComponente
          componente={componenteEditar}
          onClose={() => setModalAbierto(false)}
          onGuardado={() => { setModalAbierto(false); void cargarComponentes() }}
        />
      )}

      {/* Modal confirmar desactivar */}
      {confirmarDesactivar && (
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
              ¿Confirmás que querés eliminar <b>{confirmarDesactivar}</b>? Esta acción no se puede deshacer.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button onClick={() => setConfirmarDesactivar(null)}
                style={{
                  padding: '8px 16px', borderRadius: '6px', fontSize: '13px',
                  border: '1px solid var(--border)', backgroundColor: 'transparent',
                  color: 'var(--text-secondary)', cursor: 'pointer',
                }}>
                Cancelar
              </button>
              <button onClick={() => desactivar(confirmarDesactivar)}
                style={{
                  padding: '8px 20px', borderRadius: '6px', fontSize: '13px', fontWeight: 600,
                  border: 'none', backgroundColor: 'var(--danger)', color: '#fff', cursor: 'pointer',
                }}>
                Desactivar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}