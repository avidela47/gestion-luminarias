'use client'

import { useEffect, useState } from 'react'
import { Plus, Search, Pencil, Trash2, Lightbulb } from 'lucide-react'
import ModalLuminaria from './ModalLuminaria'

export interface LuminariaItem {
  _id: string
  codigo_luminaria?: string
  codigo?: string
  descripcion: string
  stock_actual: number
  stock_minimo: number
  precio: number
  proveedor?: string
  notas?: string
  tiene_receta: boolean
  tipo: 'fabricada' | 'comercial'
  origen?: 'importada' | 'nacional'
}

const tipoBadge = (item: LuminariaItem) => {
  if (item.tipo === 'fabricada') return { label: 'FABRICADA', bg: 'var(--success-bg)', color: 'var(--success)' }
  if (item.origen === 'nacional') return { label: 'DEPÓSITO', bg: '#8b5cf618', color: '#8b5cf6' }
  return { label: 'COMERCIAL', bg: 'var(--info-bg)', color: 'var(--info)' }
}

export default function LuminariasPage() {
  const [items, setItems] = useState<LuminariaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [filtroTipo, setFiltroTipo] = useState<string>('todos')
  const [modalAbierto, setModalAbierto] = useState(false)
  const [itemEditar, setItemEditar] = useState<LuminariaItem | null>(null)
  const [confirmarEliminar, setConfirmarEliminar] = useState<{ codigo: string; tipo: 'fabricada' | 'comercial' } | null>(null)

  const cargar = async () => {
    const [prodRes, comRes] = await Promise.all([
      fetch('/api/productos').then((r) => r.json()),
      fetch('/api/luminarias-comerciales').then((r) => r.json()),
    ])
    const fabricadas: LuminariaItem[] = (prodRes.ok ? prodRes.data : []).map((p: {
      _id: string; codigo_luminaria: string; descripcion: string;
      stock_actual: number; stock_minimo: number; precio: number; notas: string
    }) => ({ ...p, codigo: p.codigo_luminaria, tiene_receta: true, tipo: 'fabricada' as const }))

    const comerciales: LuminariaItem[] = (comRes.ok ? comRes.data : []).map((c: {
      _id: string; codigo: string; descripcion: string;
      stock_actual: number; stock_minimo: number; precio: number; proveedor: string; notas: string; origen: 'importada' | 'nacional'
    }) => ({ ...c, codigo_luminaria: c.codigo, tiene_receta: false, tipo: 'comercial' as const }))

    setItems([...fabricadas, ...comerciales].sort((a, b) => (a.codigo ?? '').localeCompare(b.codigo ?? '')))
    setLoading(false)
  }

  useEffect(() => {
    let activo = true
    async function fetchData() {
      const [prodRes, comRes] = await Promise.all([
        fetch('/api/productos').then((r) => r.json()),
        fetch('/api/luminarias-comerciales').then((r) => r.json()),
      ])
      if (!activo) return
      const fabricadas: LuminariaItem[] = (prodRes.ok ? prodRes.data : []).map((p: {
        _id: string; codigo_luminaria: string; descripcion: string;
        stock_actual: number; stock_minimo: number; precio: number; notas: string
      }) => ({ ...p, codigo: p.codigo_luminaria, tiene_receta: true, tipo: 'fabricada' as const }))

      const comerciales: LuminariaItem[] = (comRes.ok ? comRes.data : []).map((c: {
        _id: string; codigo: string; descripcion: string;
        stock_actual: number; stock_minimo: number; precio: number; proveedor: string; notas: string; origen: 'importada' | 'nacional'
      }) => ({ ...c, codigo_luminaria: c.codigo, tiene_receta: false, tipo: 'comercial' as const }))

      setItems([...fabricadas, ...comerciales].sort((a, b) => (a.codigo ?? '').localeCompare(b.codigo ?? '')))
      setLoading(false)
    }
    fetchData()
    return () => { activo = false }
  }, [])

  const filtrados = items.filter((i) => {
    const codigo = i.codigo ?? i.codigo_luminaria ?? ''
    const matchBusqueda =
      codigo.toLowerCase().includes(busqueda.toLowerCase()) ||
      i.descripcion.toLowerCase().includes(busqueda.toLowerCase())
    let matchTipo = true
    if (filtroTipo === 'fabricada') matchTipo = i.tipo === 'fabricada'
    else if (filtroTipo === 'comercial') matchTipo = i.tipo === 'comercial' && i.origen !== 'nacional'
    else if (filtroTipo === 'deposito') matchTipo = i.tipo === 'comercial' && i.origen === 'nacional'
    return matchBusqueda && matchTipo
  })

  const eliminar = async () => {
    if (!confirmarEliminar) return
    const { codigo, tipo } = confirmarEliminar
    const url = tipo === 'fabricada'
      ? `/api/productos/${encodeURIComponent(codigo)}`
      : `/api/luminarias-comerciales/${encodeURIComponent(codigo)}`
    await fetch(url, { method: 'DELETE' })
    setConfirmarEliminar(null)
    cargar()
  }

  return (
    <div style={{ padding: '32px', maxWidth: '1200px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)' }}>Luminarias</h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Stock de luminarias fabricadas, comerciales y de depósito
          </p>
        </div>
        <button onClick={() => { setItemEditar(null); setModalAbierto(true) }}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            backgroundColor: 'var(--primary)', color: '#fff',
            border: 'none', borderRadius: '8px',
            padding: '9px 16px', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
          }}>
          <Plus size={16} /> Nueva luminaria
        </button>
      </div>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
        <div style={{ position: 'relative' }}>
          <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input type="text" placeholder="Buscar por código o descripción..."
            value={busqueda} onChange={(e) => setBusqueda(e.target.value)}
            style={{
              padding: '8px 12px 8px 32px', width: '280px',
              border: '1px solid var(--border)', borderRadius: '8px',
              fontSize: '13px', backgroundColor: 'var(--input-bg)',
              color: 'var(--text-primary)', outline: 'none',
            }}
          />
        </div>
        <select value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)}
          style={{
            padding: '8px 12px', border: '1px solid var(--border)', borderRadius: '8px',
            fontSize: '13px', backgroundColor: 'var(--input-bg)',
            color: 'var(--text-primary)', outline: 'none', cursor: 'pointer',
          }}>
          <option value="todos">Todos los tipos</option>
          <option value="fabricada">Fabricadas (con receta)</option>
          <option value="comercial">Comerciales (importadas)</option>
          <option value="deposito">Depósito (nacionales)</option>
        </select>
      </div>

      <div style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '10px', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Cargando...</div>
        ) : filtrados.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Lightbulb size={32} style={{ marginBottom: '8px', opacity: 0.4 }} />
            <div>No hay luminarias{busqueda ? ' que coincidan' : ' cargadas aún'}</div>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid var(--border)' }}>
                {['Código', 'Descripción', 'Tipo', 'Stock actual', 'Stock mínimo', 'Precio U$S', 'Proveedor', ''].map((h) => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtrados.map((item) => {
                const codigo = item.codigo ?? item.codigo_luminaria ?? ''
                const bajoMinimo = item.stock_actual < item.stock_minimo
                const badge = tipoBadge(item)
                return (
                  <tr key={item._id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '10px 16px', fontWeight: 600, color: 'var(--primary)' }}>{codigo}</td>
                    <td style={{ padding: '10px 16px', color: 'var(--text-primary)' }}>{item.descripcion}</td>
                    <td style={{ padding: '10px 16px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '4px', backgroundColor: badge.bg, color: badge.color }}>
                        {badge.label}
                      </span>
                    </td>
                    <td style={{ padding: '10px 16px', fontWeight: 600, color: bajoMinimo ? 'var(--danger)' : 'var(--success)' }}>
                      {item.stock_actual}
                      {bajoMinimo && (
                        <span style={{ marginLeft: '6px', fontSize: '10px', backgroundColor: 'var(--danger-bg)', color: 'var(--danger)', padding: '2px 6px', borderRadius: '4px' }}>BAJO</span>
                      )}
                    </td>
                    <td style={{ padding: '10px 16px', color: 'var(--text-secondary)' }}>{item.stock_minimo}</td>
                    <td style={{ padding: '10px 16px', color: 'var(--text-secondary)' }}>
                      {item.precio > 0 ? item.precio.toLocaleString('es-AR', { minimumFractionDigits: 2 }) : '—'}
                    </td>
                    <td style={{ padding: '10px 16px', color: 'var(--text-secondary)' }}>{item.proveedor || '—'}</td>
                    <td style={{ padding: '10px 16px' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => { setItemEditar(item); setModalAbierto(true) }} title="Editar"
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '4px' }}>
                          <Pencil size={15} />
                        </button>
                        <button onClick={() => setConfirmarEliminar({ codigo, tipo: item.tipo })} title="Eliminar"
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)', padding: '4px' }}>
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {modalAbierto && (
        <ModalLuminaria
          item={itemEditar}
          onClose={() => setModalAbierto(false)}
          onGuardado={() => { setModalAbierto(false); cargar() }}
        />
      )}

      {confirmarEliminar && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 200,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            backgroundColor: 'var(--card-bg)', borderRadius: '12px',
            padding: '28px', maxWidth: '380px', width: '100%',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>Eliminar luminaria</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '24px' }}>
              ¿Confirmás que querés eliminar <b>{confirmarEliminar.codigo}</b>? Esta acción no se puede deshacer.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button onClick={() => setConfirmarEliminar(null)}
                style={{ padding: '8px 16px', borderRadius: '6px', fontSize: '13px', border: '1px solid var(--border)', backgroundColor: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                Cancelar
              </button>
              <button onClick={eliminar}
                style={{ padding: '8px 20px', borderRadius: '6px', fontSize: '13px', fontWeight: 600, border: 'none', backgroundColor: 'var(--danger)', color: '#fff', cursor: 'pointer' }}>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}