'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import type { ProductoTerminado } from './page'

interface Props {
  producto: ProductoTerminado | null
  onClose: () => void
  onGuardado: () => void
}

export default function ModalProducto({ producto, onClose, onGuardado }: Props) {
  const esEdicion = !!producto

  const [form, setForm] = useState({
    codigo_luminaria: producto?.codigo_luminaria ?? '',
    nombre: producto?.nombre ?? '',
    stock_actual: producto?.stock_actual ?? 0,
    stock_minimo: producto?.stock_minimo ?? 0,
    precio_venta: producto?.precio_venta ?? 0,
    notas: producto?.notas ?? '',
  })

  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm((p) => ({ ...p, [name]: value }))
  }

  const handleSubmit = async () => {
    setError('')
    if (!form.codigo_luminaria.trim()) return setError('El código es obligatorio')
    if (!form.nombre.trim()) return setError('El nombre es obligatorio')

    setGuardando(true)
    const url = esEdicion
      ? `/api/productos/${encodeURIComponent(producto.codigo_luminaria)}`
      : '/api/productos'
    const method = esEdicion ? 'PUT' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        stock_actual: Number(form.stock_actual),
        stock_minimo: Number(form.stock_minimo),
        precio_venta: Number(form.precio_venta),
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
        disabled={esEdicion && name === 'codigo_luminaria'}
        style={{
          width: '100%', padding: '8px 10px',
          border: '1px solid var(--border)', borderRadius: '6px',
          fontSize: '13px',
          backgroundColor: esEdicion && name === 'codigo_luminaria' ? '#f8fafc' : 'var(--input-bg)',
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
        width: '100%', maxWidth: '520px', maxHeight: '90vh',
        overflow: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
      }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '20px 24px', borderBottom: '1px solid var(--border)',
          position: 'sticky', top: 0, backgroundColor: 'var(--card-bg)', zIndex: 1,
        }}>
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
            {esEdicion ? 'Editar producto' : 'Nuevo producto terminado'}
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {campo('Código luminaria *', 'codigo_luminaria', 'text', 'Ej: SYP323-150-100W')}
            {campo('Nombre *', 'nombre', 'text', 'Descripción del producto')}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
            {campo('Stock actual', 'stock_actual', 'number')}
            {campo('Stock mínimo', 'stock_minimo', 'number')}
            {campo('Precio venta ($)', 'precio_venta', 'number')}
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
            {guardando ? 'Guardando...' : esEdicion ? 'Guardar cambios' : 'Crear producto'}
          </button>
        </div>
      </div>
    </div>
  )
}