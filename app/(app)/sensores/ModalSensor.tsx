'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import type { SensorFuente } from './page'

interface Props {
  item: SensorFuente | null
  onClose: () => void
  onGuardado: () => void
}

export default function ModalSensor({ item, onClose, onGuardado }: Props) {
  const esEdicion = !!item

  const [form, setForm] = useState({
    codigo: item?.codigo ?? '',
    descripcion: item?.descripcion ?? '',
    tipo: item?.tipo ?? 'sensor',
    stock_actual: item?.stock_actual ?? 0,
    stock_minimo: item?.stock_minimo ?? 0,
    precio: item?.precio ?? 0,
    proveedor: item?.proveedor ?? '',
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
    if (!form.descripcion.trim()) return setError('La descripción es obligatoria')

    setGuardando(true)
    const url = esEdicion ? `/api/sensores/${encodeURIComponent(item.codigo)}` : '/api/sensores'
    const method = esEdicion ? 'PUT' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        stock_actual: Number(form.stock_actual),
        stock_minimo: Number(form.stock_minimo),
        precio: Number(form.precio),
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
            {esEdicion ? 'Editar producto' : 'Nuevo producto'}
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={labelStyle}>CÓDIGO *</label>
              <input
                type="text" name="codigo" value={form.codigo}
                onChange={handleChange} placeholder="Ej: BGS-ZL10CP"
                disabled={esEdicion}
                style={{ ...inputStyle, backgroundColor: esEdicion ? '#f8fafc' : 'var(--input-bg)' }}
              />
            </div>
            <div>
              <label style={labelStyle}>TIPO *</label>
              <select name="tipo" value={form.tipo} onChange={handleChange} style={inputStyle}>
                <option value="sensor">Sensor</option>
                <option value="fuente">Fuente</option>
                <option value="acoplamiento_flexible">Acoplamiento Flexible</option>
                <option value="actuador">Actuador</option>
                <option value="espejo">Espejo</option>
                <option value="iluminacion">Iluminación</option>
                <option value="interruptor_actuador">Interruptor - Actuador</option>
                <option value="modulo_seguridad">Módulo de Seguridad</option>
                <option value="soporte">Soporte</option>
              </select>
            </div>
          </div>

          <div>
            <label style={labelStyle}>DESCRIPCIÓN *</label>
            <input
              type="text" name="descripcion" value={form.descripcion}
              onChange={handleChange} placeholder="Descripción del producto"
              style={inputStyle}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
            <div>
              <label style={labelStyle}>STOCK ACTUAL</label>
              <input type="number" name="stock_actual" value={form.stock_actual} onChange={handleChange} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>STOCK MÍNIMO</label>
              <input type="number" name="stock_minimo" value={form.stock_minimo} onChange={handleChange} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>PRECIO U$S</label>
              <input type="number" name="precio" value={form.precio} onChange={handleChange} step={0.01} style={inputStyle} />
            </div>
          </div>

          <div>
            <label style={labelStyle}>PROVEEDOR</label>
            <input type="text" name="proveedor" value={form.proveedor} onChange={handleChange}
              placeholder="Nombre del proveedor" style={inputStyle} />
          </div>

          <div>
            <label style={labelStyle}>NOTAS</label>
            <textarea name="notas" value={form.notas} onChange={handleChange} rows={2}
              style={{ ...inputStyle, resize: 'vertical' }} />
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