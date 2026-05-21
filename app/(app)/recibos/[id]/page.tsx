'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Printer, Plus, CheckCircle, AlertTriangle, Pencil, Trash2 } from 'lucide-react'
import { EMPRESA } from '@/lib/constants'

interface Pago {
  _id: string
  fecha: string
  monto_usd: number
  tipo_cambio: number
  monto_pesos: number
  forma_pago: string
  notas: string
}

interface Recibo {
  _id: string
  numero: string
  fecha: string
  razon_social: string
  numero_presupuesto: string
  numero_orden: string
  concepto: string
  lineas_detalle: { descripcion: string; monto_usd: number }[]
  total_usd: number
  total_pagado_usd: number
  saldo_usd: number
  estado: string
  pagos: Pago[]
  notas: string
}

interface LineaEditar {
  descripcion: string
  monto_usd: number
}

const formasPago = ['Efectivo', 'Transferencia', 'Cheque', 'Depósito']

export default function VerReciboPage() {
  const { id } = useParams()
  const router = useRouter()
  const [recibo, setRecibo] = useState<Recibo | null>(null)
  const [loading, setLoading] = useState(true)
  const [modalPago, setModalPago] = useState(false)
  const [modalEditar, setModalEditar] = useState(false)
  const [formPago, setFormPago] = useState({ monto_usd: 0, tipo_cambio: 0, forma_pago: 'Transferencia', notas: '' })
  const [formEditar, setFormEditar] = useState({ concepto: '', lineas: [] as LineaEditar[], notas: '' })
  const [guardandoPago, setGuardandoPago] = useState(false)
  const [guardandoEditar, setGuardandoEditar] = useState(false)
  const [error, setError] = useState('')
  const [errorEditar, setErrorEditar] = useState('')
  const [resultado, setResultado] = useState<{ ok: boolean; mensaje: string } | null>(null)

  const cargarRecibo = () => {
    fetch(`/api/recibos/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.ok) setRecibo(data.data)
        setLoading(false)
      })
  }

  useEffect(() => {
    fetch(`/api/recibos/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.ok) setRecibo(data.data)
        setLoading(false)
      })
  }, [id])

  const abrirEditar = () => {
    if (!recibo) return
    setFormEditar({
      concepto: recibo.concepto,
      lineas: recibo.lineas_detalle?.length ? recibo.lineas_detalle : [{ descripcion: '', monto_usd: 0 }],
      notas: recibo.notas,
    })
    setModalEditar(true)
  }

  const guardarEditar = async () => {
    setErrorEditar('')
    if (!formEditar.concepto.trim()) return setErrorEditar('El concepto es obligatorio')
    const invalidas = formEditar.lineas.some((l) => !l.descripcion.trim())
    if (invalidas) return setErrorEditar('Completá la descripción en todas las líneas')

    const totalUsd = formEditar.lineas.reduce((acc, l) => acc + Number(l.monto_usd), 0)

    setGuardandoEditar(true)
    const res = await fetch(`/api/recibos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        concepto: formEditar.concepto,
        lineas_detalle: formEditar.lineas,
        total_usd: totalUsd,
        saldo_usd: totalUsd - (recibo?.total_pagado_usd ?? 0),
        notas: formEditar.notas,
      }),
    })
    const data = await res.json()
    setGuardandoEditar(false)
    if (!data.ok) return setErrorEditar(data.error || 'Error al guardar')
    setModalEditar(false)
    cargarRecibo()
  }

  const registrarPago = async () => {
    setError('')
    if (!formPago.monto_usd || formPago.monto_usd <= 0) return setError('El monto debe ser mayor a 0')
    if (!formPago.tipo_cambio || formPago.tipo_cambio <= 0) return setError('El tipo de cambio es obligatorio')

    setGuardandoPago(true)
    const res = await fetch(`/api/recibos/${id}/pago`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formPago),
    })
    const data = await res.json()
    setGuardandoPago(false)

    if (!data.ok) {
      setError(data.error || 'Error al registrar pago')
      return
    }

    setModalPago(false)
    setFormPago({ monto_usd: 0, tipo_cambio: 0, forma_pago: 'Transferencia', notas: '' })
    setResultado({ ok: true, mensaje: 'Pago registrado correctamente.' })
    cargarRecibo()
  }

  if (loading) return <div style={{ padding: '32px', color: 'var(--text-muted)' }}>Cargando...</div>
  if (!recibo) return <div style={{ padding: '32px', color: 'var(--danger)' }}>Recibo no encontrado</div>

  const estadoColor: Record<string, string> = {
    'Pendiente de pago': 'var(--warning)',
    'Pago parcial': 'var(--secondary)',
    'Cancelado': 'var(--success)',
  }

  const inputStyle = {
    width: '100%', padding: '8px 10px',
    border: '1px solid var(--border)', borderRadius: '6px',
    fontSize: '13px', backgroundColor: 'var(--input-bg)',
    color: 'var(--text-primary)', outline: 'none',
  } as const

  const labelStyle = { display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' } as const

  const totalEditar = formEditar.lineas.reduce((acc, l) => acc + Number(l.monto_usd), 0)

  return (
    <>
      {/* Barra acciones */}
      <div className="no-print" style={{
        padding: '16px 32px', borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', gap: '12px',
        backgroundColor: 'var(--card-bg)',
      }}>
        <button onClick={() => router.push('/recibos')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '4px' }}>
          <ArrowLeft size={20} />
        </button>
        <div style={{ flex: 1 }}>
          <span style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>{recibo.numero}</span>
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)', marginLeft: '12px' }}>{recibo.razon_social}</span>
        </div>
        <span style={{
          fontSize: '12px', fontWeight: 600, padding: '4px 12px', borderRadius: '6px',
          backgroundColor: `${estadoColor[recibo.estado]}18`,
          color: estadoColor[recibo.estado],
        }}>
          {recibo.estado}
        </span>
        <button onClick={abrirEditar}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            backgroundColor: 'transparent', color: 'var(--text-secondary)',
            border: '1px solid var(--border)', borderRadius: '8px',
            padding: '9px 16px', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
          }}>
          <Pencil size={15} /> Editar
        </button>
        <button onClick={() => window.print()}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            backgroundColor: 'transparent', color: 'var(--text-secondary)',
            border: '1px solid var(--border)', borderRadius: '8px',
            padding: '9px 16px', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
          }}>
          <Printer size={15} /> Imprimir
        </button>
        {recibo.estado !== 'Cancelado' && (
          <button onClick={() => setModalPago(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              backgroundColor: 'var(--primary)', color: '#fff',
              border: 'none', borderRadius: '8px',
              padding: '9px 16px', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
            }}>
            <Plus size={15} /> Registrar pago
          </button>
        )}
      </div>

      {/* Documento */}
      <div style={{ padding: '32px', maxWidth: '900px', margin: '0 auto' }}>
        <div style={{
          backgroundColor: '#fff', border: '1px solid var(--border)',
          borderRadius: '8px', padding: '40px',
          fontFamily: 'Arial, sans-serif', fontSize: '13px', color: '#1a2332',
        }}>
          {/* Encabezado */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
            <div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: '#2d7d78' }}>{EMPRESA.razon_social}</div>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>{EMPRESA.domicilio}</div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>{EMPRESA.localidad}, {EMPRESA.provincia}</div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>Tel: {EMPRESA.telefono}</div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>CUIT: {EMPRESA.cuit}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '18px', fontWeight: 700, color: '#1a2332' }}>RECIBO</div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: '#2d7d78', marginTop: '4px' }}>{recibo.numero}</div>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '8px' }}>
                Fecha: {new Date(recibo.fecha).toLocaleDateString('es-AR')}
              </div>
            </div>
          </div>

          <div style={{ borderTop: '2px solid #2d7d78', marginBottom: '24px' }} />

          {/* Cliente y referencia */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', marginBottom: '6px', letterSpacing: '1px' }}>CLIENTE</div>
              <div style={{ fontWeight: 700, fontSize: '15px' }}>{recibo.razon_social}</div>
            </div>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', marginBottom: '6px', letterSpacing: '1px' }}>REFERENCIA</div>
              {recibo.numero_presupuesto && <div style={{ fontSize: '12px' }}>Presupuesto: <b>{recibo.numero_presupuesto}</b></div>}
              {recibo.numero_orden && <div style={{ fontSize: '12px' }}>Orden de trabajo: <b>{recibo.numero_orden}</b></div>}
              {!recibo.numero_presupuesto && !recibo.numero_orden && <div style={{ fontSize: '12px', color: '#64748b' }}>—</div>}
            </div>
          </div>

          {/* Concepto y detalle */}
          <div style={{ backgroundColor: '#f8fafc', borderRadius: '8px', padding: '16px', marginBottom: '24px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', marginBottom: '8px', letterSpacing: '1px' }}>CONCEPTO</div>
            <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: recibo.lineas_detalle?.length ? '12px' : 0 }}>{recibo.concepto}</div>
            {recibo.lineas_detalle?.length > 0 && (
              <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '8px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <th style={{ textAlign: 'left', fontSize: '11px', fontWeight: 600, color: '#64748b', padding: '4px 0' }}>Descripción</th>
                    <th style={{ textAlign: 'right', fontSize: '11px', fontWeight: 600, color: '#64748b', padding: '4px 0' }}>Monto U$S</th>
                  </tr>
                </thead>
                <tbody>
                  {recibo.lineas_detalle.map((l, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '6px 0', fontSize: '12px' }}>{l.descripcion}</td>
                      <td style={{ padding: '6px 0', fontSize: '12px', textAlign: 'right', fontWeight: 600 }}>
                        {l.monto_usd.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Totales */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '24px' }}>
            <div style={{ width: '300px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e2e8f0', fontSize: '13px' }}>
                <span style={{ color: '#64748b' }}>Total:</span>
                <span style={{ fontWeight: 700 }}>U$S {recibo.total_usd.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e2e8f0', fontSize: '13px' }}>
                <span style={{ color: '#64748b' }}>Total pagado:</span>
                <span style={{ fontWeight: 700, color: '#16a34a' }}>U$S {recibo.total_pagado_usd.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', fontSize: '16px', fontWeight: 700 }}>
                <span>Saldo pendiente:</span>
                <span style={{ color: recibo.saldo_usd > 0 ? '#dc2626' : '#16a34a' }}>
                  U$S {recibo.saldo_usd.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          {/* Historial de pagos */}
          {recibo.pagos.length > 0 && (
            <div style={{ marginBottom: '24px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', marginBottom: '12px', letterSpacing: '1px' }}>
                HISTORIAL DE PAGOS
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#0f1923', color: '#fff' }}>
                    <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: '11px', fontWeight: 600 }}>Fecha</th>
                    <th style={{ padding: '8px 12px', textAlign: 'right', fontSize: '11px', fontWeight: 600 }}>Monto U$S</th>
                    <th style={{ padding: '8px 12px', textAlign: 'right', fontSize: '11px', fontWeight: 600 }}>T. Cambio</th>
                    <th style={{ padding: '8px 12px', textAlign: 'right', fontSize: '11px', fontWeight: 600 }}>Monto $</th>
                    <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: '11px', fontWeight: 600 }}>Forma de pago</th>
                    <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: '11px', fontWeight: 600 }}>Notas</th>
                  </tr>
                </thead>
                <tbody>
                  {recibo.pagos.map((p, i) => (
                    <tr key={p._id} style={{ backgroundColor: i % 2 === 0 ? '#f8fafc' : '#fff', borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '8px 12px', fontSize: '12px' }}>{new Date(p.fecha).toLocaleDateString('es-AR')}</td>
                      <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 600, fontSize: '12px' }}>
                        {p.monto_usd.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                      </td>
                      <td style={{ padding: '8px 12px', textAlign: 'right', fontSize: '12px' }}>
                        ${p.tipo_cambio.toLocaleString('es-AR')}
                      </td>
                      <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 600, fontSize: '12px' }}>
                        ${p.monto_pesos.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                      </td>
                      <td style={{ padding: '8px 12px', fontSize: '12px' }}>{p.forma_pago}</td>
                      <td style={{ padding: '8px 12px', fontSize: '12px', color: '#64748b' }}>{p.notas || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Observaciones */}
          {recibo.notas && (
            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '16px', marginBottom: '16px', fontSize: '12px', color: '#64748b' }}>
              <b>OBSERVACIONES:</b> {recibo.notas}
            </div>
          )}

          {/* Firma */}
          <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'space-between' }}>
            <div style={{ fontSize: '12px', color: '#64748b' }}>
              Estado: <b>{recibo.estado}</b>
            </div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>
              Firma: _______________________
            </div>
          </div>
        </div>

        {/* Resultado */}
        {resultado && (
          <div className="no-print" style={{
            marginTop: '16px', padding: '16px 20px', borderRadius: '8px', fontSize: '13px',
            backgroundColor: resultado.ok ? 'var(--success-bg)' : 'var(--danger-bg)',
            color: resultado.ok ? 'var(--success)' : 'var(--danger)',
            border: `1px solid ${resultado.ok ? 'var(--success)' : 'var(--danger)'}`,
            display: 'flex', alignItems: 'center', gap: '8px',
          }}>
            {resultado.ok ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
            {resultado.mensaje}
          </div>
        )}
      </div>

      {/* Modal editar */}
      {modalEditar && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 200,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            backgroundColor: 'var(--card-bg)', borderRadius: '12px',
            padding: '28px', maxWidth: '560px', width: '100%', maxHeight: '90vh', overflowY: 'auto',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '20px' }}>
              Editar recibo {recibo.numero}
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={labelStyle}>CONCEPTO *</label>
                <input type="text" value={formEditar.concepto}
                  onChange={(e) => setFormEditar((p) => ({ ...p, concepto: e.target.value }))}
                  style={inputStyle} />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={labelStyle}>DETALLE</label>
                  <button onClick={() => setFormEditar((p) => ({ ...p, lineas: [...p.lineas, { descripcion: '', monto_usd: 0 }] }))}
                    style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 600, color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer' }}>
                    <Plus size={13} /> Agregar línea
                  </button>
                </div>
                {formEditar.lineas.map((l, i) => (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 110px 32px', gap: '6px', marginBottom: '6px', alignItems: 'center' }}>
                    <input type="text" value={l.descripcion}
                      onChange={(e) => setFormEditar((p) => ({ ...p, lineas: p.lineas.map((x, idx) => idx === i ? { ...x, descripcion: e.target.value } : x) }))}
                      placeholder="Descripción" style={{ ...inputStyle, fontSize: '12px' }} />
                    <input type="number" min={0} step={0.01} value={l.monto_usd}
                      onChange={(e) => setFormEditar((p) => ({ ...p, lineas: p.lineas.map((x, idx) => idx === i ? { ...x, monto_usd: Number(e.target.value) } : x) }))}
                      style={{ ...inputStyle, fontSize: '12px' }} />
                    <button onClick={() => setFormEditar((p) => ({ ...p, lineas: p.lineas.filter((_, idx) => idx !== i) }))}
                      disabled={formEditar.lineas.length === 1}
                      style={{ background: 'none', border: 'none', cursor: formEditar.lineas.length === 1 ? 'not-allowed' : 'pointer', color: 'var(--danger)', opacity: formEditar.lineas.length === 1 ? 0.3 : 1 }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                <div style={{ textAlign: 'right', fontSize: '13px', fontWeight: 700, paddingTop: '8px', borderTop: '1px solid var(--border)' }}>
                  Total: U$S {totalEditar.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                </div>
              </div>

              <div>
                <label style={labelStyle}>OBSERVACIONES</label>
                <textarea value={formEditar.notas}
                  onChange={(e) => setFormEditar((p) => ({ ...p, notas: e.target.value }))}
                  rows={2} style={{ ...inputStyle, resize: 'vertical' }} />
              </div>

              {errorEditar && (
                <div style={{ backgroundColor: 'var(--danger-bg)', color: 'var(--danger)', padding: '10px 14px', borderRadius: '6px', fontSize: '13px' }}>
                  {errorEditar}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
              <button onClick={() => setModalEditar(false)}
                style={{
                  padding: '8px 16px', borderRadius: '6px', fontSize: '13px',
                  border: '1px solid var(--border)', backgroundColor: 'transparent',
                  color: 'var(--text-secondary)', cursor: 'pointer',
                }}>
                Cancelar
              </button>
              <button onClick={guardarEditar} disabled={guardandoEditar}
                style={{
                  padding: '8px 20px', borderRadius: '6px', fontSize: '13px', fontWeight: 600,
                  border: 'none', backgroundColor: 'var(--primary)', color: '#fff',
                  cursor: guardandoEditar ? 'not-allowed' : 'pointer', opacity: guardandoEditar ? 0.7 : 1,
                }}>
                {guardandoEditar ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal registrar pago */}
      {modalPago && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 200,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            backgroundColor: 'var(--card-bg)', borderRadius: '12px',
            padding: '28px', maxWidth: '460px', width: '100%',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
              Registrar pago
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
              Saldo pendiente: <b>U$S {recibo.saldo_usd.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</b>
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={labelStyle}>MONTO U$S *</label>
                  <input type="number" min={0} step={0.01}
                    value={formPago.monto_usd}
                    onChange={(e) => setFormPago((p) => ({ ...p, monto_usd: Number(e.target.value) }))}
                    style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>TIPO DE CAMBIO *</label>
                  <input type="number" min={0} step={1}
                    value={formPago.tipo_cambio}
                    onChange={(e) => setFormPago((p) => ({ ...p, tipo_cambio: Number(e.target.value) }))}
                    placeholder="Ej: 1250"
                    style={inputStyle} />
                </div>
              </div>

              {formPago.monto_usd > 0 && formPago.tipo_cambio > 0 && (
                <div style={{ backgroundColor: 'var(--success-bg)', padding: '10px 14px', borderRadius: '6px', fontSize: '13px', color: 'var(--success)', fontWeight: 600 }}>
                  = $ {(formPago.monto_usd * formPago.tipo_cambio).toLocaleString('es-AR', { minimumFractionDigits: 2 })} pesos
                </div>
              )}

              <div>
                <label style={labelStyle}>FORMA DE PAGO *</label>
                <select value={formPago.forma_pago}
                  onChange={(e) => setFormPago((p) => ({ ...p, forma_pago: e.target.value }))}
                  style={inputStyle}>
                  {formasPago.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>

              <div>
                <label style={labelStyle}>NOTAS</label>
                <input type="text" value={formPago.notas}
                  onChange={(e) => setFormPago((p) => ({ ...p, notas: e.target.value }))}
                  placeholder="Observaciones del pago"
                  style={inputStyle} />
              </div>

              {error && (
                <div style={{ backgroundColor: 'var(--danger-bg)', color: 'var(--danger)', padding: '10px 14px', borderRadius: '6px', fontSize: '13px' }}>
                  {error}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
              <button onClick={() => { setModalPago(false); setError('') }}
                style={{
                  padding: '8px 16px', borderRadius: '6px', fontSize: '13px',
                  border: '1px solid var(--border)', backgroundColor: 'transparent',
                  color: 'var(--text-secondary)', cursor: 'pointer',
                }}>
                Cancelar
              </button>
              <button onClick={registrarPago} disabled={guardandoPago}
                style={{
                  padding: '8px 20px', borderRadius: '6px', fontSize: '13px', fontWeight: 600,
                  border: 'none', backgroundColor: 'var(--primary)', color: '#fff',
                  cursor: guardandoPago ? 'not-allowed' : 'pointer', opacity: guardandoPago ? 0.7 : 1,
                }}>
                {guardandoPago ? 'Guardando...' : 'Confirmar pago'}
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