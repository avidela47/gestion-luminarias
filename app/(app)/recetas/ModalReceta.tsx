'use client'

import { useState, useEffect } from 'react'
import { X, Plus, Trash2 } from 'lucide-react'
import type { Receta } from './page'

interface ComponenteOpcion {
  id_componente: string
  nombre: string
  unidad: string
}

interface Props {
  receta: Receta | null
  onClose: () => void
  onGuardado: () => void
}

export default function ModalReceta({ receta, onClose, onGuardado }: Props) {
  const esEdicion = !!receta

  const [form, setForm] = useState({
    codigo: receta?.codigo ?? '',
    nombre: receta?.nombre ?? '',
    activa: receta?.activa ?? true,
    notas: receta?.notas ?? '',
  })

  const [componentes, setComponentes] = useState<{ id_componente: string; cantidad: number }[]>(
    receta?.componentes ?? []
  )

  const [opcionesComponentes, setOpcionesComponentes] = useState<ComponenteOpcion[]>([])
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/componentes')
      .then((r) => r.json())
      .then((data) => {
        if (data.ok) setOpcionesComponentes(data.data)
      })
  }, [])

  const agregarComponente = () => {
    setComponentes((prev) => [...prev, { id_componente: '', cantidad: 1 }])
  }

  const quitarComponente = (index: number) => {
    setComponentes((prev) => prev.filter((_, i) => i !== index))
  }

  const actualizarComponente = (index: number, campo: string, valor: string | number) => {
    setComponentes((prev) =>
      prev.map((c, i) => (i === index ? { ...c, [campo]: valor } : c))
    )
  }

  const handleSubmit = async () => {
    setError('')
    if (!form.codigo.trim()) return setError('El código es obligatorio')
    if (!form.nombre.trim()) return setError('El nombre es obligatorio')
    if (componentes.length === 0) return setError('Debe agregar al menos un componente')

    const componentesInvalidos = componentes.some((c) => !c.id_componente || c.cantidad < 1)
    if (componentesInvalidos) return setError('Todos los componentes deben tener código y cantidad válida')

    setGuardando(true)
    const url = esEdicion ? `/api/recetas/${encodeURIComponent(receta.codigo)}` : '/api/recetas'
    const method = esEdicion ? 'PUT' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, componentes }),
    })

    const data = await res.json()
    setGuardando(false)
    if (!data.ok) return setError(data.error || 'Error al guardar')
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
        width: '100%', maxWidth: '640px', maxHeight: '90vh',
        overflow: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '20px 24px', borderBottom: '1px solid var(--border)',
          position: 'sticky', top: 0, backgroundColor: 'var(--card-bg)', zIndex: 1,
        }}>
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
            {esEdicion ? 'Editar receta' : 'Nueva receta'}
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                Código *
              </label>
              <input
                type="text"
                value={form.codigo}
                onChange={(e) => setForm((p) => ({ ...p, codigo: e.target.value }))}
                placeholder="Ej: SYP323-150-100W"
                disabled={esEdicion}
                style={{
                  width: '100%', padding: '8px 10px',
                  border: '1px solid var(--border)', borderRadius: '6px',
                  fontSize: '13px', backgroundColor: esEdicion ? '#f8fafc' : 'var(--input-bg)',
                  color: 'var(--text-primary)', outline: 'none',
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                Estado
              </label>
              <select
                value={form.activa ? 'true' : 'false'}
                onChange={(e) => setForm((p) => ({ ...p, activa: e.target.value === 'true' }))}
                style={{
                  width: '100%', padding: '8px 10px',
                  border: '1px solid var(--border)', borderRadius: '6px',
                  fontSize: '13px', backgroundColor: 'var(--input-bg)',
                  color: 'var(--text-primary)', outline: 'none',
                }}
              >
                <option value="true">Activa</option>
                <option value="false">Inactiva</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
              Nombre *
            </label>
            <input
              type="text"
              value={form.nombre}
              onChange={(e) => setForm((p) => ({ ...p, nombre: e.target.value }))}
              placeholder="Ej: Luminaria SYP323 150mm 100W"
              style={{
                width: '100%', padding: '8px 10px',
                border: '1px solid var(--border)', borderRadius: '6px',
                fontSize: '13px', backgroundColor: 'var(--input-bg)',
                color: 'var(--text-primary)', outline: 'none',
              }}
            />
          </div>

          {/* Componentes */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                COMPONENTES *
              </label>
              <button onClick={agregarComponente}
                style={{
                  display: 'flex', alignItems: 'center', gap: '4px',
                  fontSize: '12px', fontWeight: 600, color: 'var(--primary)',
                  background: 'none', border: 'none', cursor: 'pointer',
                }}>
                <Plus size={14} /> Agregar
              </button>
            </div>

            {componentes.length === 0 ? (
              <div style={{
                padding: '20px', textAlign: 'center', fontSize: '13px',
                color: 'var(--text-muted)', border: '1px dashed var(--border)', borderRadius: '8px',
              }}>
                No hay componentes. Hacé clic en Agregar para empezar.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {componentes.map((c, i) => (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 100px 36px', gap: '8px', alignItems: 'center' }}>
                    <select
                      value={c.id_componente}
                      onChange={(e) => actualizarComponente(i, 'id_componente', e.target.value)}
                      style={{
                        padding: '8px 10px', border: '1px solid var(--border)', borderRadius: '6px',
                        fontSize: '13px', backgroundColor: 'var(--input-bg)', color: 'var(--text-primary)', outline: 'none',
                      }}
                    >
                      <option value="">Seleccionar componente...</option>
                      {opcionesComponentes.map((op) => (
                        <option key={op.id_componente} value={op.id_componente}>
                          {op.id_componente} — {op.nombre}
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      min={1}
                      value={c.cantidad}
                      onChange={(e) => actualizarComponente(i, 'cantidad', Number(e.target.value))}
                      placeholder="Cant."
                      style={{
                        padding: '8px 10px', border: '1px solid var(--border)', borderRadius: '6px',
                        fontSize: '13px', backgroundColor: 'var(--input-bg)', color: 'var(--text-primary)', outline: 'none',
                      }}
                    />
                    <button onClick={() => quitarComponente(i)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)', padding: '4px' }}>
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
              Notas
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
            {guardando ? 'Guardando...' : esEdicion ? 'Guardar cambios' : 'Crear receta'}
          </button>
        </div>
      </div>
    </div>
  )
}