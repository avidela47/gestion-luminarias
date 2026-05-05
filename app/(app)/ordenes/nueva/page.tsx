'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Plus, Trash2, ArrowLeft } from 'lucide-react'
import { EMPRESA } from '@/lib/constants'

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
  estado: string
  lineas: { codigo: string; descripcion: string; cantidad: number }[]
}

interface ProductoTerminado {
  codigo_luminaria: string
  stock_actual: number
}

interface Linea {
  codigo_luminaria: string
  descripcion: string
  cantidad: number
  cantidad_stock: number
  cantidad_fabricar: number
}

export default function NuevaOrdenPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const presupuestoId = searchParams.get('presupuesto')

  const [clientes, setClientes] = useState<Cliente[]>([])
  const [presupuestos, setPresupuestos] = useState<Presupuesto[]>([])
  const [productosTerminados, setProductosTerminados] = useState<ProductoTerminado[]>([])
  const [clienteId, setClienteId] = useState('')
  const [razonSocial, setRazonSocial] = useState('')
  const [presupuestoSeleccionado, setPresupuestoSeleccionado] = useState<Presupuesto | null>(null)
  const [fechaEntrega, setFechaEntrega] = useState('')
  const [notas, setNotas] = useState('')
  const [lineas, setLineas] = useState<Linea[]>([])
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')

  const buildLineas = (p: Presupuesto, productos: ProductoTerminado[]): Linea[] =>
    p.lineas.map((l) => {
      const prod = productos.find((pt) => pt.codigo_luminaria === l.codigo)
      const stockDisponible = prod ? Math.min(prod.stock_actual, l.cantidad) : 0
      const fabricar = l.cantidad - stockDisponible
      return {
        codigo_luminaria: l.codigo,
        descripcion: l.descripcion,
        cantidad: l.cantidad,
        cantidad_stock: stockDisponible,
        cantidad_fabricar: fabricar > 0 ? fabricar : 0,
      }
    })

  useEffect(() => {
    Promise.all([
      fetch('/api/clientes').then((r) => r.json()),
      fetch('/api/presupuestos').then((r) => r.json()),
      fetch('/api/productos').then((r) => r.json()),
    ]).then(([clientesData, presupuestosData, productosData]) => {
      if (clientesData.ok) setClientes(clientesData.data)
      if (presupuestosData.ok) {
        const aprobados = presupuestosData.data.filter((p: Presupuesto) => p.estado === 'Aprobado')
        setPresupuestos(aprobados)
        if (presupuestoId) {
          const p = presupuestosData.data.find((p: Presupuesto) => p._id === presupuestoId)
          if (p) {
            setPresupuestoSeleccionado(p)
            setClienteId(p.id_cliente)
            setRazonSocial(p.razon_social)
            setLineas(buildLineas(p, productosData.data))
          }
        }
      }
      if (productosData.ok) setProductosTerminados(productosData.data)
    })
   }, [presupuestoId])

  const seleccionarPresupuesto = (id: string) => {
    const p = presupuestos.find((p) => p._id === id)
    if (p) {
      setPresupuestoSeleccionado(p)
      setClienteId(p.id_cliente)
      setRazonSocial(p.razon_social)
      setLineas(buildLineas(p, productosTerminados))
    }
  }

  const agregarLinea = () => {
    setLineas((prev) => [...prev, {
      codigo_luminaria: '', descripcion: '', cantidad: 1,
      cantidad_stock: 0, cantidad_fabricar: 1,
    }])
  }

  const actualizarLinea = (i: number, campo: string, valor: string | number) => {
    setLineas((prev) => prev.map((l, idx) => {
      if (idx !== i) return l
      const updated = { ...l, [campo]: valor }
      if (campo === 'cantidad_stock' || campo === 'cantidad') {
        updated.cantidad_fabricar = Math.max(0, updated.cantidad - updated.cantidad_stock)
      }
      return updated
    }))
  }

  const quitarLinea = (i: number) => setLineas((prev) => prev.filter((_, idx) => idx !== i))

  const guardar = async () => {
    setError('')
    if (!clienteId) return setError('Seleccioná un cliente')
    if (lineas.length === 0) return setError('Agregá al menos una luminaria')
    const invalidas = lineas.some((l) => !l.codigo_luminaria || l.cantidad < 1)
    if (invalidas) return setError('Completá código y cantidad en todas las líneas')

    setGuardando(true)
    const res = await fetch('/api/ordenes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id_cliente: clienteId,
        razon_social: razonSocial,
        vendedor: EMPRESA.vendedor_default,
        id_presupuesto: presupuestoSeleccionado?._id ?? '',
        numero_presupuesto: presupuestoSeleccionado?.numero ?? '',
        fecha_entrega: fechaEntrega || null,
        lineas,
        notas,
      }),
    })

    const data = await res.json()
    setGuardando(false)
    if (!data.ok) return setError(data.error || 'Error al guardar')
    router.push(`/ordenes/${data.data._id}`)
  }

  const labelStyle = { display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' } as const
  const inputStyle = {
    width: '100%', padding: '8px 10px',
    border: '1px solid var(--border)', borderRadius: '6px',
    fontSize: '13px', backgroundColor: 'var(--input-bg)',
    color: 'var(--text-primary)', outline: 'none',
  } as const

  return (
    <div style={{ padding: '32px', maxWidth: '1000px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <button onClick={() => router.push('/ordenes')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '4px' }}>
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)' }}>Nueva Orden de Trabajo</h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            El número se asigna automáticamente al guardar
          </p>
        </div>
      </div>

      <div style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '10px', padding: '20px 24px', marginBottom: '16px' }}>
        <h2 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px' }}>Cliente</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label style={labelStyle}>CLIENTE *</label>
            <select value={clienteId} onChange={(e) => {
              const c = clientes.find((c) => c.id_cliente === e.target.value)
              setClienteId(e.target.value)
              setRazonSocial(c?.razon_social || c?.nombre || '')
              setPresupuestoSeleccionado(null)
              setLineas([])
            }} style={inputStyle}>
              <option value="">Seleccionar cliente...</option>
              {clientes.map((c) => (
                <option key={c.id_cliente} value={c.id_cliente}>{c.nombre}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={labelStyle}>PRESUPUESTO APROBADO (opcional)</label>
            <select
              value={presupuestoSeleccionado?._id ?? ''}
              onChange={(e) => seleccionarPresupuesto(e.target.value)}
              style={inputStyle}
            >
              <option value="">Sin presupuesto asociado</option>
              {presupuestos.map((p) => (
                <option key={p._id} value={p._id}>{p.numero} — {p.razon_social}</option>
              ))}
            </select>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px' }}>
          <div>
            <label style={labelStyle}>FECHA DE ENTREGA</label>
            <input type="date" value={fechaEntrega} onChange={(e) => setFechaEntrega(e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>NOTAS</label>
            <input type="text" value={notas} onChange={(e) => setNotas(e.target.value)}
              placeholder="Observaciones internas" style={inputStyle} />
          </div>
        </div>
      </div>

      <div style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '10px', padding: '20px 24px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>Luminarias</h2>
          <button onClick={agregarLinea}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              fontSize: '13px', fontWeight: 600, color: 'var(--primary)',
              background: 'none', border: 'none', cursor: 'pointer',
            }}>
            <Plus size={15} /> Agregar línea
          </button>
        </div>

        {lineas.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', fontSize: '13px', color: 'var(--text-muted)', border: '1px dashed var(--border)', borderRadius: '8px' }}>
            Seleccioná un presupuesto aprobado o agregá líneas manualmente.
          </div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr 80px 100px 110px 36px', gap: '8px', marginBottom: '8px' }}>
              {['Código', 'Descripción', 'Total', 'Desde stock', 'A fabricar', ''].map((h) => (
                <div key={h} style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)' }}>{h}</div>
              ))}
            </div>
            {lineas.map((l, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '140px 1fr 80px 100px 110px 36px', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                <input type="text" value={l.codigo_luminaria}
                  onChange={(e) => actualizarLinea(i, 'codigo_luminaria', e.target.value)}
                  placeholder="Código" style={{ ...inputStyle, fontSize: '12px' }} />
                <input type="text" value={l.descripcion}
                  onChange={(e) => actualizarLinea(i, 'descripcion', e.target.value)}
                  placeholder="Descripción" style={{ ...inputStyle, fontSize: '12px' }} />
                <input type="number" min={1} value={l.cantidad}
                  onChange={(e) => actualizarLinea(i, 'cantidad', Number(e.target.value))}
                  style={{ ...inputStyle, fontSize: '12px' }} />
                <input type="number" min={0} value={l.cantidad_stock}
                  onChange={(e) => actualizarLinea(i, 'cantidad_stock', Number(e.target.value))}
                  style={{ ...inputStyle, fontSize: '12px', backgroundColor: 'var(--success-bg)' }} />
                <input type="number" min={0} value={l.cantidad_fabricar}
                  onChange={(e) => actualizarLinea(i, 'cantidad_fabricar', Number(e.target.value))}
                  style={{ ...inputStyle, fontSize: '12px', backgroundColor: 'var(--info-bg)' }} />
                <button onClick={() => quitarLinea(i)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)', padding: '4px' }}>
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
            <div style={{ marginTop: '12px', fontSize: '12px', color: 'var(--text-muted)' }}>
              <span style={{ backgroundColor: 'var(--success-bg)', padding: '2px 8px', borderRadius: '4px', marginRight: '8px' }}>Verde = desde depósito</span>
              <span style={{ backgroundColor: 'var(--info-bg)', padding: '2px 8px', borderRadius: '4px' }}>Azul = a fabricar</span>
            </div>
          </>
        )}
      </div>

      {error && (
        <div style={{
          backgroundColor: 'var(--danger-bg)', color: 'var(--danger)',
          padding: '10px 14px', borderRadius: '6px', fontSize: '13px', marginBottom: '16px',
        }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
        <button onClick={() => router.push('/ordenes')}
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
          {guardando ? 'Guardando...' : 'Crear orden'}
        </button>
      </div>
    </div>
  )
}