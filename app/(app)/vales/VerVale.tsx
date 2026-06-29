'use client'

import { useState } from 'react'
import { X, Printer } from 'lucide-react'
import type { Vale } from './page'
import { EMPRESA } from '@/lib/constants'
import ModalDevolucion from './ModalDevolucion'

interface Props {
  vale: Vale
  onClose: () => void
  onDevolucion: () => void
}

const tipoLabel = { stock: 'Stock', herramienta: 'Herramienta', otro: 'Otro' }

export default function VerVale({ vale, onClose, onDevolucion }: Props) {
  const [modalDevolucion, setModalDevolucion] = useState(false)

  const imprimir = () => {
    const contenido = document.getElementById('vale-print')?.innerHTML
    if (!contenido) return
    const ventana = window.open('', '_blank')
    if (!ventana) return
    ventana.document.write(`
      <html><head><title>Vale ${vale.numero}</title>
      <style>
        body { font-family: Arial, sans-serif; font-size: 13px; color: #1a2332; padding: 32px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
        th { background: #0f1923; color: #fff; padding: 8px 12px; text-align: left; font-size: 12px; }
        td { padding: 8px 12px; border-bottom: 1px solid #e2e8f0; }
        tr:nth-child(even) { background: #f8fafc; }
      </style>
      </head><body>${contenido}</body></html>
    `)
    ventana.document.close()
    ventana.print()
  }

  return (
    <>
      <div style={{ position: 'fixed', inset: 0, zIndex: 100, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div style={{ backgroundColor: '#fff', borderRadius: '12px', width: '100%', maxWidth: '700px', maxHeight: '90vh', overflow: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.4)' }}>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderBottom: '1px solid #e5e7eb', position: 'sticky', top: 0, backgroundColor: '#fff', zIndex: 1 }}>
            <span style={{ fontSize: '14px', fontWeight: 600, color: '#374151' }}>Vale {vale.numero}</span>
            <div style={{ display: 'flex', gap: '10px' }}>
              {vale.estado !== 'cerrado' && (
                <button onClick={() => setModalDevolucion(true)}
                  style={{ padding: '7px 14px', borderRadius: '6px', fontSize: '13px', fontWeight: 600, backgroundColor: '#f59e0b', color: '#fff', border: 'none', cursor: 'pointer' }}>
                  Registrar devolución
                </button>
              )}
              <button onClick={imprimir}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px', borderRadius: '6px', fontSize: '13px', fontWeight: 600, backgroundColor: '#0f766e', color: '#fff', border: 'none', cursor: 'pointer' }}>
                <Printer size={14} /> Imprimir
              </button>
              <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}><X size={20} /></button>
            </div>
          </div>

          <div id="vale-print" style={{ padding: '32px', fontFamily: 'Arial, sans-serif', fontSize: '13px', color: '#1a2332' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', paddingBottom: '16px', borderBottom: '2px solid #0f766e' }}>
              <div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: '#0f766e' }}>{EMPRESA.razon_social}</div>
                <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '2px' }}>Smart Lighting</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '16px', fontWeight: 700, color: '#111827' }}>VALE INTERNO</div>
                <div style={{ fontSize: '18px', fontWeight: 800, color: '#0f766e' }}>{vale.numero}</div>
                <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px' }}>
                  {new Date(vale.fecha_salida).toLocaleDateString('es-AR')}
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
              <div style={{ padding: '12px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
                <div style={{ fontSize: '10px', fontWeight: 700, color: '#6b7280', marginBottom: '4px', letterSpacing: '1px' }}>RESPONSABLE</div>
                <div style={{ fontSize: '15px', fontWeight: 700, color: '#111827' }}>{vale.responsable}</div>
              </div>
              <div style={{ padding: '12px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
                <div style={{ fontSize: '10px', fontWeight: 700, color: '#6b7280', marginBottom: '4px', letterSpacing: '1px' }}>EMITIDO POR</div>
                <div style={{ fontSize: '15px', fontWeight: 700, color: '#111827' }}>{vale.emitido_por}</div>
              </div>
            </div>

            <table>
              <thead>
                <tr>
                  <th>Descripción</th>
                  <th style={{ textAlign: 'center' }}>Tipo</th>
                  <th style={{ textAlign: 'center' }}>Cant. salida</th>
                  <th style={{ textAlign: 'center' }}>Cant. devuelta</th>
                  <th style={{ textAlign: 'center' }}>Diferencia</th>
                </tr>
              </thead>
              <tbody>
                {vale.items.map((item, i) => {
                  const diff = item.cantidad_salida - item.cantidad_devuelta
                  return (
                    <tr key={i}>
                      <td>{item.descripcion}</td>
                      <td style={{ textAlign: 'center', color: '#6b7280' }}>{tipoLabel[item.tipo]}</td>
                      <td style={{ textAlign: 'center', fontWeight: 600 }}>{item.cantidad_salida}</td>
                      <td style={{ textAlign: 'center', color: item.cantidad_devuelta > 0 ? '#16a34a' : '#6b7280' }}>{item.cantidad_devuelta}</td>
                      <td style={{ textAlign: 'center', fontWeight: 700, color: diff > 0 ? '#dc2626' : '#16a34a' }}>
                        {diff > 0 ? `-${diff}` : '✓'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            {vale.observaciones_salida && (
              <div style={{ marginBottom: '16px', fontSize: '12px', color: '#6b7280' }}>
                <b>Observaciones salida:</b> {vale.observaciones_salida}
              </div>
            )}
            {vale.observaciones_devolucion && (
              <div style={{ marginBottom: '16px', fontSize: '12px', color: '#6b7280' }}>
                <b>Observaciones devolución:</b> {vale.observaciones_devolucion}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', marginTop: '40px' }}>
              <div style={{ borderTop: '1px solid #374151', paddingTop: '8px', textAlign: 'center', fontSize: '12px', color: '#6b7280' }}>
                Firma responsable — {vale.responsable}
              </div>
              <div style={{ borderTop: '1px solid #374151', paddingTop: '8px', textAlign: 'center', fontSize: '12px', color: '#6b7280' }}>
                Firma emisor — {vale.emitido_por}
              </div>
            </div>
          </div>
        </div>
      </div>

      {modalDevolucion && (
        <ModalDevolucion
          vale={vale}
          onClose={() => setModalDevolucion(false)}
          onGuardado={() => { setModalDevolucion(false); onDevolucion() }}
        />
      )}
    </>
  )
}