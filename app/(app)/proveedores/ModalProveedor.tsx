'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import type { Proveedor } from './page'

interface Props {
  proveedor: Proveedor | null
  onClose: () => void
  onGuardado: () => void
}

export default function ModalProveedor({ proveedor, onClose, onGuardado }: Props) {
  const esEdicion = !!proveedor

  const [form, setForm] = useState({
    id_proveedor: proveedor?.id_proveedor ?? '',
    nombre: proveedor?.nombre ?? '',
    cuit: proveedor?.cuit ?? '',
    telefono: proveedor?.telefono ?? '',
    email: proveedor?.email ?? '',
    direccion: proveedor?.direccion ?? '',
    contacto: proveedor?.contacto ?? '',
    notas: proveedor?.notas ?? '',
  })

  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm((p) => ({ ...p, [name]: value }))
  }

  const handleSubmit = async () => {
    setError('')
    if (!form.id_proveedor.trim()) return setError('El código es obligatorio')
    if (!form.nombre.trim()) return setError('El nombre es obligatorio')

    if (!esEdicion) {
      const check = await fetch('/api/proveedores').then((r) => r.json())
      if (check.ok) {
        const existe = check.data.find((p: { id_proveedor: string }) =>
          p.id_proveedor.toLowerCase() === form.id_proveedor.trim().toLowerCase()
        )
        if (existe) return setError(`Ya existe un proveedor con el código ${form.id_proveedor.toUpperCase()}`)
      }
    }

    setGuardando(true)
    const url = esEdicion
      ? `/api/proveedores/${encodeURIComponent(proveedor.id_proveedor)}`
      : '/api/proveedores'
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
        disabled={esEdicion && name === 'id_proveedor'}
        style={{
          width: '100%', padding: '8px 10px',
          border: '1px solid var(--border)', borderRadius: '6px',
          fontSize: '13px',
          backgroundColor: esEdicion && name === 'id_proveedor' ? '#f8fafc' : 'var(--input-bg)',
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
        width: '100%', maxWidth: '560px', maxHeight: '90vh',
        overflow: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
      }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '20px 24px', borderBottom: '1px solid var(--border)',
          position: 'sticky', top: 0, backgroundColor: 'var(--card-bg)', zIndex: 1,
        }}>
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
            {esEdicion ? 'Editar proveedor' : 'Nuevo proveedor'}
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {campo('Código *', 'id_proveedor', 'text', 'Ej: PROV-001')}
            {campo('Nombre *', 'nombre', 'text', 'Nombre del proveedor')}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {campo('CUIT', 'cuit', 'text', 'Ej: 20-12345678-9')}
            {campo('Teléfono', 'telefono', 'text', 'Ej: 351 123-4567')}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {campo('Email', 'email', 'email', 'correo@proveedor.com')}
            {campo('Contacto', 'contacto', 'text', 'Persona de contacto')}
          </div>
          {campo('Dirección', 'direccion', 'text', 'Calle y número')}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
              Notas
            </label>
            <textarea name="notas" value={form.notas} onChange={handleChange} rows={2}
              style={{
                width: '100%', padding: '8px 10px',
                border: '1px solid var(--border)', borderRadius: '6px',
                fontSize: '13px', backgroundColor: 'var(--input-bg)',
                color: 'var(--text-primary)', outline: 'none', resize: 'vertical',
              }} />
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
            {guardando ? 'Guardando...' : esEdicion ? 'Guardar cambios' : 'Crear proveedor'}
          </button>
        </div>
      </div>
    </div>
  )
}