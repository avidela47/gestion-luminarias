'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import type { Vale } from './page'

interface Props {
  vale: Vale
  onClose: () => void
  onGuardado: () => void
}

export default function ModalDevolucion({ vale, onClose, onGuardado }: Props) {
  const [cantidades, setCantidades] = useState<number[]>(vale.items.map(() => 0))
  const [observaciones, setObservaciones] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    setError('')
    const total = cantidades.reduce((a, b) => a + b, 0)
    if (total === 0) return setError('Ingresá al menos una cantidad devuelta')

    for (let i = 0; i < cantidades.length; i++) {
      const pendiente = vale.items[i].cantidad_salida - vale.items[i].cantidad_devuelta
      if (cantidades[i] > pendiente) {
        return setError(`"${vale.items[i].descripcion}": no podés devolver más de lo pendiente (${pendiente})`)
      }
    }

    setGuardando(true)
    const res = await fetch(`/api/vales/${vale._id}/devolucion`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items_devueltos: cantidades, observaciones_devolucion: observaciones }),
    })
    const data = await res.json()
    setGuardando(false)
    if (!data.ok) return setError(data.error || 'Error al registrar devolución')
    onGuardado()
  }

  const inputStyle = {
    width: '100%', padding: '8px 10px',
    border: '1px solid var(--border)', borderRadius: '6px',
    fontSize: '13px', backgroundColor: 'var(--input-bg)',
    color: 'var(--text-primary)', outline: 'none',
  } as const

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ backgroundColor: 'var(--card-bg)', borderRadius: '12px', width: '100%', maxWidth: '520px', maxHeight: '90vh', overflow: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.4)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, backgroundColor: 'var(--card-bg)', zIndex: 1 }}>
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>Registrar devolución — {vale.numero}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={20} /></button>
        </div>

        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px 100px 100px', gap: '8px', marginBottom: '4px' }}>
            {['Descripción', 'Salió', 'Ya devuelto', 'Devuelve ahora'].map((h) => (
              <div key={h} style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)' }}>{h}</div>
            ))}
          </div>

          {vale.items.map((item, i) => {
            const pendiente = item.cantidad_salida - item.cantidad_devuelta
            return (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 100px 100px 100px', gap: '8px', alignItems: 'center' }}>
                <div style={{ fontSize: '13px', color: 'var(--text-primary)' }}>{item.descripcion}</div>
                <div style={{ fontSize: '13px', textAlign: 'center', color: 'var(--text-secondary)' }}>{item.cantidad_salida}</div>
                <div style={{ fontSize: '13px', textAlign: 'center', color: 'var(--success)' }}>{item.cantidad_devuelta}</div>
                <input
                  type="number" min={0} max={pendiente}
                  value={cantidades[i]}
                  onChange={(e) => setCantidades((p) => p.map((v, idx) => idx === i ? Number(e.target.value) : v))}
                  disabled={pendiente === 0}
                  style={{ ...inputStyle, textAlign: 'center', opacity: pendiente === 0 ? 0.5 : 1 }}
                />
              </div>
            )
          })}

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>OBSERVACIONES</label>
            <textarea value={observaciones} onChange={(e) => setObservaciones(e.target.value)} rows={2}
              style={{ ...inputStyle, resize: 'vertical' }} />
          </div>

          {error && <div style={{ backgroundColor: 'var(--danger-bg)', color: 'var(--danger)', padding: '10px 14px', borderRadius: '6px', fontSize: '13px' }}>{error}</div>}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', padding: '16px 24px', borderTop: '1px solid var(--border)', position: 'sticky', bottom: 0, backgroundColor: 'var(--card-bg)' }}>
          <button onClick={onClose} style={{ padding: '8px 16px', borderRadius: '6px', fontSize: '13px', border: '1px solid var(--border)', backgroundColor: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer' }}>
            Cancelar
          </button>
          <button onClick={handleSubmit} disabled={guardando}
            style={{ padding: '8px 20px', borderRadius: '6px', fontSize: '13px', fontWeight: 600, border: 'none', backgroundColor: 'var(--primary)', color: '#fff', cursor: guardando ? 'not-allowed' : 'pointer', opacity: guardando ? 0.7 : 1 }}>
            {guardando ? 'Guardando...' : 'Confirmar devolución'}
          </button>
        </div>
      </div>
    </div>
  )
}