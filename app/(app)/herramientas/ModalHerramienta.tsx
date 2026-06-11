'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import type { Herramienta } from './page'

interface Props {
  item: Herramienta | null
  onClose: () => void
  onGuardado: () => void
}

export default function ModalHerramienta({ item, onClose, onGuardado }: Props) {
  const esEdicion = !!item

  const [form, setForm] = useState({
    codigo: item?.codigo ?? '',
    nombre: item?.nombre ?? '',
    descripcion: item?.descripcion ?? '',
    cantidad_total: item?.cantidad_total ?? 1,
    cantidad_disponible: item?.cantidad_disponible ?? 1,
    estado: item?.estado ?? 'disponible',
    ubicacion: item?.ubicacion ?? '',
    notas: item?.notas ?? '',
  })

  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm((p) => ({ ...p, [name]: value }))
  }

  const handleSubmit = async () => {
    setError('')
    if (!form.codigo.trim()) return setError('El código es obligatorio')
    if (!form.nombre.trim()) return setError('El nombre es obligatorio')
    if (Number(form.cantidad_disponible) > Number(form.cantidad_total)) {
      return setError('La cantidad disponible no puede ser mayor al total')
    }

    setGuardando(true)
    const url = esEdicion ? `/api/herramientas/${encodeURIComponent(item.codigo)}` : '/api/herramientas'
    const method = esEdicion ? 'PUT' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        cantidad_total: Number(form.cantidad_total),
        cantidad_disponible: Number(form.cantidad_disponible),
      }),
    })

    const data = await res.json()
    setGuardando(false)
    if (!data.ok) return setError(data.error || 'Error al guardar')
    onGuardado()
  }

  const inputStyle = {
    width: '100%', padding: '8px 10px',
    border: '1px solid var(--border)', borderRadius: '6px',
    fontSize: '13px', backgroundColor: 'var(--input-bg)',
    color: 'var(--text-primary)', outline: 'none',
  } as const

  const labelStyle = {
    display: 'block', fontSize: '12px', fontWeight: 600,
    color: 'var(--text-secondary)', marginBottom: '4px',
  } as const

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ backgroundColor: 'var(--card-bg)', borderRadius: '12px', width: '100%', maxWidth: '520px', maxHeight: '90vh', overflow: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, backgroundColor: 'var(--card-bg)', zIndex: 1 }}>
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
            {esEdicion ? 'Editar herramienta' : 'Nueva herramienta'}
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={20} /></button>
        </div>

        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={labelStyle}>CÓDIGO *</label>
              <input type="text" name="codigo" value={form.codigo} onChange={handleChange}
                placeholder="Ej: HERRA-001" disabled={esEdicion}
                style={{ ...inputStyle, backgroundColor: esEdicion ? '#f8fafc' : 'var(--input-bg)' }} />
            </div>
            <div>
              <label style={labelStyle}>ESTADO</label>
              <select name="estado" value={form.estado} onChange={handleChange} style={inputStyle}>
                <option value="disponible">Disponible</option>
                <option value="en_uso">En uso</option>
                <option value="reparacion">Reparación</option>
                <option value="baja">Baja</option>
              </select>
            </div>
          </div>

          <div>
            <label style={labelStyle}>NOMBRE *</label>
            <input type="text" name="nombre" value={form.nombre} onChange={handleChange}
              placeholder="Ej: Taladro percutor" style={inputStyle} />
          </div>

          <div>
            <label style={labelStyle}>DESCRIPCIÓN</label>
            <input type="text" name="descripcion" value={form.descripcion} onChange={handleChange}
              placeholder="Marca, modelo, características" style={inputStyle} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={labelStyle}>CANTIDAD TOTAL</label>
              <input type="number" name="cantidad_total" min={1} value={form.cantidad_total} onChange={handleChange} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>CANTIDAD DISPONIBLE</label>
              <input type="number" name="cantidad_disponible" min={0} value={form.cantidad_disponible} onChange={handleChange} style={inputStyle} />
            </div>
          </div>

          <div>
            <label style={labelStyle}>UBICACIÓN</label>
            <input type="text" name="ubicacion" value={form.ubicacion} onChange={handleChange}
              placeholder="Ej: Depósito A - Estante 2" style={inputStyle} />
          </div>

          <div>
            <label style={labelStyle}>NOTAS</label>
            <textarea name="notas" value={form.notas} onChange={handleChange} rows={2}
              style={{ ...inputStyle, resize: 'vertical' }} />
          </div>

          {error && (
            <div style={{ backgroundColor: 'var(--danger-bg)', color: 'var(--danger)', padding: '10px 14px', borderRadius: '6px', fontSize: '13px' }}>
              {error}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', padding: '16px 24px', borderTop: '1px solid var(--border)', position: 'sticky', bottom: 0, backgroundColor: 'var(--card-bg)' }}>
          <button onClick={onClose}
            style={{ padding: '8px 16px', borderRadius: '6px', fontSize: '13px', border: '1px solid var(--border)', backgroundColor: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer' }}>
            Cancelar
          </button>
          <button onClick={handleSubmit} disabled={guardando}
            style={{ padding: '8px 20px', borderRadius: '6px', fontSize: '13px', fontWeight: 600, border: 'none', backgroundColor: 'var(--primary)', color: '#fff', cursor: guardando ? 'not-allowed' : 'pointer', opacity: guardando ? 0.7 : 1 }}>
            {guardando ? 'Guardando...' : esEdicion ? 'Guardar cambios' : 'Crear herramienta'}
          </button>
        </div>
      </div>
    </div>
  )
}