'use client'

import { useEffect, useState } from 'react'
import { Plus, Search, Pencil, Trash2, PackageX } from 'lucide-react'
import ModalReceta from './ModalReceta'

export interface Receta {
  _id: string
  codigo: string
  nombre: string
  version: number
  fecha_version: string
  activa: boolean
  componentes: { id_componente: string; cantidad: number }[]
  notas: string
}

export default function RecetasPage() {
  const [recetas, setRecetas] = useState<Receta[]>([])
  const [loading, setLoading] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [modalAbierto, setModalAbierto] = useState(false)
  const [recetaEditar, setRecetaEditar] = useState<Receta | null>(null)
  const [confirmarEliminar, setConfirmarEliminar] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/recetas')
      .then((r) => r.json())
      .then((data) => {
        if (data.ok) setRecetas(data.data)
        setLoading(false)
      })
  }, [])

  const cargarRecetas = () => {
    fetch('/api/recetas')
      .then((r) => r.json())
      .then((data) => {
        if (data.ok) setRecetas(data.data)
      })
  }

  const filtradas = recetas.filter(
    (r) =>
      r.codigo.toLowerCase().includes(busqueda.toLowerCase()) ||
      r.nombre.toLowerCase().includes(busqueda.toLowerCase())
  )

  const eliminar = async (codigo: string) => {
    await fetch(`/api/recetas/${encodeURIComponent(codigo)}`, { method: 'DELETE' })
    setConfirmarEliminar(null)
    cargarRecetas()
  }

  return (
    <div style={{ padding: '32px', maxWidth: '1200px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)' }}>
            Recetas (BOM)
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Composición de componentes por luminaria
          </p>
        </div>
        <button
          onClick={() => { setRecetaEditar(null); setModalAbierto(true) }}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            backgroundColor: 'var(--primary)', color: '#fff',
            border: 'none', borderRadius: '8px',
            padding: '9px 16px', fontSize: '13px', fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          <Plus size={16} />
          Nueva receta
        </button>
      </div>

      {/* Buscador */}
      <div style={{ position: 'relative', marginBottom: '16px', maxWidth: '360px' }}>
        <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input
          type="text"
          placeholder="Buscar por código o nombre..."
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

      {/* Tabla */}
      <div style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '10px', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Cargando...</div>
        ) : filtradas.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <PackageX size={32} style={{ marginBottom: '8px', opacity: 0.4 }} />
            <div>No hay recetas{busqueda ? ' que coincidan con la búsqueda' : ' cargadas aún'}</div>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid var(--border)' }}>
                {['Código', 'Nombre', 'Versión', 'Componentes', 'Última actualización', 'Estado', ''].map((h) => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtradas.map((r) => (
                <tr key={r._id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '10px 16px', fontWeight: 600, color: 'var(--primary)' }}>{r.codigo}</td>
                  <td style={{ padding: '10px 16px', color: 'var(--text-primary)' }}>{r.nombre}</td>
                  <td style={{ padding: '10px 16px', color: 'var(--text-secondary)' }}>v{r.version}</td>
                  <td style={{ padding: '10px 16px', color: 'var(--text-secondary)' }}>
                    {r.componentes.length} {r.componentes.length === 1 ? 'componente' : 'componentes'}
                  </td>
                  <td style={{ padding: '10px 16px', color: 'var(--text-secondary)' }}>
                    {new Date(r.fecha_version).toLocaleDateString('es-AR')}
                  </td>
                  <td style={{ padding: '10px 16px' }}>
                    <span style={{
                      fontSize: '11px', padding: '2px 8px', borderRadius: '4px', fontWeight: 600,
                      backgroundColor: r.activa ? 'var(--success-bg)' : 'var(--danger-bg)',
                      color: r.activa ? 'var(--success)' : 'var(--danger)',
                    }}>
                      {r.activa ? 'ACTIVA' : 'INACTIVA'}
                    </span>
                  </td>
                  <td style={{ padding: '10px 16px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => { setRecetaEditar(r); setModalAbierto(true) }} title="Editar"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '4px' }}>
                        <Pencil size={15} />
                      </button>
                      <button onClick={() => setConfirmarEliminar(r.codigo)} title="Eliminar"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)', padding: '4px' }}>
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal receta */}
      {modalAbierto && (
        <ModalReceta
          receta={recetaEditar}
          onClose={() => setModalAbierto(false)}
          onGuardado={() => { setModalAbierto(false); cargarRecetas() }}
        />
      )}

      {/* Modal confirmar eliminar */}
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
              Eliminar receta
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '24px' }}>
              ¿Confirmás que querés eliminar la receta <b>{confirmarEliminar}</b>? Esta acción no se puede deshacer.
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