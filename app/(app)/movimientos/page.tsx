'use client'

import { useEffect, useState } from 'react'
import { ArrowDownCircle, ArrowUpCircle, SlidersHorizontal, Plus } from 'lucide-react'
import ModalMovimiento from './ModalMovimiento'

export interface Movimiento {
  _id: string
  id_movimiento: string
  tipo: string
  id_componente: string
  cantidad: number
  stock_resultante: number
  referencia: string
  notas: string
  usuario: string
  createdAt: string
}

const tipoLabel: Record<string, { label: string; color: string; bg: string; icono: 'entrada' | 'salida' }> = {
  entrada_compra:        { label: 'Compra',          color: 'var(--success)', bg: 'var(--success-bg)', icono: 'entrada' },
  salida_produccion:     { label: 'Producción',      color: 'var(--secondary)', bg: 'var(--info-bg)', icono: 'salida' },
  ajuste_manual_entrada: { label: 'Ajuste entrada',  color: 'var(--success)', bg: 'var(--success-bg)', icono: 'entrada' },
  ajuste_manual_salida:  { label: 'Ajuste salida',   color: 'var(--danger)', bg: 'var(--danger-bg)', icono: 'salida' },
}

export default function MovimientosPage() {
  const [movimientos, setMovimientos] = useState<Movimiento[]>([])
  const [loading, setLoading] = useState(true)
  const [filtroTipo, setFiltroTipo] = useState('')
  const [filtroComponente, setFiltroComponente] = useState('')
  const [modalAbierto, setModalAbierto] = useState(false)

  useEffect(() => {
    fetch('/api/movimientos')
      .then((r) => r.json())
      .then((data) => {
        if (data.ok) setMovimientos(data.data)
        setLoading(false)
      })
  }, [])

  const cargarMovimientos = () => {
    fetch('/api/movimientos')
      .then((r) => r.json())
      .then((data) => { if (data.ok) setMovimientos(data.data) })
  }

  const filtrados = movimientos.filter((m) => {
    const matchTipo = filtroTipo ? m.tipo === filtroTipo : true
    const matchComp = filtroComponente
      ? m.id_componente.toLowerCase().includes(filtroComponente.toLowerCase())
      : true
    return matchTipo && matchComp
  })

  return (
    <div style={{ padding: '32px', maxWidth: '1200px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)' }}>
            Movimientos
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Historial completo de entradas y salidas de stock
          </p>
        </div>
        <button
          onClick={() => setModalAbierto(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            backgroundColor: 'var(--primary)', color: '#fff',
            border: 'none', borderRadius: '8px',
            padding: '9px 16px', fontSize: '13px', fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          <Plus size={16} />
          Registrar entrada
        </button>
      </div>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
        <div style={{ position: 'relative' }}>
          <SlidersHorizontal size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <select
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
            style={{
              padding: '8px 12px 8px 30px',
              border: '1px solid var(--border)', borderRadius: '8px',
              fontSize: '13px', backgroundColor: 'var(--input-bg)',
              color: 'var(--text-primary)', outline: 'none', cursor: 'pointer',
            }}
          >
            <option value="">Todos los tipos</option>
            <option value="entrada_compra">Compra</option>
            <option value="salida_produccion">Producción</option>
            <option value="ajuste_manual_entrada">Ajuste entrada</option>
            <option value="ajuste_manual_salida">Ajuste salida</option>
          </select>
        </div>
        <input
          type="text"
          placeholder="Filtrar por componente..."
          value={filtroComponente}
          onChange={(e) => setFiltroComponente(e.target.value)}
          style={{
            padding: '8px 12px',
            border: '1px solid var(--border)', borderRadius: '8px',
            fontSize: '13px', backgroundColor: 'var(--input-bg)',
            color: 'var(--text-primary)', outline: 'none', width: '220px',
          }}
        />
      </div>

      {/* Tabla */}
      <div style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '10px', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Cargando...</div>
        ) : filtrados.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No hay movimientos registrados
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid var(--border)' }}>
                {['Tipo', 'Componente', 'Cantidad', 'Stock resultante', 'Referencia', 'Notas', 'Usuario', 'Fecha'].map((h) => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtrados.map((m) => {
                const tipo = tipoLabel[m.tipo] ?? { label: m.tipo, color: 'var(--text-secondary)', bg: '#f1f5f9', icono: 'entrada' as const }
                const esEntrada = tipo.icono === 'entrada'
                return (
                  <tr key={m._id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '10px 16px' }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: '6px',
                        fontSize: '11px', fontWeight: 600, padding: '3px 8px', borderRadius: '4px',
                        backgroundColor: tipo.bg, color: tipo.color,
                      }}>
                        {esEntrada ? <ArrowDownCircle size={12} /> : <ArrowUpCircle size={12} />}
                        {tipo.label}
                      </span>
                    </td>
                    <td style={{ padding: '10px 16px', fontWeight: 600, color: 'var(--primary)' }}>{m.id_componente}</td>
                    <td style={{ padding: '10px 16px', fontWeight: 700, color: esEntrada ? 'var(--success)' : 'var(--danger)' }}>
                      {esEntrada ? '+' : ''}{m.cantidad}
                    </td>
                    <td style={{ padding: '10px 16px', color: 'var(--text-secondary)' }}>{m.stock_resultante}</td>
                    <td style={{ padding: '10px 16px', color: 'var(--text-secondary)' }}>{m.referencia || '—'}</td>
                    <td style={{ padding: '10px 16px', color: 'var(--text-secondary)' }}>{m.notas || '—'}</td>
                    <td style={{ padding: '10px 16px', color: 'var(--text-secondary)' }}>{m.usuario}</td>
                    <td style={{ padding: '10px 16px', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                      {new Date(m.createdAt).toLocaleDateString('es-AR')}
                      {' '}
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        {new Date(m.createdAt).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {modalAbierto && (
        <ModalMovimiento
          onClose={() => setModalAbierto(false)}
          onGuardado={() => { setModalAbierto(false); cargarMovimientos() }}
        />
      )}
    </div>
  )
}