'use client'

import { useEffect, useState } from 'react'
import { Plus, Search, Pencil, Trash2, HardHat, ArrowDownCircle, ArrowUpCircle, RotateCcw } from 'lucide-react'
import ModalMaterial from './ModalMaterial'
import ModalMovimiento from './ModalMovimiento'

export interface Material {
  _id: string
  codigo: string
  descripcion: string
  imagen: string
  stock_actual: number
  stock_minimo: number
  precio_unitario: number
  unidad: string
  notas: string
  activo: boolean
}

export interface MovimientoMaterial {
  _id: string
  tipo: 'entrada' | 'salida' | 'devolucion'
  codigo_material: string
  descripcion_material: string
  cantidad: number
  stock_resultante: number
  precio_unitario: number
  numero_orden: string
  notas: string
  createdAt: string
}

export default function MaterialesPage() {
  const [materiales, setMateriales] = useState<Material[]>([])
  const [loading, setLoading] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [modalMaterial, setModalMaterial] = useState(false)
  const [materialEditar, setMaterialEditar] = useState<Material | null>(null)
  const [modalMovimiento, setModalMovimiento] = useState(false)
  const [materialSeleccionado, setMaterialSeleccionado] = useState<Material | null>(null)
  const [tipoMovimiento, setTipoMovimiento] = useState<'entrada' | 'salida' | 'devolucion'>('entrada')
  const [confirmarEliminar, setConfirmarEliminar] = useState<string | null>(null)
  const [historial, setHistorial] = useState<{ [id: string]: MovimientoMaterial[] }>({})
  const [expandido, setExpandido] = useState<string | null>(null)

  const cargar = () => {
    fetch('/api/materiales')
      .then((r) => r.json())
      .then((data) => {
        if (data.ok) setMateriales(data.data)
        setLoading(false)
      })
  }

  useEffect(() => { cargar() }, [])

  const filtrados = materiales.filter((m) =>
    m.codigo.toLowerCase().includes(busqueda.toLowerCase()) ||
    m.descripcion.toLowerCase().includes(busqueda.toLowerCase())
  )

  const eliminar = async (id: string) => {
    await fetch(`/api/materiales/${id}`, { method: 'DELETE' })
    setConfirmarEliminar(null)
    cargar()
  }

  const abrirHistorial = async (material: Material) => {
    if (expandido === material._id) {
      setExpandido(null)
      return
    }
    setExpandido(material._id)
    if (!historial[material._id]) {
      const res = await fetch(`/api/materiales/${material._id}/movimiento`)
      const data = await res.json()
      if (data.ok) setHistorial((prev) => ({ ...prev, [material._id]: data.data }))
    }
  }

  const abrirMovimiento = (material: Material, tipo: 'entrada' | 'salida' | 'devolucion') => {
    setMaterialSeleccionado(material)
    setTipoMovimiento(tipo)
    setModalMovimiento(true)
  }

  const tipoConfig = {
    entrada: { label: 'Entrada', color: 'var(--success)', bg: 'var(--success-bg)', icon: ArrowDownCircle },
    salida: { label: 'Salida', color: 'var(--danger)', bg: 'var(--danger-bg)', icon: ArrowUpCircle },
    devolucion: { label: 'Devolución', color: 'var(--info)', bg: 'var(--info-bg)', icon: RotateCcw },
  }

  return (
    <div style={{ padding: '32px', maxWidth: '1200px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)' }}>Materiales de Obra</h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Stock de materiales con trazabilidad por Orden de Trabajo
          </p>
        </div>
        <button
          onClick={() => { setMaterialEditar(null); setModalMaterial(true) }}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            backgroundColor: 'var(--primary)', color: '#fff',
            border: 'none', borderRadius: '8px',
            padding: '9px 16px', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
          }}
        >
          <Plus size={16} /> Nuevo material
        </button>
      </div>

      <div style={{ position: 'relative', marginBottom: '16px', maxWidth: '360px' }}>
        <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input
          type="text"
          placeholder="Buscar por código o descripción..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          style={{
            width: '100%', padding: '8px 12px 8px 32px',
            border: '1px solid var(--border)', borderRadius: '8px',
            fontSize: '13px', backgroundColor: 'var(--input-bg)',
            color: 'var(--text-primary)', outline: 'none',
          }}
        />
      </div>

      <div style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '10px', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Cargando...</div>
        ) : filtrados.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <HardHat size={32} style={{ marginBottom: '8px', opacity: 0.4 }} />
            <div>No hay materiales{busqueda ? ' que coincidan' : ' cargados aún'}</div>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid var(--border)' }}>
                {['Código', 'Descripción', 'Unidad', 'Stock actual', 'Stock mínimo', 'Precio unit.', 'Acciones', ''].map((h) => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtrados.map((m) => {
                const bajoMinimo = m.stock_actual <= m.stock_minimo && m.stock_minimo > 0
                const sinStock = m.stock_actual === 0
                return (
                  <>
                    <tr key={m._id} style={{ borderBottom: expandido === m._id ? 'none' : '1px solid var(--border)' }}>
                      <td style={{ padding: '10px 16px', fontWeight: 600, color: 'var(--primary)' }}>{m.codigo}</td>
                      <td style={{ padding: '10px 16px', color: 'var(--text-primary)' }}>{m.descripcion}</td>
                      <td style={{ padding: '10px 16px', color: 'var(--text-secondary)' }}>{m.unidad}</td>
                      <td style={{ padding: '10px 16px', fontWeight: 600, color: sinStock ? 'var(--danger)' : bajoMinimo ? 'var(--warning)' : 'var(--success)' }}>
                        {m.stock_actual}
                        {sinStock && <span style={{ marginLeft: '6px', fontSize: '10px', backgroundColor: 'var(--danger-bg)', color: 'var(--danger)', padding: '2px 6px', borderRadius: '4px' }}>SIN STOCK</span>}
                        {!sinStock && bajoMinimo && <span style={{ marginLeft: '6px', fontSize: '10px', backgroundColor: 'var(--warning-bg)', color: 'var(--warning)', padding: '2px 6px', borderRadius: '4px' }}>BAJO</span>}
                      </td>
                      <td style={{ padding: '10px 16px', color: 'var(--text-secondary)' }}>{m.stock_minimo}</td>
                      <td style={{ padding: '10px 16px', color: 'var(--text-secondary)' }}>
                        {m.precio_unitario > 0 ? `U$S ${m.precio_unitario.toLocaleString('es-AR', { minimumFractionDigits: 2 })}` : '—'}
                      </td>
                      <td style={{ padding: '10px 16px' }}>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button onClick={() => abrirMovimiento(m, 'entrada')} title="Entrada"
                            style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--success)', backgroundColor: 'var(--success-bg)', color: 'var(--success)', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}>
                            <ArrowDownCircle size={12} /> Entrada
                          </button>
                          <button onClick={() => abrirMovimiento(m, 'salida')} title="Salida"
                            style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--danger)', backgroundColor: 'var(--danger-bg)', color: 'var(--danger)', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}>
                            <ArrowUpCircle size={12} /> Salida
                          </button>
                          <button onClick={() => abrirMovimiento(m, 'devolucion')} title="Devolución"
                            style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--info)', backgroundColor: 'var(--info-bg)', color: 'var(--info)', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}>
                            <RotateCcw size={12} /> Dev.
                          </button>
                        </div>
                      </td>
                      <td style={{ padding: '10px 16px' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button onClick={() => abrirHistorial(m)} title="Ver historial"
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '11px', fontWeight: 600, padding: '4px' }}>
                            {expandido === m._id ? '▲ Historial' : '▼ Historial'}
                          </button>
                          <button onClick={() => { setMaterialEditar(m); setModalMaterial(true) }} title="Editar"
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '4px' }}>
                            <Pencil size={15} />
                          </button>
                          <button onClick={() => setConfirmarEliminar(m._id)} title="Eliminar"
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)', padding: '4px' }}>
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {expandido === m._id && (
                      <tr key={`${m._id}-historial`}>
                        <td colSpan={8} style={{ padding: '0 16px 16px', backgroundColor: '#f8fafc' }}>
                          <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px', paddingTop: '12px' }}>
                            HISTORIAL DE MOVIMIENTOS
                          </div>
                          {!historial[m._id] ? (
                            <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Cargando...</div>
                          ) : historial[m._id].length === 0 ? (
                            <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Sin movimientos registrados</div>
                          ) : (
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                              <thead>
                                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                  {['Fecha', 'Tipo', 'Cantidad', 'Stock resultante', 'OT', 'Notas'].map((h) => (
                                    <th key={h} style={{ padding: '6px 12px', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)' }}>{h}</th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {historial[m._id].map((mov) => {
                                  const cfg = tipoConfig[mov.tipo]
                                  const Icon = cfg.icon
                                  return (
                                    <tr key={mov._id} style={{ borderBottom: '1px solid var(--border)' }}>
                                      <td style={{ padding: '6px 12px' }}>{new Date(mov.createdAt).toLocaleDateString('es-AR')}</td>
                                      <td style={{ padding: '6px 12px' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: cfg.color, fontWeight: 600 }}>
                                          <Icon size={12} /> {cfg.label}
                                        </span>
                                      </td>
                                      <td style={{ padding: '6px 12px', fontWeight: 600, color: mov.tipo === 'salida' ? 'var(--danger)' : 'var(--success)' }}>
                                        {mov.tipo === 'salida' ? '-' : '+'}{mov.cantidad}
                                      </td>
                                      <td style={{ padding: '6px 12px' }}>{mov.stock_resultante}</td>
                                      <td style={{ padding: '6px 12px', color: 'var(--primary)', fontWeight: 600 }}>{mov.numero_orden || '—'}</td>
                                      <td style={{ padding: '6px 12px', color: 'var(--text-secondary)' }}>{mov.notas || '—'}</td>
                                    </tr>
                                  )
                                })}
                              </tbody>
                            </table>
                          )}
                        </td>
                      </tr>
                    )}
                  </>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {modalMaterial && (
        <ModalMaterial
          material={materialEditar}
          onClose={() => setModalMaterial(false)}
          onGuardado={() => { setModalMaterial(false); cargar() }}
        />
      )}

      {modalMovimiento && materialSeleccionado && (
        <ModalMovimiento
          material={materialSeleccionado}
          tipo={tipoMovimiento}
          onClose={() => setModalMovimiento(false)}
          onGuardado={() => {
            setModalMovimiento(false)
            cargar()
            setHistorial((prev) => {
              const nuevo = { ...prev }
              delete nuevo[materialSeleccionado._id]
              return nuevo
            })
          }}
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
              Eliminar material
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '24px' }}>
              ¿Confirmás que querés archivar este material? No se perderá el historial.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button onClick={() => setConfirmarEliminar(null)}
                style={{ padding: '8px 16px', borderRadius: '6px', fontSize: '13px', border: '1px solid var(--border)', backgroundColor: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                Cancelar
              </button>
              <button onClick={() => eliminar(confirmarEliminar)}
                style={{ padding: '8px 20px', borderRadius: '6px', fontSize: '13px', fontWeight: 600, border: 'none', backgroundColor: 'var(--danger)', color: '#fff', cursor: 'pointer' }}>
                Archivar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}