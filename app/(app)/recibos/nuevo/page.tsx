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
  total: number
}

interface OrdenTrabajo {
  _id: string
  numero: string
  razon_social: string
  id_cliente: string
}

interface LineaRecibo {
  descripcion: string
  monto_usd: number
}

export default function NuevoReciboPage() {
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
  const [concepto, setConcepto] = useState('')
  const [lineas, setLineas] = useState<LineaRecibo[]>([{ descripcion: '', monto_usd: 0 }])
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
      if (p.ok) setPresupuestos(p.data.filter((x: Presupuesto & { estado: string }) => x.estado === 'Aceptado'))
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
    setConcepto('')
    setLineas([{ descripcion: '', monto_usd: 0 }])
  }

  const seleccionarPresupuesto = (id: string) => {
    const p = presupuestos.find((p) => p._id === id)
    setPresupuestoId(id)
    setNumeroPresupuesto(p?.numero || '')
    if (p) {
      setConcepto(`Según presupuesto ${p.numero}`)
      setLineas([{ descripcion: `Presupuesto ${p.numero}`, monto_usd: p.total }])
    } else {
      setConcepto('')
      setLineas([{ descripcion: '', monto_usd: 0 }])
    }
  }

  const seleccionarOrden = (id: string) => {
    const o = ordenes.find((o) => o._id === id)
    setOrdenId(id)
    setNumeroOrden(o?.numero || '')
    if (o) setConcepto((prev) => prev || `Según OT ${o.numero}`)
  }

  const agregarLinea = () => setLineas((prev) => [...prev, { descripcion: '', monto_usd: 0 }])
  const quitarLinea = (i: number) => setLineas((prev) => prev.filter((_, idx) => idx !== i))
  const actualizarLinea = (i: number, campo: keyof LineaRecibo, valor: string | number) => {
    setLineas((prev) => prev.map((l, idx) => idx === i ? { ...l, [campo]: valor } : l))
  }

  const totalUsd = lineas.reduce((acc, l) => acc + (Number(l.monto_usd) || 0), 0)

  const guardar = async () => {
    setError('')
    if (!clienteId) return setError('Seleccioná un cliente')
    if (!concepto.trim()) return setError('El concepto es obligatorio')
    if (totalUsd <= 0) return setError('El total debe ser mayor a 0')
    const invalidas = lineas.some((l) => !l.descripcion.trim())
    if (invalidas) return setError('Completá la descripción en todas las líneas')

    setGuardando(true)
    const res = await fetch('/api/recibos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id_cliente: clienteId,
        razon_social: razonSocial,
        id_presupuesto: presupuestoId,
        numero_presupuesto: numeroPresupuesto,
        id_orden: ordenId,
        numero_orden: numeroOrden,
        concepto,
        lineas_detalle: lineas,
        total_usd: totalUsd,
        notas,
      }),
    })

    const data = await res.json()
    setGuardando(false)
    if (!data.ok) return setError(data.error || 'Error al guardar')
    router.push(`/recibos/${data.data._id}`)
  }

  const labelStyle = { display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' } as const
  const inputStyle = {
    width: '100%', padding: '8px 10px',
    border: '1px solid var(--border)', borderRadius: '6px',
    fontSize: '13px', backgroundColor: 'var(--input-bg)',
    color: 'var(--text-primary)', outline: 'none',
  } as const

  const presupuestosFiltrados = clienteId ? presupuestos.filter((p) => p.id_cliente === clienteId) : presupuestos
  const ordenesFiltradas = clienteId ? ordenes.filter((o) => o.id_cliente === clienteId) : ordenes

  return (
    <div style={{ padding: '32px', maxWidth: '700px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <button onClick={() => router.push('/recibos')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '4px' }}>
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)' }}>Nuevo recibo</h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>El número se asigna automáticamente</p>
        </div>
      </div>

      <div style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '10px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

        <div>
          <label style={labelStyle}>CLIENTE *</label>
          <select value={clienteId} onChange={(e) => seleccionarCliente(e.target.value)} style={inputStyle}>
            <option value="">Seleccionar cliente...</option>
            {clientes.map((c) => (
              <option key={c.id_cliente} value={c.id_cliente}>{c.nombre}</option>
            ))}
          </select>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label style={labelStyle}>PRESUPUESTO (opcional)</label>
            <select value={presupuestoId} onChange={(e) => seleccionarPresupuesto(e.target.value)} style={inputStyle}>
              <option value="">Sin presupuesto</option>
              {presupuestosFiltrados.map((p) => (
                <option key={p._id} value={p._id}>{p.numero} — U$S {p.total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={labelStyle}>ORDEN DE TRABAJO (opcional)</label>
            <select value={ordenId} onChange={(e) => seleccionarOrden(e.target.value)} style={inputStyle}>
              <option value="">Sin orden</option>
              {ordenesFiltradas.map((o) => (
                <option key={o._id} value={o._id}>{o.numero}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label style={labelStyle}>CONCEPTO *</label>
          <input type="text" value={concepto} onChange={(e) => setConcepto(e.target.value)}
            placeholder="Ej: Luminarias SYP323 según presupuesto 0001-00010001"
            style={inputStyle} />
        </div>

        {/* Líneas de detalle */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <label style={labelStyle}>DETALLE</label>
            <button onClick={agregarLinea}
              style={{
                display: 'flex', alignItems: 'center', gap: '4px',
                fontSize: '12px', fontWeight: 600, color: 'var(--primary)',
                background: 'none', border: 'none', cursor: 'pointer',
              }}>
              <Plus size={13} /> Agregar línea
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr 110px 32px', gap: '6px', marginBottom: '6px' }}>
            {['#', 'Descripción', 'Monto U$S', ''].map((h) => (
              <div key={h} style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)' }}>{h}</div>
            ))}
          </div>
          {lineas.map((l, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '120px 1fr 110px 32px', gap: '6px', marginBottom: '6px', alignItems: 'center' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', padding: '8px 0' }}>Ítem {i + 1}</div>
              <input type="text" value={l.descripcion}
                onChange={(e) => actualizarLinea(i, 'descripcion', e.target.value)}
                placeholder="Descripción" style={{ ...inputStyle, fontSize: '12px' }} />
              <input type="number" min={0} step={0.01} value={l.monto_usd}
                onChange={(e) => actualizarLinea(i, 'monto_usd', Number(e.target.value))}
                style={{ ...inputStyle, fontSize: '12px' }} />
              <button onClick={() => quitarLinea(i)} disabled={lineas.length === 1}
                style={{ background: 'none', border: 'none', cursor: lineas.length === 1 ? 'not-allowed' : 'pointer', color: 'var(--danger)', opacity: lineas.length === 1 ? 0.3 : 1, padding: '4px' }}>
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '8px', borderTop: '1px solid var(--border)', marginTop: '4px' }}>
            <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
              Total: U$S {totalUsd.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        <div>
          <label style={labelStyle}>OBSERVACIONES</label>
          <textarea value={notas} onChange={(e) => setNotas(e.target.value)}
            placeholder="Observaciones internas o para el cliente"
            rows={2} style={{ ...inputStyle, resize: 'vertical' }} />
        </div>

        {error && (
          <div style={{ backgroundColor: 'var(--danger-bg)', color: 'var(--danger)', padding: '10px 14px', borderRadius: '6px', fontSize: '13px' }}>
            {error}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
        <button onClick={() => router.push('/recibos')}
          style={{
            padding: '9px 16px', borderRadius: '8px', fontSize: '13px',
            border: '1px solid var(--border)', backgroundColor: 'transparent',
            color: 'var(--text-secondary)', cursor: 'pointer',
          }}>
          Cancelar
        </button>
        <button onClick={guardar} disabled={guardando}
          style={{
            padding: '9px 20px', borderRadius: '8px', fontSize: '13px', fontWeight: 600,
            border: 'none', backgroundColor: 'var(--primary)', color: '#fff',
            cursor: guardando ? 'not-allowed' : 'pointer', opacity: guardando ? 0.7 : 1,
          }}>
          {guardando ? 'Guardando...' : 'Crear recibo'}
        </button>
      </div>
    </div>
  )
}