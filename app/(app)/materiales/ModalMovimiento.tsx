'use client'

import { useEffect, useState } from 'react'
import { X, ArrowDownCircle, ArrowUpCircle, RotateCcw } from 'lucide-react'
import type { Material } from './page'

interface OrdenTrabajo {
  _id: string
  numero: string
  razon_social: string
}

interface Props {
  material: Material
  tipo: 'entrada' | 'salida' | 'devolucion'
  onClose: () => void
  onGuardado: () => void
}

export default function ModalMovimiento({ material, tipo, onClose, onGuardado }: Props) {
  const [ordenes, setOrdenes] = useState<OrdenTrabajo[]>([])
  const [form, setForm] = useState({
    cantidad: 1,
    id_orden: '',
    numero_orden: '',
    notas: '',
  })
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (tipo === 'salida' || tipo === 'devolucion') {
      fetch('/api/ordenes')
        .then((r) => r.json())
        .then((data) => { if (data.ok) setOrdenes(data.data) })
    }
  }, [tipo])

  const seleccionarOrden = (id: string) => {
    const o = ordenes.find((o) => o._id === id)
    setForm((p) => ({ ...p, id_orden: id, numero_orden: o?.numero ?? '' }))
  }

  const handleSubmit = async () => {
    setError('')
    if (!form.cantidad || form.cantidad <= 0) return setError('La cantidad debe ser mayor a 0')
    if (tipo === 'salida' && !form.numero_orden) return setError('La salida requiere una OT asociada')
    if (tipo === 'devolucion' && !form.numero_orden) return setError('La devolución requiere una OT asociada')

    setGuardando(true)
    const res = await fetch(`/api/materiales/${material._id}/movimiento`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, tipo }),
    })

    const data = await res.json()
    setGuardando(false)
    if (!data.ok) return setError(data.error || 'Error al registrar')
    onGuardado()
  }

  const config = {
    entrada: { label: 'Entrada de material', color: 'var(--success)', icon: ArrowDownCircle },
    salida: { label: 'Salida de material', color: 'var(--danger)', icon: ArrowUpCircle },
    devolucion: { label: 'Devolución de material', color: 'var(--info)', icon: RotateCcw },
  }

  const cfg = config[tipo]
  const Icon = cfg.icon

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
        width: '100%', maxWidth: '460px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
      }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '20px 24px', borderBottom: '1px solid var(--border)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Icon size={18} color={cfg.color} />
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
              {cfg.label}
            </h2>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ backgroundColor: '#f8fafc', borderRadius: '8px', padding: '12px 16px', fontSize: '13px' }}>
            <div style={{ fontWeight: 700, color: 'var(--primary)' }}>{material.codigo}</div>
            <div style={{ color: 'var(--text-secondary)', marginTop: '2px' }}>{material.descripcion}</div>
            <div style={{ marginTop: '6px', fontSize: '12px', color: 'var(--text-muted)' }}>
              Stock actual: <b style={{ color: 'var(--text-primary)' }}>{material.stock_actual} {material.unidad}</b>
            </div>
          </div>

          <div>
            <label style={labelStyle}>CANTIDAD *</label>
            <input
              type="number" min={1} value={form.cantidad}
              onChange={(e) => setForm((p) => ({ ...p, cantidad: Number(e.target.value) }))}
              style={inputStyle}
            />
          </div>

          {(tipo === 'salida' || tipo === 'devolucion') && (
            <div>
              <label style={labelStyle}>ORDEN DE TRABAJO *</label>
              <select
                value={form.id_orden}
                onChange={(e) => seleccionarOrden(e.target.value)}
                style={inputStyle}
              >
                <option value="">Seleccionar OT...</option>
                {ordenes.map((o) => (
                  <option key={o._id} value={o._id}>
                    {o.numero} — {o.razon_social}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label style={labelStyle}>NOTAS</label>
            <input
              type="text" value={form.notas}
              onChange={(e) => setForm((p) => ({ ...p, notas: e.target.value }))}
              placeholder={tipo === 'devolucion' ? 'Ej: Sobrante de obra' : 'Observaciones'}
              style={inputStyle}
            />
          </div>

          {error && (
            <div style={{ backgroundColor: 'var(--danger-bg)', color: 'var(--danger)', padding: '10px 14px', borderRadius: '6px', fontSize: '13px' }}>
              {error}
            </div>
          )}
        </div>

        <div style={{
          display: 'flex', justifyContent: 'flex-end', gap: '10px',
          padding: '16px 24px', borderTop: '1px solid var(--border)',
        }}>
          <button onClick={onClose}
            style={{ padding: '8px 16px', borderRadius: '6px', fontSize: '13px', border: '1px solid var(--border)', backgroundColor: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer' }}>
            Cancelar
          </button>
          <button onClick={handleSubmit} disabled={guardando}
            style={{ padding: '8px 20px', borderRadius: '6px', fontSize: '13px', fontWeight: 600, border: 'none', backgroundColor: cfg.color, color: '#fff', cursor: guardando ? 'not-allowed' : 'pointer', opacity: guardando ? 0.7 : 1 }}>
            {guardando ? 'Guardando...' : 'Confirmar'}
          </button>
        </div>
      </div>
    </div>
  )
}