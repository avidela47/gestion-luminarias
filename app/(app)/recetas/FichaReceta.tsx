'use client'

import { useEffect, useState } from 'react'
import { X, Printer } from 'lucide-react'
import Image from 'next/image'
import type { Receta } from './page'

interface ComponenteDetalle {
  id_componente: string
  nombre: string
  unidad: string
  foto: string
}

interface Props {
  receta: Receta
  onClose: () => void
}

export default function FichaReceta({ receta, onClose }: Props) {
  const [componentes, setComponentes] = useState<ComponenteDetalle[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/componentes')
      .then((r) => r.json())
      .then((data) => {
        if (data.ok) setComponentes(data.data)
        setLoading(false)
      })
  }, [])

  const imprimir = () => window.print()

  const filaComponentes = receta.componentes.map((c) => {
    const detalle = componentes.find((d) => d.id_componente === c.id_componente)
    return { ...c, detalle }
  })

  return (
    <>
      {/* Overlay — oculto al imprimir */}
      <div
        className="print:hidden"
        style={{
          position: 'fixed', inset: 0, zIndex: 200,
          backgroundColor: 'rgba(0,0,0,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '24px',
        }}
      >
        <div style={{
          backgroundColor: '#fff', borderRadius: '12px',
          width: '100%', maxWidth: '860px', maxHeight: '90vh',
          overflow: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
        }}>
          {/* Toolbar */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '16px 24px', borderBottom: '1px solid #e5e7eb',
            position: 'sticky', top: 0, backgroundColor: '#fff', zIndex: 1,
          }}>
            <span style={{ fontSize: '14px', fontWeight: 600, color: '#374151' }}>
              Ficha técnica — {receta.codigo}
            </span>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={imprimir}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '7px 14px', borderRadius: '6px', fontSize: '13px', fontWeight: 600,
                  backgroundColor: '#0f766e', color: '#fff', border: 'none', cursor: 'pointer',
                }}
              >
                <Printer size={14} /> Imprimir
              </button>
              <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}>
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Ficha */}
          <div id="ficha-print" style={{ padding: '32px' }}>
            <FichaContenido
              receta={receta}
              filaComponentes={filaComponentes}
              loading={loading}
            />
          </div>
        </div>
      </div>

      {/* Vista de impresión */}
      <div className="hidden print:block" style={{ padding: '24px' }}>
        <FichaContenido
          receta={receta}
          filaComponentes={filaComponentes}
          loading={loading}
        />
      </div>

      <style>{`
        @media print {
          body > * { display: none !important; }
          .print\\:block { display: block !important; }
        }
      `}</style>
    </>
  )
}

function FichaContenido({
  receta,
  filaComponentes,
  loading,
}: {
  receta: Receta
  filaComponentes: { id_componente: string; cantidad: number; detalle?: { nombre: string; unidad: string; foto: string } }[]
  loading: boolean
}) {
  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', color: '#111827' }}>

      {/* Header empresa */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
        marginBottom: '24px', paddingBottom: '16px', borderBottom: '2px solid #0f766e',
      }}>
        <div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#0f766e' }}>ITELSA SAS</div>
          <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>Smart Lighting</div>
        </div>
        <div style={{ textAlign: 'right', fontSize: '12px', color: '#6b7280' }}>
          <div>Ficha técnica de armado</div>
          <div style={{ fontWeight: 700, color: '#111827', fontSize: '14px', marginTop: '2px' }}>
            v{receta.version} — {new Date(receta.fecha_version).toLocaleDateString('es-AR')}
          </div>
        </div>
      </div>

      {/* Info receta */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr auto',
        gap: '24px', marginBottom: '28px', alignItems: 'start',
      }}>
        <div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#111827', marginBottom: '4px' }}>
            {receta.codigo}
          </div>
          <div style={{ fontSize: '15px', color: '#374151', marginBottom: '12px' }}>
            {receta.nombre}
          </div>
          {receta.notas && (
            <div style={{
              fontSize: '12px', color: '#6b7280', backgroundColor: '#f9fafb',
              padding: '8px 12px', borderRadius: '6px', borderLeft: '3px solid #0f766e',
            }}>
              {receta.notas}
            </div>
          )}
        </div>
      </div>

      {/* Grilla componentes */}
      <div style={{ marginBottom: '8px', fontSize: '11px', fontWeight: 700, color: '#6b7280', letterSpacing: '0.05em' }}>
        COMPONENTES NECESARIOS — {receta.componentes.length} {receta.componentes.length === 1 ? 'ÍTEM' : 'ÍTEMS'}
      </div>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#9ca3af' }}>Cargando componentes...</div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
          gap: '12px',
        }}>
          {filaComponentes.map((c, i) => (
            <div key={i} style={{
              border: '1px solid #e5e7eb', borderRadius: '8px',
              overflow: 'hidden', backgroundColor: '#fff',
              boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            }}>
              {/* Foto */}
              <div style={{
                width: '100%', height: '140px', backgroundColor: '#f3f4f6',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                position: 'relative', overflow: 'hidden',
              }}>
                {c.detalle?.foto ? (
                  <Image
                    src={c.detalle.foto}
                    alt={c.detalle.nombre}
                    fill
                    style={{ objectFit: 'cover' }}
                    sizes="200px"
                  />
                ) : (
                  <div style={{ fontSize: '32px', color: '#d1d5db' }}>📦</div>
                )}
              </div>

              {/* Info */}
              <div style={{ padding: '10px 12px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#0f766e', marginBottom: '2px' }}>
                  {c.id_componente}
                </div>
                <div style={{ fontSize: '12px', color: '#374151', marginBottom: '6px', lineHeight: 1.3 }}>
                  {c.detalle?.nombre ?? '—'}
                </div>
                <div style={{
                  display: 'inline-block',
                  fontSize: '13px', fontWeight: 800, color: '#111827',
                  backgroundColor: '#f0fdf4', padding: '2px 8px',
                  borderRadius: '4px', border: '1px solid #bbf7d0',
                }}>
                  x{c.cantidad} {c.detalle?.unidad ?? ''}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      <div style={{
        marginTop: '32px', paddingTop: '12px', borderTop: '1px solid #e5e7eb',
        fontSize: '11px', color: '#9ca3af', textAlign: 'center',
      }}>
        ITELSA SAS — {new Date().toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' })}
      </div>
    </div>
  )
}