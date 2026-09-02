'use client'

import { useEffect, useState } from 'react'
import { Plus, Search, Pencil, Trash2, Zap } from 'lucide-react'
import ModalSensor from './ModalSensor'

export interface SensorFuente {
  _id: string
  codigo: string
  descripcion: string
  tipo: string
  stock_actual: number
  stock_minimo: number
  precio: number
  proveedor: string
  notas: string
  activo: boolean
}

export default function SensoresPage() {
  const [items, setItems] = useState<SensorFuente[]>([])
  const [loading, setLoading] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [filtroTipo, setFiltroTipo] = useState<string>('todos')
  const [modalAbierto, setModalAbierto] = useState(false)
  const [itemEditar, setItemEditar] = useState<SensorFuente | null>(null)
  const [confirmarEliminar, setConfirmarEliminar] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/sensores')
      .then((r) => r.json())
      .then((data) => {
        if (data.ok) setItems(data.data)
        setLoading(false)
      })
  }, [])

  const cargar = () => {
    fetch('/api/sensores')
      .then((r) => r.json())
      .then((data) => { if (data.ok) setItems(data.data) })
  }

  const esEluxen = (item: SensorFuente) => item.codigo.endsWith('-EL')

  const filtrados = items.filter((i) => {
    const matchBusqueda =
      i.codigo.toLowerCase().includes(busqueda.toLowerCase()) ||
      i.descripcion.toLowerCase().includes(busqueda.toLowerCase())
    const matchTipo =
      filtroTipo === 'todos' ? true :
      filtroTipo === 'eluxen' ? esEluxen(i) :
      i.tipo === filtroTipo && !esEluxen(i)
    return matchBusqueda && matchTipo
  })

  const eliminar = async (codigo: string) => {
    await fetch(`/api/sensores/${encodeURIComponent(codigo)}`, { method: 'DELETE' })
    setConfirmarEliminar(null)
    cargar()
  }

  const btnFiltro = (label: string, valor: string, color?: string) => {
    const activo = filtroTipo === valor
    return (
      <button
        key={valor}
        onClick={() => setFiltroTipo(valor)}
        style={{
          padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 500,
          border: `1px solid ${color ?? 'var(--border)'}`,
          cursor: 'pointer',
          backgroundColor: activo ? (color ?? 'var(--primary)') : 'transparent',
          color: activo ? '#fff' : (color ?? 'var(--text-secondary)'),
          transition: 'all 0.15s',
        }}>
        {label}
      </button>
    )
  }

  return (
    <div style={{ padding: '32px', maxWidth: '1200px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)' }}>Sensores y Fuentes</h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Stock de sensores y fuentes de alimentación
          </p>
        </div>
        <button
          onClick={() => { setItemEditar(null); setModalAbierto(true) }}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            backgroundColor: 'var(--primary)', color: '#fff',
            border: 'none', borderRadius: '8px',
            padding: '9px 16px', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
          }}
        >
          <Plus size={16} /> Nuevo producto
        </button>
      </div>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative' }}>
          <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Buscar por código o descripción..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            style={{
              padding: '8px 12px 8px 32px', width: '280px',
              border: '1px solid var(--border)', borderRadius: '8px',
              fontSize: '13px', backgroundColor: 'var(--input-bg)',
              color: 'var(--text-primary)', outline: 'none',
            }}
          />
        </div>
        {btnFiltro('Todos', 'todos')}
        {btnFiltro('Sensores', 'sensor')}
        {btnFiltro('Fuentes', 'fuente')}
        {btnFiltro('ELUXEN', 'eluxen', '#7c3aed')}
        <select
          value={filtroTipo === 'todos' || filtroTipo === 'sensor' || filtroTipo === 'fuente' || filtroTipo === 'eluxen' ? filtroTipo : filtroTipo}
          onChange={(e) => setFiltroTipo(e.target.value)}
          style={{
            padding: '8px 12px', border: '1px solid var(--border)', borderRadius: '8px',
            fontSize: '13px', backgroundColor: 'var(--input-bg)',
            color: 'var(--text-primary)', outline: 'none', cursor: 'pointer',
          }}
        >
          <option value="todos">Todos los tipos</option>
          <option value="sensor">Sensor</option>
          <option value="fuente">Fuente</option>
          <option value="eluxen">ELUXEN</option>
          <option value="acoplamiento_flexible">Acoplamiento Flexible</option>
          <option value="actuador">Actuador</option>
          <option value="espejo">Espejo</option>
          <option value="iluminacion">Iluminación</option>
          <option value="interruptor_actuador">Interruptor - Actuador</option>
          <option value="modulo_seguridad">Módulo de Seguridad</option>
          <option value="soporte">Soporte</option>
        </select>
      </div>

      <div style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '10px', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Cargando...</div>
        ) : filtrados.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Zap size={32} style={{ marginBottom: '8px', opacity: 0.4 }} />
            <div>No hay productos{busqueda ? ' que coincidan' : ' cargados aún'}</div>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid var(--border)' }}>
                {['Código', 'Descripción', 'Tipo', 'Stock actual', 'Stock mínimo', 'Precio', 'Proveedor', ''].map((h) => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtrados.map((item) => {
                const bajoMinimo = item.stock_actual < item.stock_minimo
                const eluxen = esEluxen(item)
                return (
                  <tr key={item._id} style={{
                    borderBottom: '1px solid var(--border)',
                    backgroundColor: eluxen ? '#f5f3ff' : 'transparent',
                  }}>
                    <td style={{ padding: '10px 16px', fontWeight: 600, color: eluxen ? '#7c3aed' : 'var(--primary)' }}>
                      {item.codigo}
                     
                    </td>
                    <td style={{ padding: '10px 16px', color: 'var(--text-primary)' }}>{item.descripcion}</td>
                    <td style={{ padding: '10px 16px' }}>
                      <span style={{
                        fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '4px',
                        backgroundColor: eluxen ? '#ede9fe' : item.tipo === 'sensor' ? 'var(--info-bg)' : 'var(--warning-bg)',
                        color: eluxen ? '#7c3aed' : item.tipo === 'sensor' ? 'var(--info)' : 'var(--warning)',
                      }}>
                        {eluxen ? 'ELUXEN' : item.tipo === 'sensor' ? 'SENSOR' : item.tipo.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: '10px 16px', fontWeight: 600, color: bajoMinimo ? 'var(--danger)' : 'var(--success)' }}>
                      {item.stock_actual}
                      {bajoMinimo && (
                        <span style={{ marginLeft: '6px', fontSize: '10px', backgroundColor: 'var(--danger-bg)', color: 'var(--danger)', padding: '2px 6px', borderRadius: '4px' }}>
                          BAJO
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '10px 16px', color: 'var(--text-secondary)' }}>{item.stock_minimo}</td>
                    <td style={{ padding: '10px 16px', color: 'var(--text-secondary)' }}>
                      {item.precio > 0 ? `U$S ${item.precio.toLocaleString('es-AR', { minimumFractionDigits: 2 })}` : '—'}
                    </td>
                    <td style={{ padding: '10px 16px', color: 'var(--text-secondary)' }}>{item.proveedor || '—'}</td>
                    <td style={{ padding: '10px 16px' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => { setItemEditar(item); setModalAbierto(true) }} title="Editar"
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '4px' }}>
                          <Pencil size={15} />
                        </button>
                        <button onClick={() => setConfirmarEliminar(item.codigo)} title="Eliminar"
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)', padding: '4px' }}>
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {modalAbierto && (
        <ModalSensor
          item={itemEditar}
          onClose={() => setModalAbierto(false)}
          onGuardado={() => { setModalAbierto(false); cargar() }}
        />
      )}

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
              Eliminar producto
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '24px' }}>
              ¿Confirmás que querés eliminar <b>{confirmarEliminar}</b>? Esta acción no se puede deshacer.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button onClick={() => setConfirmarEliminar(null)}
                style={{
                  padding: '8px 16px', borderRadius: '6px', fontSize: '13px',
                  border: '1px solid var(--border)', backgroundColor: 'transparent',
                  color: 'var(--text-secondary)', cursor: 'pointer',
                }}>
                Cancelar
              </button>
              <button onClick={() => eliminar(confirmarEliminar)}
                style={{
                  padding: '8px 20px', borderRadius: '6px', fontSize: '13px', fontWeight: 600,
                  border: 'none', backgroundColor: 'var(--danger)', color: '#fff', cursor: 'pointer',
                }}>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}