'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'

interface ComponenteOpcion {
  id_componente: string
  nombre: string
  stock_actual: number
  unidad: string
}

interface Props {
  onClose: () => void
  onGuardado: () => void
}

export default function ModalMovimiento({ onClose, onGuardado }: Props) {
  const [form, setForm] = useState({
    tipo: 'entrada_compra',
    id_componente: '',
    cantidad: 1,
    referencia: '',
    notas: '',
    usuario: 'admin',
  })

  const [componentes, setComponentes] = useState<ComponenteOpcion[]>([])
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/componentes')
      .then((r) => r.json())
      .then((data) => { if (data.ok) setComponentes(data.data) })
  }, [])

  const componenteSeleccionado = componentes.find((c) => c.id_componente === form.id_componente)

  const handleSubmit = async () => {
    setError('')
    if (!form.id_componente) return setError('Seleccioná un componente')
    if (form.cantidad < 1) return setError('La cantidad debe ser mayor a 0')

    setGuardando(true)
    const res = await fetch('/api/movimientos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })

    const data = await res.json()
    setGuardando(false)
    if (!data.ok) return setError(data.error || 'Error al registrar movimiento')
    onGuardado()
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        backgroundColor: 'var(--card-bg)', borderRadius: '12px',
        width: '100%', maxWidth: '480px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '20px 24px', borderBottom: '1px solid var(--border)',
        }}>
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
            Registrar movimiento
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Tipo */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
              TIPO DE MOVIMIENTO *
            </label>
            <select
              value={form.tipo}
              onChange={(e) => setForm((p) => ({ ...p, tipo: e.target.value }))}
              style={{
                width: '100%', padding: '8px 10px',
                border: '1px solid var(--border)', borderRadius: '6px',
                fontSize: '13px', backgroundColor: 'var(--input-bg)',
                color: 'var(--text-primary)', outline: 'none',
              }}
            >
              <option value="entrada_compra">Compra (entrada)</option>
              <option value="ajuste_manual_entrada">Ajuste manual entrada</option>
              <option value="ajuste_manual_salida">Ajuste manual salida</option>
            </select>
          </div>

          {/* Componente */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
              COMPONENTE *
            </label>
            <select
              value={form.id_componente}
              onChange={(e) => setForm((p) => ({ ...p, id_componente: e.target.value }))}
              style={{
                width: '100%', padding: '8px 10px',
                border: '1px solid var(--border)', borderRadius: '6px',
                fontSize: '13px', backgroundColor: 'var(--input-bg)',
                color: 'var(--text-primary)', outline: 'none',
              }}
            >
              <option value="">Seleccionar componente...</option>
              {componentes.map((c) => (
                <option key={c.id_componente} value={c.id_componente}>
                  {c.id_componente} — {c.nombre} (stock: {c.stock_actual} {c.unidad})
                </option>
              ))}
            </select>
            {componenteSeleccionado && (
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                Stock actual: <b style={{ color: 'var(--text-primary)' }}>{componenteSeleccionado.stock_actual} {componenteSeleccionado.unidad}</b>
              </div>
            )}
          </div>

          {/* Cantidad */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
              CANTIDAD *
            </label>
            <input
              type="number"
              min={1}
              value={form.cantidad}
              onChange={(e) => setForm((p) => ({ ...p, cantidad: Number(e.target.value) }))}
              style={{
                width: '100%', padding: '8px 10px',
                border: '1px solid var(--border)', borderRadius: '6px',
                fontSize: '13px', backgroundColor: 'var(--input-bg)',
                color: 'var(--text-primary)', outline: 'none',
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                REFERENCIA
              </label>
              <input
                type="text"
                value={form.referencia}
                onChange={(e) => setForm((p) => ({ ...p, referencia: e.target.value }))}
                placeholder="Ej: OC-2026-001"
                style={{
                  width: '100%', padding: '8px 10px',
                  border: '1px solid var(--border)', borderRadius: '6px',
                  fontSize: '13px', backgroundColor: 'var(--input-bg)',
                  color: 'var(--text-primary)', outline: 'none',
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                USUARIO
              </label>
              <input
                type="text"
                value={form.usuario}
                onChange={(e) => setForm((p) => ({ ...p, usuario: e.target.value }))}
                style={{
                  width: '100%', padding: '8px 10px',
                  border: '1px solid var(--border)', borderRadius: '6px',
                  fontSize: '13px', backgroundColor: 'var(--input-bg)',
                  color: 'var(--text-primary)', outline: 'none',
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
              NOTAS
            </label>
            <textarea
              value={form.notas}
              onChange={(e) => setForm((p) => ({ ...p, notas: e.target.value }))}
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
            {guardando ? 'Guardando...' : 'Registrar'}
          </button>
        </div>
      </div>
    </div>
  )
}