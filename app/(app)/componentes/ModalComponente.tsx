'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import type { Componente } from './page'

interface Props {
  componente: Componente | null
  onClose: () => void
  onGuardado: () => void
}

const unidades = ['unidad', 'metro', 'metro lineal', 'kg', 'gramo', 'litro', 'ml', 'rollo', 'par', 'juego']

export default function ModalComponente({ componente, onClose, onGuardado }: Props) {
  const esEdicion = !!componente

  const [form, setForm] = useState({
    id_componente: componente?.id_componente ?? '',
    nombre: componente?.nombre ?? '',
    unidad: componente?.unidad ?? 'unidad',
    stock_actual: componente?.stock_actual ?? 0,
    stock_minimo: componente?.stock_minimo ?? 0,
    proveedor: componente?.proveedor ?? '',
    precio_unitario: componente?.precio_unitario ?? 0,
    ubicacion: componente?.ubicacion ?? '',
    notas: componente?.notas ?? '',
  })

  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async () => {
    setError('')
    if (!form.id_componente.trim()) return setError('El código es obligatorio')
    if (!form.nombre.trim()) return setError('El nombre es obligatorio')

    setGuardando(true)
    const url = esEdicion ? `/api/componentes/${encodeURIComponent(componente.id_componente)}` : '/api/componentes'
    const method = esEdicion ? 'PUT' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        stock_actual: Number(form.stock_actual),
        stock_minimo: Number(form.stock_minimo),
        precio_unitario: Number(form.precio_unitario),
      }),
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
        style={{
          width: '100%', padding: '8px 10px',
          border: '1px solid var(--border)', borderRadius: '6px',
          fontSize: '13px', backgroundColor: 'var(--input-bg)',
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
        {/* Header */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '20px 24px', borderBottom: '1px solid var(--border)',
        }}>
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
            {esEdicion ? 'Editar componente' : 'Nuevo componente'}
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {campo('Código *', 'id_componente', 'text', 'Ej: TORN-M4-15')}
            {/* Unidad */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                Unidad
              </label>
              <select
                name="unidad"
                value={form.unidad}
                onChange={handleChange}
                style={{
                  width: '100%', padding: '8px 10px',
                  border: '1px solid var(--border)', borderRadius: '6px',
                  fontSize: '13px', backgroundColor: 'var(--input-bg)',
                  color: 'var(--text-primary)', outline: 'none',
                }}
              >
                {unidades.map((u) => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
          </div>

          {campo('Nombre *', 'nombre', 'text', 'Descripción del componente')}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
            {campo('Stock actual', 'stock_actual', 'number')}
            {campo('Stock mínimo', 'stock_minimo', 'number')}
            {campo('Precio unitario ($)', 'precio_unitario', 'number')}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {campo('Proveedor', 'proveedor', 'text', 'Nombre del proveedor')}
            {campo('Ubicación', 'ubicacion', 'text', 'Ej: Estante A-3')}
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
            {guardando ? 'Guardando...' : esEdicion ? 'Guardar cambios' : 'Crear componente'}
          </button>
        </div>
      </div>
    </div>
  )
}