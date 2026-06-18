'use client'

import { useState } from 'react'
import { X, Printer } from 'lucide-react'
import type { Despacho } from './page'
import { EMPRESA } from '@/lib/constants'

interface Props {
  despacho: Despacho
  onClose: () => void
  onActualizado: () => void
}

const tipoLabel: Record<string, string> = {
  fabricada: 'Fabricada',
  comercial: 'Comercial',
  deposito: 'Depósito',
}

export default function VerDespacho({ despacho, onClose, onActualizado }: Props) {
  const [procesando, setProcesando] = useState(false)
  const [error, setError] = useState('')

  const despachar = async () => {
    setError('')
    setProcesando(true)
    const res = await fetch(`/api/despachos/${despacho._id}/despachar`, { method: 'POST' })
    const data = await res.json()
    setProcesando(false)
    if (!data.ok) return setError(data.error || (data.faltantes ? data.faltantes.join(', ') : 'Error'))
    onActualizado()
  }

  const anular = async () => {
    setError('')
    setProcesando(true)
    const res = await fetch(`/api/despachos/${despacho._id}/anular`, { method: 'POST' })
    const data = await res.json()
    setProcesando(false)
    if (!data.ok) return setError(data.error || 'Error al anular')
    onActualizado()
  }

  return (
    <>
      <div className="no-print" style={{ position: 'fixed', inset: 0, zIndex: 150, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div style={{ backgroundColor: '#fff', borderRadius: '12px', width: '100%', maxWidth: '700px', maxHeight: '90vh', overflow: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.4)' }}>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderBottom: '1px solid #e5e7eb', position: 'sticky', top: 0, backgroundColor: '#fff', zIndex: 1 }}>
            <span style={{ fontSize: '14px', fontWeight: 600, color: '#374151' }}>Despacho {despacho.numero}</span>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              {despacho.estado === 'pendiente' && (
                <button onClick={despachar} disabled={procesando}
                  style={{ padding: '7px 14px', borderRadius: '6px', fontSize: '13px', fontWeight: 600, backgroundColor: '#16a34a', color: '#fff', border: 'none', cursor: 'pointer' }}>
                  {procesando ? 'Procesando...' : 'Confirmar despacho'}
                </button>
              )}
              {despacho.estado === 'despachado' && (
                <button onClick={anular} disabled={procesando}
                  style={{ padding: '7px 14px', borderRadius: '6px', fontSize: '13px', fontWeight: 600, backgroundColor: '#dc2626', color: '#fff', border: 'none', cursor: 'pointer' }}>
                  {procesando ? 'Procesando...' : 'Anular despacho'}
                </button>
              )}
              <button onClick={() => window.print()}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px', borderRadius: '6px', fontSize: '13px', fontWeight: 600, backgroundColor: '#0f766e', color: '#fff', border: 'none', cursor: 'pointer' }}>
                <Printer size={14} /> Imprimir
              </button>
              <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}><X size={20} /></button>
            </div>
          </div>

          {error && (
            <div style={{ margin: '16px 24px', backgroundColor: '#fee2e2', color: '#dc2626', padding: '10px 14px', borderRadius: '6px', fontSize: '13px' }}>
              {error}
            </div>
          )}

          <div style={{ padding: '32px', fontFamily: 'Arial, sans-serif', fontSize: '13px', color: '#1a2332' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', paddingBottom: '16px', borderBottom: '2px solid #0f766e' }}>
              <div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: '#0f766e' }}>{EMPRESA.razon_social}</div>
                <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '2px' }}>{EMPRESA.domicilio} — {EMPRESA.localidad}</div>
                <div style={{ fontSize: '11px', color: '#6b7280' }}>Tel: {EMPRESA.telefono} — CUIT: {EMPRESA.cuit}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '18px', fontWeight: 700, color: '#111827' }}>DESPACHO</div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: '#0f766e' }}>{despacho.numero}</div>
                <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px' }}>
                  {new Date(despacho.fecha).toLocaleDateString('es-AR')}
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '24px', padding: '12px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
              <div style={{ fontSize: '10px', fontWeight: 700, color: '#6b7280', marginBottom: '4px', letterSpacing: '1px' }}>CLIENTE</div>
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#111827' }}>{despacho.razon_social}</div>
              {despacho.numero_presupuesto && (
                <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>Presupuesto: {despacho.numero_presupuesto}</div>
              )}
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '24px' }}>
              <thead>
                <tr style={{ backgroundColor: '#0f1923', color: '#fff' }}>
                  <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: '12px' }}>Código</th>
                  <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: '12px' }}>Descripción</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center', fontSize: '12px' }}>Tipo</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center', fontSize: '12px' }}>Cantidad</th>
                </tr>
              </thead>
              <tbody>
                {despacho.items.map((item, i) => (
                  <tr key={i} style={{ backgroundColor: i % 2 === 0 ? '#f8fafc' : '#fff', borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '10px 12px', fontSize: '12px', fontWeight: 600 }}>{item.codigo}</td>
                    <td style={{ padding: '10px 12px', fontSize: '12px' }}>{item.descripcion}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', fontSize: '11px', color: '#6b7280' }}>{tipoLabel[item.tipo]}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 700, fontSize: '13px' }}>{item.cantidad}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {despacho.observaciones && (
              <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '24px' }}>
                <b>Observaciones:</b> {despacho.observaciones}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', marginTop: '40px' }}>
              <div style={{ borderTop: '1px solid #374151', paddingTop: '8px', textAlign: 'center', fontSize: '12px', color: '#6b7280' }}>
                Firma recepción
              </div>
              <div style={{ borderTop: '1px solid #374151', paddingTop: '8px', textAlign: 'center', fontSize: '12px', color: '#6b7280' }}>
                Firma ITELSA
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          body > * { display: none !important; }
          .no-print { display: none !important; }
        }
      `}</style>
    </>
  )
}