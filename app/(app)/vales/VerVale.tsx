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

  return (
    <>
      <div className="no-print" style={{ position: 'fixed', inset: 0, zIndex: 100, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div style={{ backgroundColor: '#fff', borderRadius: '12px', width: '100%', maxWidth: '700px', maxHeight: '90vh', overflow: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.4)' }}>

          {/* Toolbar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderBottom: '1px solid #e5e7eb', position: 'sticky', top: 0, backgroundColor: '#fff', zIndex: 1 }}>
            <span style={{ fontSize: '14px', fontWeight: 600, color: '#374151' }}>Vale {vale.numero}</span>
            <div style={{ display: 'flex', gap: '10px' }}>
              {vale.estado !== 'cerrado' && (
                <button onClick={() => setModalDevolucion(true)}
                  style={{ padding: '7px 14px', borderRadius: '6px', fontSize: '13px', fontWeight: 600, backgroundColor: '#f59e0b', color: '#fff', border: 'none', cursor: 'pointer' }}>
                  Registrar devolución
                </button>
              )}
              <button onClick={() => window.print()}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px', borderRadius: '6px', fontSize: '13px', fontWeight: 600, backgroundColor: '#0f766e', color: '#fff', border: 'none', cursor: 'pointer' }}>
                <Printer size={14} /> Imprimir
              </button>
              <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}><X size={20} /></button>
            </div>
          </div>

          {/* Contenido */}
          <div style={{ padding: '32px', fontFamily: 'Arial, sans-serif', fontSize: '13px', color: '#1a2332' }}>
            {/* Header */}
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

            {/* Datos */}
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

            {/* Tabla ítems */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '24px' }}>
              <thead>
                <tr style={{ backgroundColor: '#0f1923', color: '#fff' }}>
                  <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: '12px' }}>Descripción</th>
                  <th style={{ padding: '8px 12px', textAlign: 'center', fontSize: '12px' }}>Tipo</th>
                  <th style={{ padding: '8px 12px', textAlign: 'center', fontSize: '12px' }}>Cant. salida</th>
                  <th style={{ padding: '8px 12px', textAlign: 'center', fontSize: '12px' }}>Cant. devuelta</th>
                  <th style={{ padding: '8px 12px', textAlign: 'center', fontSize: '12px' }}>Diferencia</th>
                </tr>
              </thead>
              <tbody>
                {vale.items.map((item, i) => {
                  const diff = item.cantidad_salida - item.cantidad_devuelta
                  return (
                    <tr key={i} style={{ backgroundColor: i % 2 === 0 ? '#f8fafc' : '#fff', borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '8px 12px', fontSize: '13px' }}>{item.descripcion}</td>
                      <td style={{ padding: '8px 12px', textAlign: 'center', fontSize: '12px', color: '#6b7280' }}>{tipoLabel[item.tipo]}</td>
                      <td style={{ padding: '8px 12px', textAlign: 'center', fontWeight: 600 }}>{item.cantidad_salida}</td>
                      <td style={{ padding: '8px 12px', textAlign: 'center', color: item.cantidad_devuelta > 0 ? '#16a34a' : '#6b7280' }}>{item.cantidad_devuelta}</td>
                      <td style={{ padding: '8px 12px', textAlign: 'center', fontWeight: 700, color: diff > 0 ? '#dc2626' : '#16a34a' }}>
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

            {/* Firmas */}
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

      <style>{`
        @media print {
          body > * { display: none !important; }
          .no-print { display: none !important; }
        }
      `}</style>
    </>
  )
}