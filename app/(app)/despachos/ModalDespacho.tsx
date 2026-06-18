'use client'

import { useEffect, useState } from 'react'
import { X, Plus, Trash2, Search } from 'lucide-react'

interface Cliente {
  id_cliente: string
  nombre: string
  razon_social: string
}

interface Presupuesto {
  _id: string
  numero: string
  razon_social: string
  id_cliente: string
  lineas: { codigo: string; descripcion: string; cantidad: number; precio_unitario: number }[]
}

interface ItemForm {
  codigo: string
  descripcion: string
  cantidad: number
  tipo: 'fabricada' | 'comercial' | 'deposito'
  precio_unitario: number
}

interface LuminariaStock {
  codigo: string
  descripcion: string
  tipo: 'fabricada' | 'comercial' | 'deposito'
  stock_actual: number
  precio: number
}

interface Props {
  onClose: () => void
  onGuardado: () => void
}

export default function ModalDespacho({ onClose, onGuardado }: Props) {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [presupuestos, setPresupuestos] = useState<Presupuesto[]>([])
  const [luminarias, setLuminarias] = useState<LuminariaStock[]>([])
  const [clienteId, setClienteId] = useState('')
  const [razonSocial, setRazonSocial] = useState('')
  const [presupuestoId, setPresupuestoId] = useState('')
  const [numeroPresupuesto, setNumeroPresupuesto] = useState('')
  const [items, setItems] = useState<ItemForm[]>([])
  const [observaciones, setObservaciones] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')
  const [busquedaCatalogo, setBusquedaCatalogo] = useState('')
  const [mostrarCatalogo, setMostrarCatalogo] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch('/api/clientes').then((r) => r.json()),
      fetch('/api/presupuestos').then((r) => r.json()),
      fetch('/api/productos').then((r) => r.json()),
      fetch('/api/luminarias-comerciales').then((r) => r.json()),
    ]).then(([cRes, pRes, prodRes, comRes]) => {
      if (cRes.ok) setClientes(cRes.data)
      if (pRes.ok) setPresupuestos(pRes.data.filter((p: Presupuesto & { estado: string }) => p.estado === 'Aprobado'))

      const lums: LuminariaStock[] = []
      if (prodRes.ok) {
        prodRes.data.forEach((p: { codigo_luminaria: string; nombre: string; stock_actual: number; precio_venta: number }) => {
          lums.push({ codigo: p.codigo_luminaria, descripcion: p.nombre, tipo: 'fabricada', stock_actual: p.stock_actual, precio: p.precio_venta })
        })
      }
      if (comRes.ok) {
        comRes.data.forEach((c: { codigo: string; descripcion: string; stock_actual: number; precio: number; origen: string }) => {
          lums.push({ codigo: c.codigo, descripcion: c.descripcion, tipo: c.origen === 'nacional' ? 'deposito' : 'comercial', stock_actual: c.stock_actual, precio: c.precio })
        })
      }
      setLuminarias(lums.sort((a, b) => a.codigo.localeCompare(b.codigo)))
    })
  }, [])

  const seleccionarCliente = (id: string) => {
    const c = clientes.find((c) => c.id_cliente === id)
    setClienteId(id)
    setRazonSocial(c ? (c.razon_social || c.nombre) : '')
    setPresupuestoId('')
    setNumeroPresupuesto('')
    setItems([])
  }

  const seleccionarPresupuesto = (id: string) => {
    const p = presupuestos.find((p) => p._id === id)
    if (!p) return
    setPresupuestoId(id)
    setNumeroPresupuesto(p.numero)
    setClienteId(p.id_cliente)
    setRazonSocial(p.razon_social)

    const newItems: ItemForm[] = p.lineas.map((l) => {
      const lum = luminarias.find((lm) => lm.codigo === l.codigo)
      return {
        codigo: l.codigo,
        descripcion: l.descripcion,
        cantidad: l.cantidad,
        tipo: lum?.tipo ?? 'comercial',
        precio_unitario: l.precio_unitario,
      }
    })
    setItems(newItems)
  }

  const agregarDesdeCatalogo = (lum: LuminariaStock) => {
    setItems((prev) => [...prev, { codigo: lum.codigo, descripcion: lum.descripcion, cantidad: 1, tipo: lum.tipo, precio_unitario: lum.precio }])
    setMostrarCatalogo(false)
    setBusquedaCatalogo('')
  }

  const actualizarItem = (i: number, campo: string, valor: string | number) => {
    setItems((prev) => prev.map((item, idx) => idx === i ? { ...item, [campo]: valor } : item))
  }

  const quitarItem = (i: number) => setItems((prev) => prev.filter((_, idx) => idx !== i))

  const catalogoFiltrado = luminarias.filter((l) =>
    l.codigo.toLowerCase().includes(busquedaCatalogo.toLowerCase()) ||
    l.descripcion.toLowerCase().includes(busquedaCatalogo.toLowerCase())
  ).slice(0, 20)

  const handleSubmit = async () => {
    setError('')
    if (!razonSocial.trim()) return setError('El cliente es obligatorio')
    if (items.length === 0) return setError('Agregá al menos un ítem')

    setGuardando(true)
    const res = await fetch('/api/despachos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        razon_social: razonSocial,
        id_cliente: clienteId,
        id_presupuesto: presupuestoId,
        numero_presupuesto: numeroPresupuesto,
        items,
        observaciones,
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

  const labelStyle = { display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' } as const

  const tipoBadge = (tipo: string) => {
    if (tipo === 'fabricada') return { label: 'FAB', color: 'var(--success)' }
    if (tipo === 'deposito') return { label: 'DEP', color: '#8b5cf6' }
    return { label: 'COM', color: 'var(--info)' }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ backgroundColor: 'var(--card-bg)', borderRadius: '12px', width: '100%', maxWidth: '700px', maxHeight: '90vh', overflow: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, backgroundColor: 'var(--card-bg)', zIndex: 1 }}>
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>Nuevo despacho</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={20} /></button>
        </div>

        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={labelStyle}>CLIENTE</label>
              <select value={clienteId} onChange={(e) => seleccionarCliente(e.target.value)} style={inputStyle}>
                <option value="">Seleccionar cliente...</option>
                {clientes.map((c) => (
                  <option key={c.id_cliente} value={c.id_cliente}>{c.razon_social || c.nombre}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>PRESUPUESTO APROBADO (opcional)</label>
              <select value={presupuestoId} onChange={(e) => seleccionarPresupuesto(e.target.value)} style={inputStyle}>
                <option value="">Sin presupuesto</option>
                {presupuestos.filter((p) => !clienteId || p.id_cliente === clienteId).map((p) => (
                  <option key={p._id} value={p._id}>{p.numero} — {p.razon_social}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <label style={labelStyle}>ÍTEMS A DESPACHAR *</label>
              <button onClick={() => setMostrarCatalogo(true)}
                style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 600, color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer' }}>
                <Plus size={14} /> Agregar luminaria
              </button>
            </div>

            {items.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', fontSize: '13px', color: 'var(--text-muted)', border: '1px dashed var(--border)', borderRadius: '8px' }}>
                Seleccioná un presupuesto o agregá luminarias manualmente
              </div>
            ) : (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr 70px 36px', gap: '6px', marginBottom: '6px' }}>
                  {['Código', 'Descripción', 'Cant.', ''].map((h) => (
                    <div key={h} style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)' }}>{h}</div>
                  ))}
                </div>
                {items.map((item, i) => {
                  const badge = tipoBadge(item.tipo)
                  return (
                    <div key={i} style={{ display: 'grid', gridTemplateColumns: '100px 1fr 70px 36px', gap: '6px', marginBottom: '8px', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--primary)' }}>{item.codigo}</div>
                        <div style={{ fontSize: '10px', fontWeight: 700, color: badge.color }}>{badge.label}</div>
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{item.descripcion}</div>
                      <input type="number" min={1} value={item.cantidad}
                        onChange={(e) => actualizarItem(i, 'cantidad', Number(e.target.value))}
                        style={{ ...inputStyle, fontSize: '12px' }} />
                      <button onClick={() => quitarItem(i)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)', padding: '4px' }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )
                })}
              </>
            )}
          </div>

          <div>
            <label style={labelStyle}>OBSERVACIONES</label>
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
            {guardando ? 'Guardando...' : 'Crear despacho'}
          </button>
        </div>
      </div>

      {mostrarCatalogo && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ backgroundColor: 'var(--card-bg)', borderRadius: '12px', width: '100%', maxWidth: '560px', maxHeight: '80vh', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px' }}>Agregar luminaria</h3>
              <div style={{ position: 'relative' }}>
                <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input type="text" autoFocus placeholder="Buscar por código o descripción..."
                  value={busquedaCatalogo} onChange={(e) => setBusquedaCatalogo(e.target.value)}
                  style={{ ...inputStyle, paddingLeft: '32px' }} />
              </div>
            </div>
            <div style={{ overflowY: 'auto', flex: 1 }}>
              {catalogoFiltrado.length === 0 ? (
                <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                  {busquedaCatalogo ? 'No se encontraron luminarias' : 'Escribí para buscar'}
                </div>
              ) : catalogoFiltrado.map((l) => {
                const badge = tipoBadge(l.tipo)
                return (
                  <div key={l.codigo} onClick={() => agregarDesdeCatalogo(l)}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 24px', borderBottom: '1px solid var(--border)', cursor: 'pointer' }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--sidebar-hover)' }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                        <span style={{ fontWeight: 600, fontSize: '13px', color: 'var(--primary)' }}>{l.codigo}</span>
                        <span style={{ fontSize: '10px', fontWeight: 700, color: badge.color }}>{badge.label}</span>
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{l.descripcion}</div>
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', whiteSpace: 'nowrap', marginLeft: '16px' }}>
                      Stock: {l.stock_actual}
                    </div>
                  </div>
                )
              })}
            </div>
            <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => { setMostrarCatalogo(false); setBusquedaCatalogo('') }}
                style={{ padding: '8px 16px', borderRadius: '6px', fontSize: '13px', border: '1px solid var(--border)', backgroundColor: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}