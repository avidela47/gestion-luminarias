'use client'

import { useEffect, useState } from 'react'
import { Plus, Search, Pencil, Trash2, BoxSelect } from 'lucide-react'
import ModalProducto from './ModalProducto'

export interface ProductoTerminado {
  _id: string
  codigo_luminaria: string
  nombre: string
  stock_actual: number
  stock_minimo: number
  precio_venta: number
  notas: string
  activo: boolean
}

export default function ProductosPage() {
  const [productos, setProductos] = useState<ProductoTerminado[]>([])
  const [loading, setLoading] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [modalAbierto, setModalAbierto] = useState(false)
  const [productoEditar, setProductoEditar] = useState<ProductoTerminado | null>(null)
  const [confirmarEliminar, setConfirmarEliminar] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/productos')
      .then((r) => r.json())
      .then((data) => {
        if (data.ok) setProductos(data.data)
        setLoading(false)
      })
  }, [])

  const cargarProductos = () => {
    fetch('/api/productos')
      .then((r) => r.json())
      .then((data) => { if (data.ok) setProductos(data.data) })
  }

  const filtrados = productos.filter((p) =>
    p.codigo_luminaria.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.nombre.toLowerCase().includes(busqueda.toLowerCase())
  )

  const eliminar = async (codigo: string) => {
    await fetch(`/api/productos/${encodeURIComponent(codigo)}`, { method: 'DELETE' })
    setConfirmarEliminar(null)
    cargarProductos()
  }

  return (
    <div style={{ padding: '32px', maxWidth: '1200px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)' }}>Producto Terminado</h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Stock de luminarias listas para entregar
          </p>
        </div>
        <button
          onClick={() => { setProductoEditar(null); setModalAbierto(true) }}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            backgroundColor: 'var(--primary)', color: '#fff',
            border: 'none', borderRadius: '8px',
            padding: '9px 16px', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
          }}
        >
          <Plus size={16} /> Nuevo producto
        </button>
      </div>

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

      <div style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '10px', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Cargando...</div>
        ) : filtrados.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <BoxSelect size={32} style={{ marginBottom: '8px', opacity: 0.4 }} />
            <div>No hay productos{busqueda ? ' que coincidan' : ' cargados aún'}</div>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid var(--border)' }}>
                {['Código', 'Nombre', 'Stock actual', 'Stock mínimo', 'Precio venta', 'Estado', ''].map((h) => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtrados.map((p) => {
                const bajoMinimo = p.stock_actual < p.stock_minimo
                return (
                  <tr key={p._id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '10px 16px', fontWeight: 600, color: 'var(--primary)' }}>{p.codigo_luminaria}</td>
                    <td style={{ padding: '10px 16px', color: 'var(--text-primary)' }}>{p.nombre}</td>
                    <td style={{ padding: '10px 16px', fontWeight: 600, color: bajoMinimo ? 'var(--danger)' : 'var(--success)' }}>
                      {p.stock_actual}
                      {bajoMinimo && (
                        <span style={{ marginLeft: '6px', fontSize: '10px', backgroundColor: 'var(--danger-bg)', color: 'var(--danger)', padding: '2px 6px', borderRadius: '4px' }}>
                          BAJO
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '10px 16px', color: 'var(--text-secondary)' }}>{p.stock_minimo}</td>
                    <td style={{ padding: '10px 16px', color: 'var(--text-secondary)' }}>
                      {p.precio_venta > 0 ? `$${p.precio_venta.toLocaleString('es-AR')}` : '—'}
                    </td>
                    <td style={{ padding: '10px 16px' }}>
                      <span style={{
                        fontSize: '11px', padding: '2px 8px', borderRadius: '4px', fontWeight: 600,
                        backgroundColor: p.activo ? 'var(--success-bg)' : 'var(--danger-bg)',
                        color: p.activo ? 'var(--success)' : 'var(--danger)',
                      }}>
                        {p.activo ? 'ACTIVO' : 'INACTIVO'}
                      </span>
                    </td>
                    <td style={{ padding: '10px 16px' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => { setProductoEditar(p); setModalAbierto(true) }} title="Editar"
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '4px' }}>
                          <Pencil size={15} />
                        </button>
                        <button onClick={() => setConfirmarEliminar(p.codigo_luminaria)} title="Eliminar"
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
        <ModalProducto
          producto={productoEditar}
          onClose={() => setModalAbierto(false)}
          onGuardado={() => { setModalAbierto(false); cargarProductos() }}
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
              Eliminar producto
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