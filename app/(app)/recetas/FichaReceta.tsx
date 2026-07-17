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

  const filaComponentes = receta.componentes.map((c) => {
    const detalle = componentes.find((d) => d.id_componente === c.id_componente)
    return { ...c, detalle }
  })

  const imprimir = () => {
    const tarjetas = filaComponentes.map((c) => `
      <div style="border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;background:#fff;break-inside:avoid;">
        <div style="width:100%;height:130px;background:#f3f4f6;display:flex;align-items:center;justify-content:center;overflow:hidden;">
          ${c.detalle?.foto
            ? `<img src="${c.detalle.foto}" style="width:100%;height:130px;object-fit:cover;" />`
            : `<span style="font-size:28px;">📦</span>`
          }
        </div>
        <div style="padding:8px 10px;">
          <div style="font-size:10px;font-weight:700;color:#0f766e;margin-bottom:2px;">${c.id_componente}</div>
          <div style="font-size:11px;color:#374151;margin-bottom:4px;line-height:1.3;">${c.detalle?.nombre ?? '—'}</div>
          <div style="display:inline-block;font-size:12px;font-weight:800;color:#111827;background:#f0fdf4;padding:2px 6px;border-radius:4px;border:1px solid #bbf7d0;">
            x${c.cantidad} ${c.detalle?.unidad ?? ''}
          </div>
        </div>
      </div>
    `).join('')

    const ventana = window.open('', '_blank')
    if (!ventana) return
    ventana.document.write(`
      <html>
      <head>
        <title>Ficha ${receta.codigo}</title>
        <style>
          @page { size: A4 landscape; margin: 12mm; }
          body { font-family: Arial, sans-serif; color: #111827; margin: 0; padding: 0; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; padding-bottom: 12px; border-bottom: 2px solid #0f766e; }
          .grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div style="font-size:18px;font-weight:800;color:#0f766e;">ITELSA SAS</div>
            <div style="font-size:11px;color:#6b7280;">Smart Lighting</div>
          </div>
          <div style="text-align:center;">
            <div style="font-size:16px;font-weight:800;color:#111827;">${receta.codigo}</div>
            <div style="font-size:13px;color:#374151;">${receta.nombre}</div>
          </div>
          <div style="text-align:right;font-size:11px;color:#6b7280;">
            <div>Ficha técnica de armado</div>
            <div style="font-weight:700;color:#111827;">v${receta.version} — ${new Date(receta.fecha_version).toLocaleDateString('es-AR')}</div>
            <div style="margin-top:4px;font-size:10px;">${receta.componentes.length} componente${receta.componentes.length !== 1 ? 's' : ''}</div>
          </div>
        </div>
        <div class="grid">${tarjetas}</div>
        <div style="margin-top:16px;padding-top:8px;border-top:1px solid #e5e7eb;font-size:10px;color:#9ca3af;text-align:center;">
          ITELSA SAS — ${new Date().toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' })}
        </div>
      </body>
      </html>
    `)
    ventana.document.close()
    ventana.print()
  }

  return (
    <>
      <div style={{ position: 'fixed', inset: 0, zIndex: 200, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div style={{ backgroundColor: '#fff', borderRadius: '12px', width: '100%', maxWidth: '860px', maxHeight: '90vh', overflow: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.4)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderBottom: '1px solid #e5e7eb', position: 'sticky', top: 0, backgroundColor: '#fff', zIndex: 1 }}>
            <span style={{ fontSize: '14px', fontWeight: 600, color: '#374151' }}>Ficha técnica — {receta.codigo}</span>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={imprimir} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px', borderRadius: '6px', fontSize: '13px', fontWeight: 600, backgroundColor: '#0f766e', color: '#fff', border: 'none', cursor: 'pointer' }}>
                <Printer size={14} /> Imprimir
              </button>
              <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}>
                <X size={20} />
              </button>
            </div>
          </div>

          <div style={{ padding: '32px', fontFamily: 'system-ui, sans-serif', color: '#111827' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', paddingBottom: '16px', borderBottom: '2px solid #0f766e' }}>
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

            <div style={{ marginBottom: '28px' }}>
              <div style={{ fontSize: '22px', fontWeight: 800, color: '#111827', marginBottom: '4px' }}>{receta.codigo}</div>
              <div style={{ fontSize: '15px', color: '#374151', marginBottom: '12px' }}>{receta.nombre}</div>
              {receta.notas && (
                <div style={{ fontSize: '12px', color: '#6b7280', backgroundColor: '#f9fafb', padding: '8px 12px', borderRadius: '6px', borderLeft: '3px solid #0f766e' }}>
                  {receta.notas}
                </div>
              )}
            </div>

            <div style={{ marginBottom: '8px', fontSize: '11px', fontWeight: 700, color: '#6b7280', letterSpacing: '0.05em' }}>
              COMPONENTES NECESARIOS — {receta.componentes.length} {receta.componentes.length === 1 ? 'ÍTEM' : 'ÍTEMS'}
            </div>

            {loading ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#9ca3af' }}>Cargando componentes...</div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px' }}>
                {filaComponentes.map((c, i) => (
                  <div key={i} style={{ border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                    <div style={{ width: '100%', height: '140px', backgroundColor: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
                      {c.detalle?.foto ? (
                        <Image src={c.detalle.foto} alt={c.detalle.nombre} fill style={{ objectFit: 'cover' }} sizes="200px" />
                      ) : (
                        <div style={{ fontSize: '32px', color: '#d1d5db' }}>📦</div>
                      )}
                    </div>
                    <div style={{ padding: '10px 12px' }}>
                      <div style={{ fontSize: '11px', fontWeight: 700, color: '#0f766e', marginBottom: '2px' }}>{c.id_componente}</div>
                      <div style={{ fontSize: '12px', color: '#374151', marginBottom: '6px', lineHeight: 1.3 }}>{c.detalle?.nombre ?? '—'}</div>
                      <div style={{ display: 'inline-block', fontSize: '13px', fontWeight: 800, color: '#111827', backgroundColor: '#f0fdf4', padding: '2px 8px', borderRadius: '4px', border: '1px solid #bbf7d0' }}>
                        x{c.cantidad} {c.detalle?.unidad ?? ''}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div style={{ marginTop: '32px', paddingTop: '12px', borderTop: '1px solid #e5e7eb', fontSize: '11px', color: '#9ca3af', textAlign: 'center' }}>
              ITELSA SAS — {new Date().toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' })}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}