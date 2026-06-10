'use client'

import { useState } from 'react'
import { X, Plus, Trash2 } from 'lucide-react'
import { useSession } from 'next-auth/react'

interface ItemForm {
  descripcion: string
  cantidad_salida: number
  tipo: 'stock' | 'herramienta' | 'otro'
  notas: string
}

interface Props {
  onClose: () => void
  onGuardado: () => void
}

export default function ModalVale({ onClose, onGuardado }: Props) {
  const { data: session } = useSession()
  const [responsable, setResponsable] = useState('')
  const [observaciones, setObservaciones] = useState('')
  const [items, setItems] = useState<ItemForm[]>([
    { descripcion: '', cantidad_salida: 1, tipo: 'otro', notas: '' }
  ])
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')

  const agregarItem = () => setItems((p) => [...p, { descripcion: '', cantidad_salida: 1, tipo: 'otro', notas: '' }])
  const quitarItem = (i: number) => setItems((p) => p.filter((_, idx) => idx !== i))
  const actualizarItem = (i: number, campo: string, valor: string | number) => {
    setItems((p) => p.map((item, idx) => idx === i ? { ...item, [campo]: valor } : item))
  }

  const handleSubmit = async () => {
    setError('')
    if (!responsable.trim()) return setError('El responsable es obligatorio')
    if (items.some((i) => !i.descripcion.trim())) return setError('Todos los ítems deben tener descripción')

    setGuardando(true)
    const res = await fetch('/api/vales', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        responsable,
        emitido_por: session?.user?.name ?? 'admin',
        observaciones_salida: observaciones,
        items: items.map((i) => ({ ...i, cantidad_devuelta: 0 })),
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

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ backgroundColor: 'var(--card-bg)', borderRadius: '12px', width: '100%', maxWidth: '640px', maxHeight: '90vh', overflow: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, backgroundColor: 'var(--card-bg)', zIndex: 1 }}>
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>Nuevo vale de salida</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={20} /></button>
        </div>

        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>RESPONSABLE *</label>
            <input type="text" value={responsable} onChange={(e) => setResponsable(e.target.value)}
              placeholder="Nombre de quien retira" style={inputStyle} />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>ÍTEMS *</label>
              <button onClick={agregarItem}
                style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 600, color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer' }}>
                <Plus size={14} /> Agregar
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 70px 110px 36px', gap: '6px', marginBottom: '6px' }}>
              {['Descripción', 'Cant.', 'Tipo', ''].map((h) => (
                <div key={h} style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)' }}>{h}</div>
              ))}
            </div>

            {items.map((item, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 70px 110px 36px', gap: '6px', marginBottom: '8px', alignItems: 'center' }}>
                <input type="text" value={item.descripcion} onChange={(e) => actualizarItem(i, 'descripcion', e.target.value)}
                  placeholder="Descripción del ítem" style={{ ...inputStyle, fontSize: '12px' }} />
                <input type="number" min={1} value={item.cantidad_salida} onChange={(e) => actualizarItem(i, 'cantidad_salida', Number(e.target.value))}
                  style={{ ...inputStyle, fontSize: '12px' }} />
                <select value={item.tipo} onChange={(e) => actualizarItem(i, 'tipo', e.target.value)} style={{ ...inputStyle, fontSize: '12px' }}>
                  <option value="stock">Stock</option>
                  <option value="herramienta">Herramienta</option>
                  <option value="otro">Otro</option>
                </select>
                <button onClick={() => quitarItem(i)} disabled={items.length === 1}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)', padding: '4px', opacity: items.length === 1 ? 0.3 : 1 }}>
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>

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
            {guardando ? 'Guardando...' : 'Crear vale'}
          </button>
        </div>
      </div>
    </div>
  )
}