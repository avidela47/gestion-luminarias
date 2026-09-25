'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Printer, Trash2 } from 'lucide-react'
import { EMPRESA } from '@/lib/constants'

interface LineaRemito {
  codigo: string
  descripcion: string
  cantidad: number
  unidad: string
}

interface Remito {
  _id: string
  numero: string
  fecha: string
  razon_social: string
  numero_presupuesto: string
  numero_orden: string
  lineas: LineaRemito[]
  estado: string
  notas: string
}

const estadoColor: Record<string, string> = {
  Borrador:  'var(--text-secondary)',
  Emitido:   'var(--info)',
  Entregado: 'var(--success)',
  Cancelado: 'var(--danger)',
}

export default function VerRemitoPage() {
  const { id } = useParams()
  const router = useRouter()
  const [remito, setRemito] = useState<Remito | null>(null)
  const [loading, setLoading] = useState(true)
  const [confirmarEliminar, setConfirmarEliminar] = useState(false)

  useEffect(() => {
    fetch(`/api/remitos/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.ok) setRemito(data.data)
        setLoading(false)
      })
  }, [id])

  const eliminar = async () => {
    await fetch(`/api/remitos/${id}`, { method: 'DELETE' })
    router.push('/remitos')
  }

  if (loading) return <div style={{ padding: '32px', color: 'var(--text-muted)' }}>Cargando...</div>
  if (!remito) return <div style={{ padding: '32px', color: 'var(--danger)' }}>Remito no encontrado</div>

  return (
    <>
      {/* Barra acciones */}
      <div className="no-print" style={{
        padding: '16px 32px', borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', gap: '12px',
        backgroundColor: 'var(--card-bg)',
      }}>
        <button onClick={() => router.push('/remitos')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '4px' }}>
          <ArrowLeft size={20} />
        </button>
        <div style={{ flex: 1 }}>
          <span style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>{remito.numero}</span>
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)', marginLeft: '12px' }}>{remito.razon_social}</span>
        </div>
        <span style={{
          fontSize: '12px', fontWeight: 600, padding: '4px 12px', borderRadius: '6px',
          backgroundColor: `${estadoColor[remito.estado]}18`,
          color: estadoColor[remito.estado],
        }}>
          {remito.estado}
        </span>
        <button onClick={() => window.print()}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            backgroundColor: 'transparent', color: 'var(--text-secondary)',
            border: '1px solid var(--border)', borderRadius: '8px',
            padding: '9px 16px', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
          }}>
          <Printer size={15} /> Imprimir
        </button>
        <button onClick={() => setConfirmarEliminar(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            backgroundColor: 'transparent', color: 'var(--danger)',
            border: '1px solid var(--danger)', borderRadius: '8px',
            padding: '9px 16px', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
          }}>
          <Trash2 size={15} /> Eliminar
        </button>
      </div>

      {/* Documento imprimible */}
      <div style={{ padding: '32px', maxWidth: '900px', margin: '0 auto' }}>
        <div id="documento-imprimible" style={{
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
              <div style={{ fontSize: '18px', fontWeight: 700, color: '#1a2332' }}>REMITO</div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: '#2d7d78', marginTop: '4px' }}>{remito.numero}</div>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '8px' }}>
                Fecha: {new Date(remito.fecha).toLocaleDateString('es-AR')}
              </div>
            </div>
          </div>

          <div style={{ borderTop: '2px solid #2d7d78', marginBottom: '24px' }} />

          {/* Cliente y referencia */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', marginBottom: '6px', letterSpacing: '1px' }}>CLIENTE</div>
              <div style={{ fontWeight: 700, fontSize: '15px' }}>{remito.razon_social}</div>
            </div>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', marginBottom: '6px', letterSpacing: '1px' }}>REFERENCIA</div>
              {remito.numero_presupuesto && <div style={{ fontSize: '12px' }}>Presupuesto: <b>{remito.numero_presupuesto}</b></div>}
              {remito.numero_orden && <div style={{ fontSize: '12px' }}>Orden de trabajo: <b>{remito.numero_orden}</b></div>}
              {!remito.numero_presupuesto && !remito.numero_orden && <div style={{ fontSize: '12px', color: '#64748b' }}>—</div>}
            </div>
          </div>

          {/* Tabla de mercadería */}
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', marginBottom: '12px', letterSpacing: '1px' }}>
            DETALLE DE MERCADERÍA
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '24px' }}>
            <thead>
              <tr style={{ backgroundColor: '#0f1923', color: '#fff' }}>
                <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: '12px', fontWeight: 600 }}>Código</th>
                <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: '12px', fontWeight: 600 }}>Descripción</th>
                <th style={{ padding: '10px 12px', textAlign: 'center', fontSize: '12px', fontWeight: 600 }}>Cantidad</th>
                <th style={{ padding: '10px 12px', textAlign: 'center', fontSize: '12px', fontWeight: 600 }}>Unidad</th>
                <th style={{ padding: '10px 12px', textAlign: 'center', fontSize: '12px', fontWeight: 600 }}>Recibido ✓</th>
              </tr>
            </thead>
            <tbody>
              {remito.lineas.map((l, i) => (
                <tr key={i} style={{ backgroundColor: i % 2 === 0 ? '#f8fafc' : '#fff', borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '10px 12px', fontWeight: 600, fontSize: '12px', color: '#2d7d78' }}>{l.codigo || '—'}</td>
                  <td style={{ padding: '10px 12px', fontSize: '12px' }}>{l.descripcion}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 700, fontSize: '13px' }}>{l.cantidad}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'center', fontSize: '12px', color: '#64748b' }}>{l.unidad}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'center', fontSize: '12px' }}>□</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Notas */}
          {remito.notas && (
            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '16px', marginBottom: '24px', fontSize: '12px', color: '#64748b' }}>
              <b>NOTAS:</b> {remito.notas}
            </div>
          )}

          {/* Firma */}
          <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div style={{ fontSize: '12px', color: '#64748b' }}>
              Estado: <b>{remito.estado}</b>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ borderTop: '1px solid #1a2332', width: '200px', paddingTop: '8px', fontSize: '12px', color: '#64748b' }}>
                Firma y aclaración receptor
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal eliminar */}
      {confirmarEliminar && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 200,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            backgroundColor: 'var(--card-bg)', borderRadius: '12px',
            padding: '28px', maxWidth: '380px', width: '100%',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
              Eliminar {remito.numero}
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '24px' }}>
              ¿Confirmás que querés eliminar este remito? Esta acción no se puede deshacer.
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
          @page { size: A4 portrait; margin: 15mm; }
          #documento-imprimible { border: none !important; border-radius: 0 !important; }
        }
      `}</style>
    </>
  )
}