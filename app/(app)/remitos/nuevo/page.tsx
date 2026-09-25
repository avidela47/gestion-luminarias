'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'


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
  lineas: { codigo: string; descripcion: string; cantidad: number }[]
}

interface OrdenTrabajo {
  _id: string
  numero: string
  razon_social: string
  id_cliente: string
  lineas: { codigo_luminaria: string; descripcion: string; cantidad: number }[]
}

interface LineaRemito {
  codigo: string
  descripcion: string
  cantidad: number
  unidad: string
}

export default function NuevoRemitoPage() {
  const router = useRouter()
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [presupuestos, setPresupuestos] = useState<Presupuesto[]>([])
  const [ordenes, setOrdenes] = useState<OrdenTrabajo[]>([])
  const [clienteId, setClienteId] = useState('')
  const [razonSocial, setRazonSocial] = useState('')
  const [presupuestoId, setPresupuestoId] = useState('')
  const [numeroPresupuesto, setNumeroPresupuesto] = useState('')
  const [ordenId, setOrdenId] = useState('')
  const [numeroOrden, setNumeroOrden] = useState('')
  const [lineas, setLineas] = useState<LineaRemito[]>([])
  const [notas, setNotas] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([
      fetch('/api/clientes').then((r) => r.json()),
      fetch('/api/presupuestos').then((r) => r.json()),
      fetch('/api/ordenes').then((r) => r.json()),
    ]).then(([c, p, o]) => {
      if (c.ok) setClientes(c.data)
      if (p.ok) setPresupuestos(p.data)
      if (o.ok) setOrdenes(o.data)
    })
  }, [])

  const seleccionarCliente = (id: string) => {
    const c = clientes.find((c) => c.id_cliente === id)
    setClienteId(id)
    setRazonSocial(c?.razon_social || c?.nombre || '')
    setPresupuestoId('')
    setNumeroPresupuesto('')
    setOrdenId('')
    setNumeroOrden('')
    setLineas([])
  }

  const seleccionarPresupuesto = (id: string) => {
    const p = presupuestos.find((p) => p._id === id)
    setPresupuestoId(id)
    setNumeroPresupuesto(p?.numero || '')
    if (p) {
      setLineas(p.lineas.map((l) => ({
        codigo: l.codigo,
        descripcion: l.descripcion,
        cantidad: l.cantidad,
        unidad: 'unidad',
      })))
    }
  }

  const seleccionarOrden = (id: string) => {
    const o = ordenes.find((o) => o._id === id)
    setOrdenId(id)
    setNumeroOrden(o?.numero || '')
    if (o && lineas.length === 0) {
      setLineas(o.lineas.map((l) => ({
        codigo: l.codigo_luminaria,
        descripcion: l.descripcion,
        cantidad: l.cantidad,
        unidad: 'unidad',
      })))
    }
  }

  const agregarLinea = () => setLineas((prev) => [...prev, { codigo: '', descripcion: '', cantidad: 1, unidad: 'unidad' }])
  const quitarLinea = (i: number) => setLineas((prev) => prev.filter((_, idx) => idx !== i))
  const actualizarLinea = (i: number, campo: string, valor: string | number) => {
    setLineas((prev) => prev.map((l, idx) => idx === i ? { ...l, [campo]: valor } : l))
  }

  const guardar = async () => {
    setError('')
    if (!clienteId) return setError('Seleccioná un cliente')
    if (lineas.length === 0) return setError('Agregá al menos un ítem')
    const invalidas = lineas.some((l) => !l.descripcion.trim() || l.cantidad <= 0)
    if (invalidas) return setError('Completá descripción y cantidad en todos los ítems')

    setGuardando(true)
    const res = await fetch('/api/remitos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id_cliente: clienteId,
        razon_social: razonSocial,
        id_presupuesto: presupuestoId,
        numero_presupuesto: numeroPresupuesto,
        id_orden: ordenId,
        numero_orden: numeroOrden,
        lineas,
        notas,
      }),
    })

    const data = await res.json()
    setGuardando(false)
    if (!data.ok) return setError(data.error || 'Error al guardar')
    router.push(`/remitos/${data.data._id}`)
  }

  const inputStyle = {
    width: '100%', padding: '8px 10px',
    border: '1px solid var(--border)', borderRadius: '6px',
    fontSize: '13px', backgroundColor: 'var(--input-bg)',
    color: 'var(--text-primary)', outline: 'none',
  } as const

  const labelStyle = { display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' } as const

  const presupuestosFiltrados = clienteId ? presupuestos.filter((p) => p.id_cliente === clienteId) : presupuestos
  const ordenesFiltradas = clienteId ? ordenes.filter((o) => o.id_cliente === clienteId) : ordenes

  return (
    <div style={{ padding: '32px', maxWidth: '900px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <button onClick={() => router.push('/remitos')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '4px' }}>
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)' }}>Nuevo remito</h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>El número se asigna automáticamente</p>
        </div>
      </div>

      <div style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '10px', padding: '24px', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h2 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>Cliente</h2>

        <div>
          <label style={labelStyle}>CLIENTE *</label>
          <select value={clienteId} onChange={(e) => seleccionarCliente(e.target.value)} style={inputStyle}>
            <option value="">Seleccionar cliente...</option>
            {clientes.map((c) => <option key={c.id_cliente} value={c.id_cliente}>{c.nombre}</option>)}
          </select>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label style={labelStyle}>PRESUPUESTO (opcional)</label>
            <select value={presupuestoId} onChange={(e) => seleccionarPresupuesto(e.target.value)} style={inputStyle}>
              <option value="">Sin presupuesto</option>
              {presupuestosFiltrados.map((p) => <option key={p._id} value={p._id}>{p.numero}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>ORDEN DE TRABAJO (opcional)</label>
            <select value={ordenId} onChange={(e) => seleccionarOrden(e.target.value)} style={inputStyle}>
              <option value="">Sin orden</option>
              {ordenesFiltradas.map((o) => <option key={o._id} value={o._id}>{o.numero}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '10px', padding: '24px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>Detalle de mercadería</h2>
          <button onClick={agregarLinea}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer' }}>
            <Plus size={15} /> Agregar ítem
          </button>
        </div>

        {lineas.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', fontSize: '13px', color: 'var(--text-muted)', border: '1px dashed var(--border)', borderRadius: '8px' }}>
            Seleccioná un presupuesto u orden, o agregá ítems manualmente.
          </div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr 80px 100px 32px', gap: '8px', marginBottom: '8px' }}>
              {['Código', 'Descripción', 'Cantidad', 'Unidad', ''].map((h) => (
                <div key={h} style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)' }}>{h}</div>
              ))}
            </div>
            {lineas.map((l, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '120px 1fr 80px 100px 32px', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                <input type="text" value={l.codigo} onChange={(e) => actualizarLinea(i, 'codigo', e.target.value)}
                  placeholder="Código" style={{ ...inputStyle, fontSize: '12px' }} />
                <input type="text" value={l.descripcion} onChange={(e) => actualizarLinea(i, 'descripcion', e.target.value)}
                  placeholder="Descripción" style={{ ...inputStyle, fontSize: '12px' }} />
                <input type="number" min={1} value={l.cantidad} onChange={(e) => actualizarLinea(i, 'cantidad', Number(e.target.value))}
                  style={{ ...inputStyle, fontSize: '12px' }} />
                <input type="text" value={l.unidad} onChange={(e) => actualizarLinea(i, 'unidad', e.target.value)}
                  placeholder="unidad" style={{ ...inputStyle, fontSize: '12px' }} />
                <button onClick={() => quitarLinea(i)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)', padding: '4px' }}>
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </>
        )}
      </div>

      <div style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '10px', padding: '24px', marginBottom: '16px' }}>
        <label style={labelStyle}>NOTAS</label>
        <textarea value={notas} onChange={(e) => setNotas(e.target.value)} rows={2}
          style={{ ...inputStyle, resize: 'vertical' }} />
      </div>

      {error && (
        <div style={{ backgroundColor: 'var(--danger-bg)', color: 'var(--danger)', padding: '10px 14px', borderRadius: '6px', fontSize: '13px', marginBottom: '16px' }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
        <button onClick={() => router.push('/remitos')}
          style={{ padding: '9px 16px', borderRadius: '8px', fontSize: '13px', border: '1px solid var(--border)', backgroundColor: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer' }}>
          Cancelar
        </button>
        <button onClick={guardar} disabled={guardando}
          style={{ padding: '9px 20px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, border: 'none', backgroundColor: 'var(--primary)', color: '#fff', cursor: guardando ? 'not-allowed' : 'pointer', opacity: guardando ? 0.7 : 1 }}>
          {guardando ? 'Guardando...' : 'Crear remito'}
        </button>
      </div>
    </div>
  )
}