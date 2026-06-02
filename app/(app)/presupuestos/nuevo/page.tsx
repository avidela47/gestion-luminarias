'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, ArrowLeft, Search } from 'lucide-react'
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
  plazo_entrega_linea: string
}

interface ProductoCatalogo {
  codigo: string
  descripcion: string
  precio: number
  tipo: string
}

export default function NuevoPresupuestoPage() {
  const router = useRouter()
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [catalogo, setCatalogo] = useState<ProductoCatalogo[]>([])
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null)
  const [atencion, setAtencion] = useState('')
  const [vendedor, setVendedor] = useState(EMPRESA.vendedor_default)
  const [validez, setValidez] = useState(5)
  const [formaPago, setFormaPago] = useState('')
  const [cotizacion, setCotizacion] = useState('')
  const [comentario, setComentario] = useState('')
  const [lineas, setLineas] = useState<Linea[]>([])
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')
  const [busquedaCatalogo, setBusquedaCatalogo] = useState('')
  const [mostrarCatalogo, setMostrarCatalogo] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch('/api/clientes').then((r) => r.json()),
      fetch('/api/sensores').then((r) => r.json()),
      fetch('/api/luminarias-comerciales').then((r) => r.json()),
      fetch('/api/productos').then((r) => r.json()),
    ]).then(([clientesData, sensoresData, comercialesData, fabricadasData]) => {
      if (clientesData.ok) setClientes(clientesData.data)
      const items: ProductoCatalogo[] = []
      if (sensoresData.ok) {
        sensoresData.data.forEach((s: { codigo: string; descripcion: string; precio: number; tipo: string }) => {
          items.push({ codigo: s.codigo, descripcion: s.descripcion, precio: s.precio, tipo: s.tipo })
        })
      }
      if (comercialesData.ok) {
        comercialesData.data.forEach((l: { codigo: string; descripcion: string; precio: number }) => {
          items.push({ codigo: l.codigo, descripcion: l.descripcion, precio: l.precio, tipo: 'luminaria_comercial' })
        })
      }
      if (fabricadasData.ok) {
        fabricadasData.data.forEach((l: { codigo_luminaria: string; descripcion: string; precio: number }) => {
          items.push({ codigo: l.codigo_luminaria, descripcion: l.descripcion, precio: l.precio, tipo: 'luminaria_fabricada' })
        })
      }
      setCatalogo(items.sort((a, b) => a.codigo.localeCompare(b.codigo)))
    })
  }, [])

  const seleccionarCliente = (id: string) => {
    const c = clientes.find((c) => c.id_cliente === id)
    setClienteSeleccionado(c ?? null)
  }

  const agregarLinea = () => {
    setLineas((prev) => [...prev, {
      codigo: '', descripcion: '', cantidad: 1,
      bonificacion: 0, precio_unitario: 0, precio_total: 0,
      plazo_entrega_linea: '',
    }])
  }

  const agregarDesdeCatalogo = (producto: ProductoCatalogo) => {
    setLineas((prev) => [...prev, {
      codigo: producto.codigo,
      descripcion: producto.descripcion,
      cantidad: 1,
      bonificacion: 0,
      precio_unitario: producto.precio,
      precio_total: producto.precio,
      plazo_entrega_linea: '',
    }])
    setMostrarCatalogo(false)
    setBusquedaCatalogo('')
  }

  const actualizarLinea = (i: number, campo: string, valor: string | number) => {
    setLineas((prev) => prev.map((l, idx) => {
      if (idx !== i) return l
      const updated = { ...l, [campo]: valor }
      const precio = updated.precio_unitario * updated.cantidad
      return { ...updated, precio_total: Math.round(precio * 100) / 100 }
    }))
  }

  const quitarLinea = (i: number) => setLineas((prev) => prev.filter((_, idx) => idx !== i))

  const subtotal = lineas.reduce((acc, l) => acc + l.precio_total, 0)
  const esInscripto = clienteSeleccionado?.condicion_iva?.includes('Responsable Inscripto')
  const iva = esInscripto ? Math.round(subtotal * 0.21 * 100) / 100 : 0
  const total = Math.round((subtotal + iva) * 100) / 100

  const catalogoFiltrado = catalogo.filter((p) =>
    p.codigo.toLowerCase().includes(busquedaCatalogo.toLowerCase()) ||
    p.descripcion.toLowerCase().includes(busquedaCatalogo.toLowerCase())
  ).slice(0, 20)

  const tipoBadge = (tipo: string) => {
    const map: Record<string, { label: string; color: string }> = {
      sensor: { label: 'SENSOR', color: 'var(--info)' },
      fuente: { label: 'FUENTE', color: 'var(--warning)' },
      luminaria_comercial: { label: 'LUM. COMERCIAL', color: 'var(--success)' },
      luminaria_fabricada: { label: 'LUM. FABRICADA', color: 'var(--primary)' },
    }
    const cfg = map[tipo] ?? { label: tipo.toUpperCase(), color: 'var(--text-muted)' }
    return (
      <span style={{
        fontSize: '10px', fontWeight: 600, padding: '1px 6px', borderRadius: '4px',
        backgroundColor: cfg.color + '18', color: cfg.color,
      }}>
        {cfg.label}
      </span>
    )
  }

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
        vendedor, validez_dias: validez,
        id_cliente: clienteSeleccionado.id_cliente,
        razon_social: clienteSeleccionado.razon_social || clienteSeleccionado.nombre,
        cuit: clienteSeleccionado.cuit,
        direccion: clienteSeleccionado.direccion,
        localidad: clienteSeleccionado.localidad,
        telefono: clienteSeleccionado.telefono,
        email: clienteSeleccionado.email,
        atencion,
        condicion_iva: clienteSeleccionado.condicion_iva,
        lineas, moneda: 'U$S', subtotal, iva, total,
        forma_pago: formaPago, cotizacion, plazo_entrega: '', comentario, estado,
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

      <div style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '10px', padding: '20px 24px', marginBottom: '16px' }}>
        <h2 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px' }}>Datos del cliente</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
          <div>
            <label style={labelStyle}>CLIENTE *</label>
            <select onChange={(e) => seleccionarCliente(e.target.value)} style={inputStyle}>
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
            <label style={labelStyle}>FORMA DE PAGO</label>
            <input type="text" value={formaPago} onChange={(e) => setFormaPago(e.target.value)}
              placeholder="Ej: Cheque a 10 días" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>COTIZACIÓN</label>
            <input type="text" value={cotizacion} onChange={(e) => setCotizacion(e.target.value)}
              placeholder="Ej: Dólar BNA Tipo Vendedor" style={inputStyle} />
          </div>
        </div>
      </div>

      <div style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '10px', padding: '20px 24px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>Detalle</h2>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => setMostrarCatalogo(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                fontSize: '13px', fontWeight: 600, color: 'var(--secondary)',
                background: 'none', border: '1px solid var(--border)', borderRadius: '6px',
                padding: '6px 12px', cursor: 'pointer',
              }}>
              <Search size={14} /> Buscar en catálogo
            </button>
            <button onClick={agregarLinea}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                fontSize: '13px', fontWeight: 600, color: 'var(--primary)',
                background: 'none', border: 'none', cursor: 'pointer',
              }}>
              <Plus size={15} /> Agregar ítem manual
            </button>
          </div>
        </div>

        {lineas.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', fontSize: '13px', color: 'var(--text-muted)', border: '1px dashed var(--border)', borderRadius: '8px' }}>
            Buscá en el catálogo o agregá ítems manualmente.
          </div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr 80px 120px 110px 110px 36px', gap: '8px', marginBottom: '8px' }}>
              {['Código', 'Descripción', 'Cantidad', 'Plazo entrega', 'P. Unitario U$S', 'P. Total U$S', ''].map((h) => (
                <div key={h} style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)' }}>{h}</div>
              ))}
            </div>
            {lineas.map((l, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '120px 1fr 80px 120px 110px 110px 36px', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                <input type="text" value={l.codigo} onChange={(e) => actualizarLinea(i, 'codigo', e.target.value)}
                  placeholder="Código" style={{ ...inputStyle, fontSize: '12px' }} />
                <input type="text" value={l.descripcion} onChange={(e) => actualizarLinea(i, 'descripcion', e.target.value)}
                  placeholder="Descripción" style={{ ...inputStyle, fontSize: '12px' }} />
                <input type="number" min={1} value={l.cantidad} onChange={(e) => actualizarLinea(i, 'cantidad', Number(e.target.value))}
                  style={{ ...inputStyle, fontSize: '12px' }} />
                <input type="text" value={l.plazo_entrega_linea} onChange={(e) => actualizarLinea(i, 'plazo_entrega_linea', e.target.value)}
                  placeholder="Ej: Inmediata" style={{ ...inputStyle, fontSize: '12px' }} />
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

      {mostrarCatalogo && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 200,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            backgroundColor: 'var(--card-bg)', borderRadius: '12px',
            width: '100%', maxWidth: '600px', maxHeight: '80vh',
            display: 'flex', flexDirection: 'column',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px' }}>
                Buscar en catálogo
              </h3>
              <div style={{ position: 'relative' }}>
                <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input type="text" autoFocus placeholder="Código o descripción..."
                  value={busquedaCatalogo} onChange={(e) => setBusquedaCatalogo(e.target.value)}
                  style={{
                    width: '100%', padding: '8px 12px 8px 32px',
                    border: '1px solid var(--border)', borderRadius: '8px',
                    fontSize: '13px', backgroundColor: 'var(--input-bg)',
                    color: 'var(--text-primary)', outline: 'none',
                  }}
                />
              </div>
            </div>
            <div style={{ overflowY: 'auto', flex: 1 }}>
              {catalogoFiltrado.length === 0 ? (
                <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                  {busquedaCatalogo ? 'No se encontraron productos' : 'Escribí para buscar'}
                </div>
              ) : (
                catalogoFiltrado.map((p) => (
                  <div key={p.codigo} onClick={() => agregarDesdeCatalogo(p)}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '12px 24px', borderBottom: '1px solid var(--border)', cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--sidebar-hover)' }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                        <span style={{ fontWeight: 600, fontSize: '13px', color: 'var(--primary)' }}>{p.codigo}</span>
                        {tipoBadge(p.tipo)}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{p.descripcion}</div>
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', marginLeft: '16px' }}>
                      {p.precio > 0 ? `U$S ${p.precio.toLocaleString('es-AR', { minimumFractionDigits: 2 })}` : 'Sin precio'}
                    </div>
                  </div>
                ))
              )}
            </div>
            <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => { setMostrarCatalogo(false); setBusquedaCatalogo('') }}
                style={{
                  padding: '8px 16px', borderRadius: '6px', fontSize: '13px',
                  border: '1px solid var(--border)', backgroundColor: 'transparent',
                  color: 'var(--text-secondary)', cursor: 'pointer',
                }}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}