'use client'

import { useEffect, useState } from 'react'
import { Plus, Search, Pencil, Trash2, Users } from 'lucide-react'
import ModalCliente from './ModalCliente'

export interface Cliente {
  _id: string
  id_cliente: string
  nombre: string
  razon_social: string
  cuit: string
  telefono: string
  email: string
  direccion: string
  localidad: string
  provincia: string
  contacto: string
  condicion_iva: string
  notas: string
  activo: boolean
}

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [modalAbierto, setModalAbierto] = useState(false)
  const [clienteEditar, setClienteEditar] = useState<Cliente | null>(null)
  const [confirmarEliminar, setConfirmarEliminar] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/clientes')
      .then((r) => r.json())
      .then((data) => {
        if (data.ok) setClientes(data.data)
        setLoading(false)
      })
  }, [])

  const cargarClientes = () => {
    fetch('/api/clientes')
      .then((r) => r.json())
      .then((data) => { if (data.ok) setClientes(data.data) })
  }

  const filtrados = clientes.filter((c) =>
    c.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    c.id_cliente.toLowerCase().includes(busqueda.toLowerCase()) ||
    c.cuit.includes(busqueda) ||
    c.localidad.toLowerCase().includes(busqueda.toLowerCase())
  )

  const eliminar = async (id: string) => {
    await fetch(`/api/clientes/${encodeURIComponent(id)}`, { method: 'DELETE' })
    setConfirmarEliminar(null)
    cargarClientes()
  }

  return (
    <div style={{ padding: '32px', maxWidth: '1200px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)' }}>Clientes</h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Cartera de clientes de la empresa
          </p>
        </div>
        <button
          onClick={() => { setClienteEditar(null); setModalAbierto(true) }}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            backgroundColor: 'var(--primary)', color: '#fff',
            border: 'none', borderRadius: '8px',
            padding: '9px 16px', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
          }}
        >
          <Plus size={16} /> Nuevo cliente
        </button>
      </div>

      {/* Buscador */}
      <div style={{ position: 'relative', marginBottom: '16px', maxWidth: '360px' }}>
        <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input
          type="text"
          placeholder="Buscar por nombre, CUIT o localidad..."
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
        ) : filtrados.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Users size={32} style={{ marginBottom: '8px', opacity: 0.4 }} />
            <div>No hay clientes{busqueda ? ' que coincidan con la búsqueda' : ' cargados aún'}</div>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid var(--border)' }}>
                {['Código', 'Nombre / Razón social', 'CUIT', 'Localidad', 'Teléfono', 'Email', 'Condición IVA', ''].map((h) => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtrados.map((c) => (
                <tr key={c._id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '10px 16px', fontWeight: 600, color: 'var(--primary)' }}>{c.id_cliente}</td>
                  <td style={{ padding: '10px 16px' }}>
                    <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{c.nombre}</div>
                    {c.razon_social && <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{c.razon_social}</div>}
                  </td>
                  <td style={{ padding: '10px 16px', color: 'var(--text-secondary)' }}>{c.cuit || '—'}</td>
                  <td style={{ padding: '10px 16px', color: 'var(--text-secondary)' }}>
                    {c.localidad ? `${c.localidad}${c.provincia ? `, ${c.provincia}` : ''}` : '—'}
                  </td>
                  <td style={{ padding: '10px 16px', color: 'var(--text-secondary)' }}>{c.telefono || '—'}</td>
                  <td style={{ padding: '10px 16px', color: 'var(--text-secondary)' }}>{c.email || '—'}</td>
                  <td style={{ padding: '10px 16px' }}>
                    <span style={{
                      fontSize: '11px', padding: '2px 8px', borderRadius: '4px', fontWeight: 600,
                      backgroundColor: 'var(--info-bg)', color: 'var(--info)',
                    }}>
                      {c.condicion_iva}
                    </span>
                  </td>
                  <td style={{ padding: '10px 16px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => { setClienteEditar(c); setModalAbierto(true) }} title="Editar"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '4px' }}>
                        <Pencil size={15} />
                      </button>
                      <button onClick={() => setConfirmarEliminar(c.id_cliente)} title="Eliminar"
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

      {modalAbierto && (
        <ModalCliente
          cliente={clienteEditar}
          onClose={() => setModalAbierto(false)}
          onGuardado={() => { setModalAbierto(false); cargarClientes() }}
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
              Eliminar cliente
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '24px' }}>
              ¿Confirmás que querés eliminar el cliente <b>{confirmarEliminar}</b>? Esta acción no se puede deshacer.
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