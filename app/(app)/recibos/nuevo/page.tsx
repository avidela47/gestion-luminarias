'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

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
  const [totalUsd, setTotalUsd] = useState<number>(0)
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
      if (p.ok) setPresupuestos(p.data.filter((x: Presupuesto & { estado: string }) => x.estado === 'Aprobado'))
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
    setTotalUsd(0)
  }

  const seleccionarPresupuesto = (id: string) => {
    const p = presupuestos.find((p) => p._id === id)
    setPresupuestoId(id)
    setNumeroPresupuesto(p?.numero || '')
    if (p) setTotalUsd(p.total)
  }

  const seleccionarOrden = (id: string) => {
    const o = ordenes.find((o) => o._id === id)
    setOrdenId(id)
    setNumeroOrden(o?.numero || '')
  }

  const guardar = async () => {
    setError('')
    if (!clienteId) return setError('Seleccioná un cliente')
    if (!totalUsd || totalUsd <= 0) return setError('El total debe ser mayor a 0')
    if (!concepto.trim()) return setError('El concepto es obligatorio')

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

  const presupuestosFiltrados = clienteId
    ? presupuestos.filter((p) => p.id_cliente === clienteId)
    : presupuestos

  const ordenesFiltradas = clienteId
    ? ordenes.filter((o) => o.id_cliente === clienteId)
    : ordenes

  return (
    <div style={{ padding: '32px', maxWidth: '700px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <button onClick={() => router.push('/recibos')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '4px' }}>
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)' }}>Nuevo recibo</h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            El número se asigna automáticamente
          </p>
        </div>
      </div>

      <div style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '10px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {/* Cliente */}
        <div>
          <label style={labelStyle}>CLIENTE *</label>
          <select value={clienteId} onChange={(e) => seleccionarCliente(e.target.value)} style={inputStyle}>
            <option value="">Seleccionar cliente...</option>
            {clientes.map((c) => (
              <option key={c.id_cliente} value={c.id_cliente}>{c.nombre}</option>
            ))}
          </select>
        </div>

        {/* Presupuesto y OT */}
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

        {/* Concepto y total */}
        <div>
          <label style={labelStyle}>CONCEPTO *</label>
          <input
            type="text"
            value={concepto}
            onChange={(e) => setConcepto(e.target.value)}
            placeholder="Ej: Luminarias SYP323 según presupuesto 0000-00000001"
            style={inputStyle}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label style={labelStyle}>TOTAL U$S *</label>
            <input
              type="number"
              min={0}
              step={0.01}
              value={totalUsd}
              onChange={(e) => setTotalUsd(Number(e.target.value))}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>NOTAS</label>
            <input
              type="text"
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              placeholder="Observaciones"
              style={inputStyle}
            />
          </div>
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