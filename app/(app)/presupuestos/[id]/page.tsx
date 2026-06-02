'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Printer } from 'lucide-react'
import { EMPRESA } from '@/lib/constants'

interface Linea {
  codigo: string
  descripcion: string
  cantidad: number
  bonificacion: number
  precio_unitario: number
  precio_total: number
  plazo_entrega_linea: string
}

interface Presupuesto {
  _id: string
  numero: string
  fecha: string
  validez_dias: number
  vendedor: string
  razon_social: string
  cuit: string
  direccion: string
  localidad: string
  telefono: string
  email: string
  atencion: string
  condicion_iva: string
  lineas: Linea[]
  moneda: string
  subtotal: number
  iva: number
  total: number
  forma_pago: string
  cotizacion: string
  comentario: string
  estado: string
}

export default function VerPresupuestoPage() {
  const { id } = useParams()
  const router = useRouter()
  const [presupuesto, setPresupuesto] = useState<Presupuesto | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/presupuestos/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.ok) setPresupuesto(data.data)
        setLoading(false)
      })
  }, [id])

  if (loading) return <div style={{ padding: '32px', color: 'var(--text-muted)' }}>Cargando...</div>
  if (!presupuesto) return <div style={{ padding: '32px', color: 'var(--danger)' }}>Presupuesto no encontrado</div>

  const fecha = new Date(presupuesto.fecha)

  return (
    <>
      <div className="no-print" style={{
        padding: '16px 32px', borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', gap: '12px',
        backgroundColor: 'var(--card-bg)',
      }}>
        <button onClick={() => router.push('/presupuestos')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '4px' }}>
          <ArrowLeft size={20} />
        </button>
        <span style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', flex: 1 }}>
          Presupuesto {presupuesto.numero}
        </span>
        <button onClick={() => window.print()} style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          backgroundColor: 'var(--primary)', color: '#fff',
          border: 'none', borderRadius: '8px',
          padding: '9px 16px', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
        }}>
          <Printer size={16} /> Imprimir
        </button>
      </div>

      <div style={{ padding: '32px', maxWidth: '900px', margin: '0 auto' }}>
        <div style={{
          backgroundColor: '#fff', border: '1px solid var(--border)',
          borderRadius: '8px', padding: '40px',
          fontFamily: 'Arial, sans-serif', fontSize: '13px', color: '#1a2332',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px' }}>
            <div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: '#2d7d78', letterSpacing: '1px' }}>{EMPRESA.razon_social}</div>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>{EMPRESA.domicilio}</div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>{EMPRESA.localidad}, {EMPRESA.provincia}</div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>Tel: {EMPRESA.telefono}</div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>CUIT: {EMPRESA.cuit}</div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>{EMPRESA.condicion_iva}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '20px', fontWeight: 700, color: '#1a2332' }}>PRESUPUESTO</div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: '#2d7d78', marginTop: '4px' }}>PR {presupuesto.numero}</div>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '8px' }}>
                Fecha: {fecha.toLocaleDateString('es-AR')} {fecha.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
              </div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>Vendedor: {presupuesto.vendedor}</div>
            </div>
          </div>

          <div style={{ borderTop: '2px solid #2d7d78', marginBottom: '24px' }} />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', marginBottom: '8px', letterSpacing: '1px' }}>DATOS CLIENTE</div>
              <div style={{ fontWeight: 700, fontSize: '14px' }}>{presupuesto.razon_social}</div>
              {presupuesto.cuit && <div style={{ fontSize: '12px', color: '#64748b' }}>C.U.I.T.: {presupuesto.cuit}</div>}
              {presupuesto.condicion_iva && <div style={{ fontSize: '12px', color: '#64748b' }}>Condición: {presupuesto.condicion_iva}</div>}
              {presupuesto.direccion && <div style={{ fontSize: '12px', color: '#64748b' }}>Dirección: {presupuesto.direccion}</div>}
              {presupuesto.localidad && <div style={{ fontSize: '12px', color: '#64748b' }}>Localidad: {presupuesto.localidad}</div>}
              {presupuesto.telefono && <div style={{ fontSize: '12px', color: '#64748b' }}>Tel: {presupuesto.telefono}</div>}
              {presupuesto.email && <div style={{ fontSize: '12px', color: '#64748b' }}>Email: {presupuesto.email}</div>}
              {presupuesto.atencion && <div style={{ fontSize: '12px', color: '#64748b' }}>Atención: {presupuesto.atencion}</div>}
            </div>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', marginBottom: '8px', letterSpacing: '1px' }}>CONDICIONES</div>
              <div style={{ fontSize: '12px' }}>
                <div><b>Validez:</b> {presupuesto.validez_dias} días</div>
                {presupuesto.forma_pago && <div><b>Forma de pago:</b> {presupuesto.forma_pago}</div>}
                {presupuesto.cotizacion && <div><b>Cotización:</b> {presupuesto.cotizacion}</div>}
              </div>
            </div>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '24px' }}>
            <thead>
              <tr style={{ backgroundColor: '#0f1923', color: '#fff' }}>
                <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: '12px', fontWeight: 600 }}>Código</th>
                <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: '12px', fontWeight: 600 }}>Descripción</th>
                <th style={{ padding: '10px 12px', textAlign: 'center', fontSize: '12px', fontWeight: 600 }}>Cant.</th>
                <th style={{ padding: '10px 12px', textAlign: 'center', fontSize: '12px', fontWeight: 600 }}>Plazo entrega</th>
                <th style={{ padding: '10px 12px', textAlign: 'right', fontSize: '12px', fontWeight: 600 }}>P. Unitario</th>
                <th style={{ padding: '10px 12px', textAlign: 'right', fontSize: '12px', fontWeight: 600 }}>P. Total</th>
              </tr>
            </thead>
            <tbody>
              {presupuesto.lineas.map((l, i) => (
                <tr key={i} style={{ backgroundColor: i % 2 === 0 ? '#f8fafc' : '#fff', borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '10px 12px', fontSize: '12px', fontWeight: 600 }}>{l.codigo}</td>
                  <td style={{ padding: '10px 12px', fontSize: '12px' }}>{l.descripcion}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'center', fontSize: '12px' }}>{l.cantidad}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'center', fontSize: '12px' }}>{l.plazo_entrega_linea || '—'}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'right', fontSize: '12px', whiteSpace: 'nowrap' }}>
                    {presupuesto.moneda} {l.precio_unitario.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                  </td>
                  <td style={{ padding: '10px 12px', textAlign: 'right', fontSize: '12px', fontWeight: 600, whiteSpace: 'nowrap' }}>
                    {presupuesto.moneda} {l.precio_total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '24px' }}>
            <div style={{ width: '280px', pageBreakInside: 'avoid', breakInside: 'avoid' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #e2e8f0', fontSize: '13px' }}>
                <span style={{ color: '#64748b' }}>T. Neto:</span>
                <span style={{ fontWeight: 600 }}>{presupuesto.moneda} {presupuesto.subtotal.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #e2e8f0', fontSize: '13px' }}>
                <span style={{ color: '#64748b' }}>IVA Insc.:</span>
                <span style={{ fontWeight: 600 }}>{presupuesto.moneda} {presupuesto.iva.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', fontSize: '16px', fontWeight: 700 }}>
                <span>Total:</span>
                <span style={{ color: '#2d7d78' }}>{presupuesto.moneda} {presupuesto.total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

          {presupuesto.comentario && (
            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '16px', fontSize: '12px', color: '#64748b' }}>
              <b>COMENTARIO:</b> {presupuesto.comentario}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media print {
          aside, nav, .no-print { display: none !important; }
          main { margin-left: 0 !important; padding: 0 !important; }
          body { background: white !important; margin: 0 !important; padding: 0 !important; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        }
      `}</style>
    </>
  )
}