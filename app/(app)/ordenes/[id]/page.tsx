'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Play, CheckCircle, AlertTriangle, Printer, Trash2 } from 'lucide-react'
import { EMPRESA } from '@/lib/constants'

interface OrdenTrabajo {
  _id: string
  numero: string
  fecha: string
  fecha_entrega: string
  numero_presupuesto: string
  razon_social: string
  vendedor: string
  lineas: { codigo_luminaria: string; descripcion: string; cantidad: number }[]
  estado: string
  notas: string
  ejecutada: boolean
  fecha_ejecucion: string
}

interface ResultadoEjecucion {
  ok: boolean
  mensaje: string
  errores?: string[]
  a_fabricar?: { codigo_luminaria: string; descripcion: string; cantidad: number }[]
  en_stock?: { codigo: string; descripcion: string; cantidad: number; tipo: string }[]
  proyecto_id?: string
  proyecto_numero?: string
}

interface ComponenteReceta {
  id_componente: string
  cantidad_por_unidad: number
  cantidad_total: number
}

interface LineaReceta {
  codigo_luminaria: string
  descripcion: string
  cantidad_pedida: number
  tiene_receta: boolean
  componentes: ComponenteReceta[]
}

export default function VerOrdenPage() {
  const { id } = useParams()
  const router = useRouter()
  const [orden, setOrden] = useState<OrdenTrabajo | null>(null)
  const [recetas, setRecetas] = useState<LineaReceta[]>([])
  const [loading, setLoading] = useState(true)
  const [ejecutando, setEjecutando] = useState(false)
  const [resultado, setResultado] = useState<ResultadoEjecucion | null>(null)
  const [confirmarEjecucion, setConfirmarEjecucion] = useState(false)
  const [confirmarEliminar, setConfirmarEliminar] = useState(false)

  useEffect(() => {
    if (!id) return
    fetch(`/api/ordenes/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.ok) setOrden(data.data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
    fetch(`/api/ordenes/${id}/recetas`)
      .then((r) => r.json())
      .then((data) => { if (data.ok) setRecetas(data.data) })
  }, [id])

  const ejecutar = async () => {
    setConfirmarEjecucion(false)
    setEjecutando(true)
    setResultado(null)
    const res = await fetch(`/api/ordenes/${id}/ejecutar`, { method: 'POST' })
    const data = await res.json()
    setEjecutando(false)
        setResultado({
      ok: data.ok,
      mensaje: data.ok ? data.mensaje : data.error,
      errores: data.errores,
      a_fabricar: data.a_fabricar,
      en_stock: data.en_stock,
      proyecto_id: data.proyecto_id,
      proyecto_numero: data.proyecto_numero,
    })
    if (data.ok) {
      fetch(`/api/ordenes/${id}`)
        .then((r) => r.json())
        .then((d) => { if (d.ok) setOrden(d.data) })
    }
  }

  const eliminar = async () => {
    const res = await fetch(`/api/ordenes/${id}`, { method: 'DELETE' })
    const data = await res.json()
    if (data.ok) {
      router.push('/ordenes')
    } else {
      setResultado({ ok: false, mensaje: data.error })
      setConfirmarEliminar(false)
    }
  }

  if (loading) return <div style={{ padding: '32px', color: 'var(--text-muted)' }}>Cargando...</div>
  if (!orden) return <div style={{ padding: '32px', color: 'var(--danger)' }}>Orden no encontrada</div>

  const estadoColor: Record<string, string> = {
    Pendiente: 'var(--warning)',
    'En proceso': 'var(--secondary)',
    Completada: 'var(--success)',
    Cancelada: 'var(--danger)',
  }

  return (
    <>
      {/* Barra acciones */}
      <div className="no-print" style={{
        padding: '16px 32px', borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', gap: '12px',
        backgroundColor: 'var(--card-bg)',
      }}>
        <button onClick={() => router.push('/ordenes')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '4px' }}>
          <ArrowLeft size={20} />
        </button>
        <div style={{ flex: 1 }}>
          <span style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>{orden.numero}</span>
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)', marginLeft: '12px' }}>
            {orden.razon_social} {orden.numero_presupuesto ? `— Presupuesto ${orden.numero_presupuesto}` : ''}
          </span>
        </div>
        <span style={{
          fontSize: '12px', fontWeight: 600, padding: '4px 12px', borderRadius: '6px',
          backgroundColor: `${estadoColor[orden.estado]}18`, color: estadoColor[orden.estado],
        }}>
          {orden.estado}
        </span>
        <button onClick={() => window.print()}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'transparent',
            color: 'var(--text-secondary)', border: '1px solid var(--border)', borderRadius: '8px',
            padding: '9px 16px', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
          }}>
          <Printer size={15} /> Imprimir
        </button>
        {!orden.ejecutada && (
          <>
            <button onClick={() => setConfirmarEliminar(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'transparent',
                color: 'var(--danger)', border: '1px solid var(--danger)', borderRadius: '8px',
                padding: '9px 16px', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
              }}>
              <Trash2 size={15} /> Eliminar
            </button>
            <button onClick={() => setConfirmarEjecucion(true)} disabled={ejecutando}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'var(--primary)',
                color: '#fff', border: 'none', borderRadius: '8px', padding: '9px 16px',
                fontSize: '13px', fontWeight: 600, cursor: ejecutando ? 'not-allowed' : 'pointer',
                opacity: ejecutando ? 0.7 : 1,
              }}>
              <Play size={15} />
              {ejecutando ? 'Ejecutando...' : 'Ejecutar orden'}
            </button>
          </>
        )}
        {orden.ejecutada && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--success)', fontSize: '13px', fontWeight: 600 }}>
            <CheckCircle size={16} />
            Ejecutada el {new Date(orden.fecha_ejecucion).toLocaleDateString('es-AR')}
          </div>
        )}
      </div>

      <div style={{ padding: '32px', maxWidth: '900px', margin: '0 auto' }}>

        {/* HOJA 1 — Orden de trabajo */}
        <div style={{
          backgroundColor: '#fff', border: '1px solid var(--border)', borderRadius: '8px', padding: '40px',
          fontFamily: 'Arial, sans-serif', fontSize: '13px', color: '#1a2332',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
            <div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: '#2d7d78', letterSpacing: '1px' }}>{EMPRESA.razon_social}</div>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>{EMPRESA.domicilio}</div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>{EMPRESA.localidad}, {EMPRESA.provincia}</div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>Tel: {EMPRESA.telefono}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '18px', fontWeight: 700, color: '#1a2332' }}>ORDEN DE TRABAJO</div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: '#2d7d78', marginTop: '4px' }}>{orden.numero}</div>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '8px' }}>
                Fecha: {new Date(orden.fecha).toLocaleDateString('es-AR')}
              </div>
              {orden.fecha_entrega && (
                <div style={{ fontSize: '12px', color: '#64748b' }}>
                  Entrega: {new Date(orden.fecha_entrega).toLocaleDateString('es-AR')}
                </div>
              )}
              <div style={{ fontSize: '12px', color: '#64748b' }}>Vendedor: {orden.vendedor}</div>
            </div>
          </div>

          <div style={{ borderTop: '2px solid #2d7d78', marginBottom: '24px' }} />

          <div style={{ marginBottom: '24px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', marginBottom: '6px', letterSpacing: '1px' }}>CLIENTE</div>
            <div style={{ fontWeight: 700, fontSize: '15px' }}>{orden.razon_social}</div>
            {orden.numero_presupuesto && (
              <div style={{ fontSize: '12px', color: '#64748b' }}>Presupuesto de referencia: {orden.numero_presupuesto}</div>
            )}
            {orden.notas && (
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>Notas: {orden.notas}</div>
            )}
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '24px' }}>
            <thead>
              <tr style={{ backgroundColor: '#0f1923', color: '#fff' }}>
                <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: '12px', fontWeight: 600 }}>Código</th>
                <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: '12px', fontWeight: 600 }}>Descripción</th>
                <th style={{ padding: '10px 12px', textAlign: 'center', fontSize: '12px', fontWeight: 600 }}>Cantidad</th>
              </tr>
            </thead>
            <tbody>
              {orden.lineas.map((l, i) => (
                <tr key={i} style={{ backgroundColor: i % 2 === 0 ? '#f8fafc' : '#fff', borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '10px 12px', fontWeight: 600, fontSize: '12px' }}>{l.codigo_luminaria}</td>
                  <td style={{ padding: '10px 12px', fontSize: '12px' }}>{l.descripcion}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 700, fontSize: '13px' }}>{l.cantidad}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '12px', color: '#64748b' }}>
              Estado: <b>{orden.estado}</b>
              {orden.ejecutada && ` — Ejecutada el ${new Date(orden.fecha_ejecucion).toLocaleDateString('es-AR')}`}
            </div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>Firma recepción: _______________________</div>
          </div>
        </div>

        {/* HOJA 2 — Componentes por receta (solo si hay recetas) */}
        {recetas.some((r) => r.tiene_receta) && (
          <div style={{
            backgroundColor: '#fff', border: '1px solid var(--border)', borderRadius: '8px', padding: '40px',
            fontFamily: 'Arial, sans-serif', fontSize: '13px', color: '#1a2332',
            marginTop: '24px', pageBreakBefore: 'always',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', paddingBottom: '16px', borderBottom: '2px solid #2d7d78' }}>
              <div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: '#2d7d78' }}>{EMPRESA.razon_social}</div>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>Detalle de componentes por luminaria</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '16px', fontWeight: 700, color: '#1a2332' }}>ORDEN DE TRABAJO</div>
                <div style={{ fontSize: '18px', fontWeight: 800, color: '#2d7d78' }}>{orden.numero}</div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>{orden.razon_social}</div>
              </div>
            </div>

            {recetas.filter((r) => r.tiene_receta).map((r, ri) => (
              <div key={ri} style={{ marginBottom: '28px' }}>
                <div style={{
                  backgroundColor: '#0f1923', color: '#fff', padding: '8px 12px',
                  borderRadius: '6px', marginBottom: '8px',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <span style={{ fontWeight: 700, fontSize: '13px' }}>{r.codigo_luminaria} — {r.descripcion}</span>
                  <span style={{ fontSize: '12px', opacity: 0.8 }}>Cantidad pedida: {r.cantidad_pedida}</span>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                      <th style={{ padding: '6px 10px', textAlign: 'left', fontWeight: 600, color: '#64748b' }}>Componente</th>
                      <th style={{ padding: '6px 10px', textAlign: 'center', fontWeight: 600, color: '#64748b' }}>Por unidad</th>
                      <th style={{ padding: '6px 10px', textAlign: 'center', fontWeight: 600, color: '#64748b' }}>Total ({r.cantidad_pedida} uds)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {r.componentes.map((c, ci) => (
                      <tr key={ci} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '6px 10px', fontWeight: 500 }}>{c.id_componente}</td>
                        <td style={{ padding: '6px 10px', textAlign: 'center', color: '#64748b' }}>{c.cantidad_por_unidad}</td>
                        <td style={{ padding: '6px 10px', textAlign: 'center', fontWeight: 700, color: '#2d7d78' }}>{c.cantidad_total}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        )}

        {/* Paneles resultado */}
        {resultado && (
          <>
            <div className="no-print" style={{
              marginTop: '16px', padding: '16px 20px', borderRadius: '8px', fontSize: '13px',
              backgroundColor: resultado.ok ? 'var(--success-bg)' : 'var(--danger-bg)',
              color: resultado.ok ? 'var(--success)' : 'var(--danger)',
              border: `1px solid ${resultado.ok ? 'var(--success)' : 'var(--danger)'}`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
                {resultado.ok ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
                {resultado.mensaje}
              </div>
            </div>

            {resultado.a_fabricar && resultado.a_fabricar.length > 0 && (
              <div className="no-print" style={{
                marginTop: '12px', padding: '16px 20px', borderRadius: '8px',
                backgroundColor: '#eff6ff', border: '1px solid #4a6fa5',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: '#4a6fa5', fontSize: '13px' }}>
                    <AlertTriangle size={16} />
                    Falta fabricar antes de ejecutar:
                  </div>
                                    <button onClick={() => resultado.proyecto_id ? router.push(`/proyectos/${resultado.proyecto_id}`) : router.push('/proyectos')}
                    style={{ padding: '6px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, backgroundColor: '#4a6fa5', color: '#fff', border: 'none', cursor: 'pointer' }}>
                    Ver proyecto {resultado.proyecto_numero ?? ''} →
                  </button>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #c7d6ec' }}>
                      <th style={{ textAlign: 'left', padding: '6px 0', color: '#4a6fa5', fontWeight: 600 }}>Código</th>
                      <th style={{ textAlign: 'left', padding: '6px 0', color: '#4a6fa5', fontWeight: 600 }}>Descripción</th>
                      <th style={{ textAlign: 'right', padding: '6px 0', color: '#4a6fa5', fontWeight: 600 }}>Cantidad</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resultado.a_fabricar.map((f, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #e0e8f4' }}>
                        <td style={{ padding: '8px 0', fontWeight: 600, color: '#1a2332' }}>{f.codigo_luminaria}</td>
                        <td style={{ padding: '8px 0', color: '#475569' }}>{f.descripcion}</td>
                        <td style={{ padding: '8px 0', textAlign: 'right', fontWeight: 700, color: '#1a2332' }}>{f.cantidad}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {resultado.ok && resultado.en_stock && resultado.en_stock.length > 0 && (
              <div className="no-print" style={{
                marginTop: '12px', padding: '16px 20px', borderRadius: '8px',
                backgroundColor: '#f0fdf4', border: '1px solid #16a34a',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: '#16a34a', fontSize: '13px', marginBottom: '10px' }}>
                  <CheckCircle size={16} />
                  Disponible en stock — listo para despachar:
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #bbf7d0' }}>
                      <th style={{ textAlign: 'left', padding: '6px 0', color: '#16a34a', fontWeight: 600 }}>Código</th>
                      <th style={{ textAlign: 'left', padding: '6px 0', color: '#16a34a', fontWeight: 600 }}>Descripción</th>
                      <th style={{ textAlign: 'center', padding: '6px 0', color: '#16a34a', fontWeight: 600 }}>Tipo</th>
                      <th style={{ textAlign: 'right', padding: '6px 0', color: '#16a34a', fontWeight: 600 }}>Cantidad</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resultado.en_stock.map((s, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #dcfce7' }}>
                        <td style={{ padding: '8px 0', fontWeight: 600, color: '#1a2332' }}>{s.codigo}</td>
                        <td style={{ padding: '8px 0', color: '#475569' }}>{s.descripcion}</td>
                        <td style={{ padding: '8px 0', textAlign: 'center', color: '#16a34a', fontWeight: 600, fontSize: '11px' }}>{s.tipo.toUpperCase()}</td>
                        <td style={{ padding: '8px 0', textAlign: 'right', fontWeight: 700, color: '#1a2332' }}>{s.cantidad}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>

      {confirmarEjecucion && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ backgroundColor: 'var(--card-bg)', borderRadius: '12px', padding: '28px', maxWidth: '420px', width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>Ejecutar {orden.numero}</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '24px' }}>
              El sistema revisará el stock. Si todo está disponible, ejecuta y descuenta. Si falta fabricar, te avisa qué producir primero.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button onClick={() => setConfirmarEjecucion(false)}
                style={{ padding: '8px 16px', borderRadius: '6px', fontSize: '13px', border: '1px solid var(--border)', backgroundColor: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                Cancelar
              </button>
              <button onClick={ejecutar}
                style={{ padding: '8px 20px', borderRadius: '6px', fontSize: '13px', fontWeight: 600, border: 'none', backgroundColor: 'var(--primary)', color: '#fff', cursor: 'pointer' }}>
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmarEliminar && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ backgroundColor: 'var(--card-bg)', borderRadius: '12px', padding: '28px', maxWidth: '380px', width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>Eliminar {orden.numero}</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '24px' }}>
              ¿Confirmás que querés eliminar esta orden? Esta acción no se puede deshacer.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button onClick={() => setConfirmarEliminar(false)}
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

      <style>{`
        @media print {
          .no-print { display: none !important; }
          aside { display: none !important; }
          main { margin-left: 0 !important; }
          body { background: white !important; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        }
      `}</style>
    </>
  )
}