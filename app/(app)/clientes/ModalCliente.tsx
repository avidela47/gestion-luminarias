'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import type { Cliente } from './page'

interface Props {
  cliente: Cliente | null
  onClose: () => void
  onGuardado: () => void
}

const provincias = [
  'Buenos Aires', 'CABA', 'Catamarca', 'Chaco', 'Chubut', 'Córdoba',
  'Corrientes', 'Entre Ríos', 'Formosa', 'Jujuy', 'La Pampa', 'La Rioja',
  'Mendoza', 'Misiones', 'Neuquén', 'Río Negro', 'Salta', 'San Juan',
  'San Luis', 'Santa Cruz', 'Santa Fe', 'Santiago del Estero',
  'Tierra del Fuego', 'Tucumán'
]

export default function ModalCliente({ cliente, onClose, onGuardado }: Props) {
  const esEdicion = !!cliente

  const [form, setForm] = useState({
    id_cliente: cliente?.id_cliente ?? '',
    nombre: cliente?.nombre ?? '',
    razon_social: cliente?.razon_social ?? '',
    cuit: cliente?.cuit ?? '',
    telefono: cliente?.telefono ?? '',
    email: cliente?.email ?? '',
    direccion: cliente?.direccion ?? '',
    localidad: cliente?.localidad ?? '',
    provincia: cliente?.provincia ?? '',
    contacto: cliente?.contacto ?? '',
    condicion_iva: cliente?.condicion_iva ?? 'Responsable Inscripto',
    notas: cliente?.notas ?? '',
  })

  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm((p) => ({ ...p, [name]: value }))
  }

  const handleSubmit = async () => {
    setError('')
    if (!form.id_cliente.trim()) return setError('El código es obligatorio')
    if (!form.nombre.trim()) return setError('El nombre es obligatorio')

    setGuardando(true)
    const url = esEdicion ? `/api/clientes/${encodeURIComponent(cliente.id_cliente)}` : '/api/clientes'
    const method = esEdicion ? 'PUT' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })

    const data = await res.json()
    setGuardando(false)
    if (!data.ok) return setError(data.error || 'Error al guardar')
    onGuardado()
  }

  const campo = (label: string, name: string, type = 'text', placeholder = '') => (
    <div>
      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={form[name as keyof typeof form]}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={esEdicion && name === 'id_cliente'}
        style={{
          width: '100%', padding: '8px 10px',
          border: '1px solid var(--border)', borderRadius: '6px',
          fontSize: '13px',
          backgroundColor: esEdicion && name === 'id_cliente' ? '#f8fafc' : 'var(--input-bg)',
          color: 'var(--text-primary)', outline: 'none',
        }}
      />
    </div>
  )

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        backgroundColor: 'var(--card-bg)', borderRadius: '12px',
        width: '100%', maxWidth: '600px', maxHeight: '90vh',
        overflow: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '20px 24px', borderBottom: '1px solid var(--border)',
          position: 'sticky', top: 0, backgroundColor: 'var(--card-bg)', zIndex: 1,
        }}>
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
            {esEdicion ? 'Editar cliente' : 'Nuevo cliente'}
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {campo('Código *', 'id_cliente', 'text', 'Ej: CLI-001')}
            {campo('Nombre *', 'nombre', 'text', 'Nombre comercial')}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {campo('Razón social', 'razon_social', 'text', 'Razón social legal')}
            {campo('CUIT', 'cuit', 'text', 'Ej: 20-12345678-9')}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {campo('Teléfono', 'telefono', 'text', 'Ej: 351 123-4567')}
            {campo('Email', 'email', 'email', 'correo@empresa.com')}
          </div>

          {campo('Dirección', 'direccion', 'text', 'Calle y número')}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {campo('Localidad', 'localidad', 'text', 'Ciudad')}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                Provincia
              </label>
              <select
                name="provincia"
                value={form.provincia}
                onChange={handleChange}
                style={{
                  width: '100%', padding: '8px 10px',
                  border: '1px solid var(--border)', borderRadius: '6px',
                  fontSize: '13px', backgroundColor: 'var(--input-bg)',
                  color: 'var(--text-primary)', outline: 'none',
                }}
              >
                <option value="">Seleccionar...</option>
                {provincias.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {campo('Contacto', 'contacto', 'text', 'Persona de contacto')}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                Condición IVA
              </label>
              <select
                name="condicion_iva"
                value={form.condicion_iva}
                onChange={handleChange}
                style={{
                  width: '100%', padding: '8px 10px',
                  border: '1px solid var(--border)', borderRadius: '6px',
                  fontSize: '13px', backgroundColor: 'var(--input-bg)',
                  color: 'var(--text-primary)', outline: 'none',
                }}
              >
                <option value="Responsable Inscripto">Responsable Inscripto</option>
                <option value="Responsable Inscripto 10">Responsable Inscripto 10</option>
                <option value="Responsable Inscripto M">Responsable Inscripto M</option>
                <option value="Monotributo">Monotributo</option>
                <option value="Exento">Exento</option>
                <option value="Consumidor Final">Consumidor Final</option>
                <option value="No Categorizado">No Categorizado</option>
                <option value="Operaciones Turismo">Operaciones Turismo</option>
                <option value="Resp Insc Ley 16744 - L Boca">Resp Insc Ley 16744 - L Boca</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
              Notas
            </label>
            <textarea
              name="notas"
              value={form.notas}
              onChange={handleChange}
              rows={2}
              style={{
                width: '100%', padding: '8px 10px',
                border: '1px solid var(--border)', borderRadius: '6px',
                fontSize: '13px', backgroundColor: 'var(--input-bg)',
                color: 'var(--text-primary)', outline: 'none', resize: 'vertical',
              }}
            />
          </div>

          {error && (
            <div style={{
              backgroundColor: 'var(--danger-bg)', color: 'var(--danger)',
              padding: '10px 14px', borderRadius: '6px', fontSize: '13px',
            }}>
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex', justifyContent: 'flex-end', gap: '10px',
          padding: '16px 24px', borderTop: '1px solid var(--border)',
          position: 'sticky', bottom: 0, backgroundColor: 'var(--card-bg)',
        }}>
          <button onClick={onClose}
            style={{
              padding: '8px 16px', borderRadius: '6px', fontSize: '13px',
              border: '1px solid var(--border)', backgroundColor: 'transparent',
              color: 'var(--text-secondary)', cursor: 'pointer',
            }}>
            Cancelar
          </button>
          <button onClick={handleSubmit} disabled={guardando}
            style={{
              padding: '8px 20px', borderRadius: '6px', fontSize: '13px', fontWeight: 600,
              border: 'none', backgroundColor: 'var(--primary)', color: '#fff',
              cursor: guardando ? 'not-allowed' : 'pointer', opacity: guardando ? 0.7 : 1,
            }}>
            {guardando ? 'Guardando...' : esEdicion ? 'Guardar cambios' : 'Crear cliente'}
          </button>
        </div>
      </div>
    </div>
  )
}