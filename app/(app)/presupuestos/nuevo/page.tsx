'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, ArrowLeft } from 'lucide-react'
import { EMPRESA } from '@/lib/constants'

interface Cliente {
  id_cliente: string
  nombre: string
  razon_social: string
  cuit: string
  direccion: string
  localidad: string
  telefono: string
  email: string
  condicion_iva: string
}

interface Linea {
  codigo: string
  descripcion: string
  cantidad: number
  bonificacion: number
  precio_unitario: number
  precio_total: number
}

export default function NuevoPresupuestoPage() {
  const router = useRouter()
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null)
  const [atencion, setAtencion] = useState('')
  const [vendedor, setVendedor] = useState(EMPRESA.vendedor_default)
  const [validez, setValidez] = useState(5)
  const [formaPago, setFormaPago] = useState('')
  const [plazoEntrega, setPlazoEntrega] = useState('INMEDIATA')
  const [comentario, setComentario] = useState('')
  const [lineas, setLineas] = useState<Linea[]>([])
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/clientes')
      .then((r) => r.json())
      .then((data) => { if (data.ok) setClientes(data.data) })
  }, [])

  const seleccionarCliente = (id: string) => {
    const c = clientes.find((c) => c.id_cliente === id)
    setClienteSeleccionado(c ?? null)
  }

  const agregarLinea = () => {
    setLineas((prev) => [...prev, {
      codigo: '', descripcion: '', cantidad: 1,
      bonificacion: 0, precio_unitario: 0, precio_total: 0,
    }])
  }

  const actualizarLinea = (i: number, campo: string, valor: string | number) => {
    setLineas((prev) => prev.map((l, idx) => {
      if (idx !== i) return l
      const updated = { ...l, [campo]: valor }
      const precio = updated.precio_unitario * updated.cantidad * (1 - updated.bonificacion / 100)
      return { ...updated, precio_total: Math.round(precio * 100) / 100 }
    }))
  }

  const quitarLinea = (i: number) => {
    setLineas((prev) => prev.filter((_, idx) => idx !== i))
  }

  const subtotal = lineas.reduce((acc, l) => acc + l.precio_total, 0)
  const esInscripto = clienteSeleccionado?.condicion_iva === 'Responsable Inscripto' ||
    clienteSeleccionado?.condicion_iva === 'Responsable Inscripto 10' ||
    clienteSeleccionado?.condicion_iva === 'Responsable Inscripto M'
  const iva = esInscripto ? Math.round(subtotal * 0.21 * 100) / 100 : 0
  const total = Math.round((subtotal + iva) * 100) / 100

  const guardar = async (estado: string) => {
    setError('')
    if (!clienteSeleccionado) return setError('Seleccioná un cliente')
    if (lineas.length === 0) return setError('Agregá al menos un ítem')
    const invalidas = lineas.some((l) => !l.descripcion || l.precio_unitario <= 0)
    if (invalidas) return setError('Completá descripción y precio en todos los ítems')

    setGuardando(true)
    const res = await fetch('/api/presupuestos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        vendedor,
        validez_dias: validez,
        id_cliente: clienteSeleccionado.id_cliente,
        razon_social: clienteSeleccionado.razon_social || clienteSeleccionado.nombre,
        cuit: clienteSeleccionado.cuit,
        direccion: clienteSeleccionado.direccion,
        localidad: clienteSeleccionado.localidad,
        telefono: clienteSeleccionado.telefono,
        email: clienteSeleccionado.email,
        atencion,
        condicion_iva: clienteSeleccionado.condicion_iva,
        lineas,
        moneda: 'U$S',
        subtotal,
        iva,
        total,
        forma_pago: formaPago,
        plazo_entrega: plazoEntrega,
        comentario,
        estado,
      }),
    })

    const data = await res.json()
    setGuardando(false)
    if (!data.ok) return setError(data.error || 'Error al guardar')
    router.push(`/presupuestos/${data.data._id}`)
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
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <button onClick={() => router.push('/presupuestos')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '4px' }}>
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)' }}>Nuevo presupuesto</h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            El número se asigna automáticamente al guardar
          </p>
        </div>
      </div>

      {/* Cliente */}
      <div style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '10px', padding: '20px 24px', marginBottom: '16px' }}>
        <h2 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px' }}>Datos del cliente</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
          <div>
            <label style={labelStyle}>CLIENTE *</label>
            <select
              onChange={(e) => seleccionarCliente(e.target.value)}
              style={inputStyle}
            >
              <option value="">Seleccionar cliente...</option>
              {clientes.map((c) => (
                <option key={c.id_cliente} value={c.id_cliente}>
                  {c.nombre} — {c.razon_social || c.nombre}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label style={labelStyle}>ATENCIÓN</label>
            <input type="text" value={atencion} onChange={(e) => setAtencion(e.target.value)}
              placeholder="Persona de contacto" style={inputStyle} />
          </div>
        </div>

        {clienteSeleccionado && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px', fontSize: '13px' }}>
            <div><span style={{ color: 'var(--text-muted)' }}>CUIT: </span><b>{clienteSeleccionado.cuit || '—'}</b></div>
            <div><span style={{ color: 'var(--text-muted)' }}>Condición: </span><b>{clienteSeleccionado.condicion_iva}</b></div>
            <div><span style={{ color: 'var(--text-muted)' }}>Tel: </span><b>{clienteSeleccionado.telefono || '—'}</b></div>
            <div><span style={{ color: 'var(--text-muted)' }}>Dirección: </span><b>{clienteSeleccionado.direccion || '—'}</b></div>
            <div><span style={{ color: 'var(--text-muted)' }}>Localidad: </span><b>{clienteSeleccionado.localidad || '—'}</b></div>
            <div><span style={{ color: 'var(--text-muted)' }}>Email: </span><b>{clienteSeleccionado.email || '—'}</b></div>
          </div>
        )}
      </div>

      {/* Encabezado */}
      <div style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '10px', padding: '20px 24px', marginBottom: '16px' }}>
        <h2 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px' }}>Condiciones</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '16px' }}>
          <div>
            <label style={labelStyle}>VENDEDOR</label>
            <input type="text" value={vendedor} onChange={(e) => setVendedor(e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>VALIDEZ (días)</label>
            <input type="number" min={1} value={validez} onChange={(e) => setValidez(Number(e.target.value))} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>PLAZO ENTREGA</label>
            <input type="text" value={plazoEntrega} onChange={(e) => setPlazoEntrega(e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>FORMA DE PAGO</label>
            <input type="text" value={formaPago} onChange={(e) => setFormaPago(e.target.value)}
              placeholder="Ej: Cheque a 10 días" style={inputStyle} />
          </div>
        </div>
      </div>

      {/* Líneas */}
      <div style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '10px', padding: '20px 24px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>Detalle</h2>
          <button onClick={agregarLinea}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              fontSize: '13px', fontWeight: 600, color: 'var(--primary)',
              background: 'none', border: 'none', cursor: 'pointer',
            }}>
            <Plus size={15} /> Agregar ítem
          </button>
        </div>

        {lineas.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', fontSize: '13px', color: 'var(--text-muted)', border: '1px dashed var(--border)', borderRadius: '8px' }}>
            No hay ítems. Hacé clic en Agregar ítem para empezar.
          </div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr 80px 80px 110px 110px 36px', gap: '8px', marginBottom: '8px' }}>
              {['Código', 'Descripción', 'Cantidad', 'Bonif. %', 'P. Unitario U$S', 'P. Total U$S', ''].map((h) => (
                <div key={h} style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)' }}>{h}</div>
              ))}
            </div>
            {lineas.map((l, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '120px 1fr 80px 80px 110px 110px 36px', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                <input type="text" value={l.codigo} onChange={(e) => actualizarLinea(i, 'codigo', e.target.value)}
                  placeholder="Código" style={{ ...inputStyle, fontSize: '12px' }} />
                <input type="text" value={l.descripcion} onChange={(e) => actualizarLinea(i, 'descripcion', e.target.value)}
                  placeholder="Descripción del producto" style={{ ...inputStyle, fontSize: '12px' }} />
                <input type="number" min={1} value={l.cantidad} onChange={(e) => actualizarLinea(i, 'cantidad', Number(e.target.value))}
                  style={{ ...inputStyle, fontSize: '12px' }} />
                <input type="number" min={0} max={100} value={l.bonificacion} onChange={(e) => actualizarLinea(i, 'bonificacion', Number(e.target.value))}
                  style={{ ...inputStyle, fontSize: '12px' }} />
                <input type="number" min={0} step={0.01} value={l.precio_unitario} onChange={(e) => actualizarLinea(i, 'precio_unitario', Number(e.target.value))}
                  style={{ ...inputStyle, fontSize: '12px' }} />
                <div style={{ padding: '8px 10px', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {l.precio_total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                </div>
                <button onClick={() => quitarLinea(i)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)', padding: '4px' }}>
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </>
        )}

        {/* Totales */}
        {lineas.length > 0 && (
          <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end' }}>
            <div style={{ width: '280px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>T. Neto:</span>
                <span style={{ fontWeight: 600 }}>U$S {subtotal.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>IVA {esInscripto ? '21%' : '0%'}:</span>
                <span style={{ fontWeight: 600 }}>U$S {iva.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid var(--border)' }}>
                <span style={{ fontWeight: 700, fontSize: '15px' }}>Total:</span>
                <span style={{ fontWeight: 700, fontSize: '15px', color: 'var(--primary)' }}>U$S {total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Comentario */}
      <div style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '10px', padding: '20px 24px', marginBottom: '16px' }}>
        <label style={{ ...labelStyle, marginBottom: '8px' }}>COMENTARIO</label>
        <textarea value={comentario} onChange={(e) => setComentario(e.target.value)} rows={3}
          placeholder="Ej: Cotización dólar BNA tipo vendedor. Validez 5 días."
          style={{ ...inputStyle, resize: 'vertical' }} />
      </div>

      {error && (
        <div style={{
          backgroundColor: 'var(--danger-bg)', color: 'var(--danger)',
          padding: '10px 14px', borderRadius: '6px', fontSize: '13px', marginBottom: '16px',
        }}>
          {error}
        </div>
      )}

      {/* Acciones */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
        <button onClick={() => router.push('/presupuestos')}
          style={{
            padding: '9px 16px', borderRadius: '8px', fontSize: '13px',
            border: '1px solid var(--border)', backgroundColor: 'transparent',
            color: 'var(--text-secondary)', cursor: 'pointer',
          }}>
          Cancelar
        </button>
        <button onClick={() => guardar('Borrador')} disabled={guardando}
          style={{
            padding: '9px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 600,
            border: '1px solid var(--border)', backgroundColor: 'transparent',
            color: 'var(--text-primary)', cursor: 'pointer',
          }}>
          Guardar borrador
        </button>
        <button onClick={() => guardar('Enviado')} disabled={guardando}
          style={{
            padding: '9px 20px', borderRadius: '8px', fontSize: '13px', fontWeight: 600,
            border: 'none', backgroundColor: 'var(--primary)', color: '#fff',
            cursor: guardando ? 'not-allowed' : 'pointer', opacity: guardando ? 0.7 : 1,
          }}>
          {guardando ? 'Guardando...' : 'Guardar y enviar'}
        </button>
      </div>
    </div>
  )
}