'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, ArrowLeft } from 'lucide-react'

interface Item { modelo: string; cantidad_solicitada: number; optica: string }
interface RecetaOpcion { codigo: string; nombre: string; activa: boolean }

const OPTICAS = ['14°', '24°', '38°', '60°', '65°', '100°', '120°', '140°', '160°']

export default function CrearProyectoPage() {
  const router = useRouter()
  const [cliente, setCliente] = useState('')
const [clientes, setClientes] = useState<{ id_cliente: string; nombre: string; razon_social: string }[]>([])
  const [nombre, setNombre] = useState('')
  const [fechaObjetivo, setFechaObjetivo] = useState('')
  const [prioridad, setPrioridad] = useState<'NORMAL' | 'URGENTE'>('NORMAL')
  const [notas, setNotas] = useState('')
  const [items, setItems] = useState<Item[]>([{ modelo: '', cantidad_solicitada: 1, optica: '' }])
  const [recetas, setRecetas] = useState<RecetaOpcion[]>([])
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')

 useEffect(() => {
  fetch('/api/recetas')
    .then((r) => r.json())
    .then((data) => { if (data.ok) setRecetas(data.data.filter((r: RecetaOpcion) => r.activa)) })
  fetch('/api/clientes')
    .then((r) => r.json())
    .then((data) => { if (data.ok) setClientes(data.data) })
}, [])

  const agregarItem = () => setItems((prev) => [...prev, { modelo: '', cantidad_solicitada: 1, optica: '' }])
  const quitarItem = (i: number) => setItems((prev) => prev.filter((_, idx) => idx !== i))
  const actualizarItem = (i: number, campo: keyof Item, valor: string | number) => {
    setItems((prev) => prev.map((it, idx) => (idx === i ? { ...it, [campo]: valor } : it)))
  }

  const guardar = async () => {
    setError('')
    if (!cliente) return setError('Ingresá el cliente')
    if (items.some((i) => !i.modelo || !i.optica || i.cantidad_solicitada < 1)) {
      return setError('Completá modelo, óptica y cantidad en todos los ítems')
    }
    setGuardando(true)
    const res = await fetch('/api/proyectos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cliente, nombre, fecha_objetivo: fechaObjetivo || null, prioridad, notas, items }),
    })
    const data = await res.json()
    setGuardando(false)
    if (!data.ok) return setError(data.error || 'Error al guardar')
    router.push(`/proyectos/${data.data._id}`)
  }

  const inputStyle = { width: '100%', padding: '8px 10px', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '13px', backgroundColor: 'var(--input-bg)', color: 'var(--text-primary)', outline: 'none' } as const
  const labelStyle = { display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' } as const

  return (
    <div style={{ padding: '32px', maxWidth: '900px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <button onClick={() => router.push('/proyectos')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '4px' }}>
          <ArrowLeft size={20} />
        </button>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)' }}>Nuevo Proyecto de Fábrica</h1>
      </div>

      <div style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '10px', padding: '20px 24px', marginBottom: '16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
          <div>
            <label style={labelStyle}>CLIENTE *</label>
            <select value={cliente} onChange={(e) => setCliente(e.target.value)} style={inputStyle}>
  <option value="">Seleccionar cliente...</option>
  {clientes.map((c) => (
    <option key={c.id_cliente} value={c.razon_social || c.nombre}>{c.nombre}</option>
  ))}
</select>
          </div>
          <div>
            <label style={labelStyle}>NOMBRE DEL PROYECTO</label>
            <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Opcional" style={inputStyle} />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label style={labelStyle}>FECHA OBJETIVO</label>
            <input type="date" value={fechaObjetivo} onChange={(e) => setFechaObjetivo(e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>PRIORIDAD</label>
            <select value={prioridad} onChange={(e) => setPrioridad(e.target.value as 'NORMAL' | 'URGENTE')} style={inputStyle}>
              <option value="NORMAL">Normal</option>
              <option value="URGENTE">Urgente</option>
            </select>
          </div>
        </div>
        <div style={{ marginTop: '16px' }}>
          <label style={labelStyle}>NOTAS</label>
          <textarea value={notas} onChange={(e) => setNotas(e.target.value)} rows={2} style={{ ...inputStyle, resize: 'vertical' }} />
        </div>
      </div>

      <div style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '10px', padding: '20px 24px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>Modelos a fabricar</h2>
          <button onClick={agregarItem} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer' }}>
            <Plus size={15} /> Agregar modelo
          </button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 110px 90px 36px', gap: '8px', marginBottom: '8px' }}>
          {['Modelo (receta)', 'Óptica', 'Cantidad', ''].map((h) => (
            <div key={h} style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)' }}>{h}</div>
          ))}
        </div>
        {items.map((it, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 110px 90px 36px', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
            <select value={it.modelo} onChange={(e) => actualizarItem(i, 'modelo', e.target.value)} style={{ ...inputStyle, fontSize: '12px' }}>
              <option value="">Seleccionar receta...</option>
              {recetas.map((r) => (
                <option key={r.codigo} value={r.codigo}>{r.codigo} — {r.nombre}</option>
              ))}
            </select>
            <select value={it.optica} onChange={(e) => actualizarItem(i, 'optica', e.target.value)} style={{ ...inputStyle, fontSize: '12px' }}>
              <option value="">Óptica</option>
              {OPTICAS.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
            <input type="number" min={1} value={it.cantidad_solicitada} onChange={(e) => actualizarItem(i, 'cantidad_solicitada', Number(e.target.value))} style={{ ...inputStyle, fontSize: '12px' }} />
            {items.length > 1 && (
              <button onClick={() => quitarItem(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)', padding: '4px' }}>
                <Trash2 size={15} />
              </button>
            )}
          </div>
        ))}
      </div>

      {error && (
        <div style={{ backgroundColor: 'var(--danger-bg)', color: 'var(--danger)', padding: '10px 14px', borderRadius: '6px', fontSize: '13px', marginBottom: '16px' }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
        <button onClick={() => router.push('/proyectos')} style={{ padding: '9px 16px', borderRadius: '8px', fontSize: '13px', border: '1px solid var(--border)', backgroundColor: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer' }}>
          Cancelar
        </button>
        <button onClick={guardar} disabled={guardando} style={{ padding: '9px 20px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, border: 'none', backgroundColor: 'var(--primary)', color: '#fff', cursor: guardando ? 'not-allowed' : 'pointer', opacity: guardando ? 0.7 : 1 }}>
          {guardando ? 'Guardando...' : 'Crear proyecto'}
        </button>
      </div>
    </div>
  )
}