'use client'
import { useEffect, useState, useCallback } from 'react'
import { Play, PackagePlus, CheckCircle, AlertTriangle, X } from 'lucide-react'

interface Item { id: string; modelo: string; cantidad_solicitada: number; optica: string; cantidad_completada: number }
interface Proyecto {
  _id: string
  numero: string
  cliente: string
  prioridad: 'NORMAL' | 'URGENTE'
  estado: 'NUEVO' | 'PREPARACION' | 'FABRICACION' | 'LISTO'
  items: Item[]
  tomado_por: string | null
  notas: string
}

const estadoConfig: Record<string, { color: string; bg: string; label: string }> = {
  NUEVO: { color: '#f59e0b', bg: '#f59e0b22', label: 'NUEVO' },
  PREPARACION: { color: '#3b82f6', bg: '#3b82f622', label: 'PREPARACIÓN' },
  FABRICACION: { color: '#2d7d78', bg: '#2d7d7822', label: 'FABRICACIÓN' },
  LISTO: { color: '#16a34a', bg: '#16a34a22', label: 'LISTO' },
}

type AccionTipo = 'tomar' | 'avance' | 'listo'

export default function FabricaProyectosPage() {
  const [proyectos, setProyectos] = useState<Proyecto[]>([])
  const [loading, setLoading] = useState(true)
  const [modalAccion, setModalAccion] = useState<{ proyecto: Proyecto; tipo: AccionTipo } | null>(null)
  const [itemSel, setItemSel] = useState('')
  const [cantidadSel, setCantidadSel] = useState('')
  const [errorModal, setErrorModal] = useState('')
  const [procesando, setProcesando] = useState(false)

  const cargar = useCallback(() => {
    fetch('/api/proyectos')
      .then((r) => r.json())
      .then((data) => { if (data.ok) setProyectos(data.data.filter((p: Proyecto) => p.estado !== 'LISTO')) })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    cargar()
    const interval = setInterval(cargar, 8000)
    return () => clearInterval(interval)
  }, [cargar])

  const abrirModal = (proyecto: Proyecto, tipo: AccionTipo) => {
    setModalAccion({ proyecto, tipo })
    setItemSel(proyecto.items.length === 1 ? proyecto.items[0].id : '')
    setCantidadSel('')
    setErrorModal('')
  }

  const cerrarModal = () => setModalAccion(null)

  const confirmarAccion = async () => {
    if (!modalAccion) return
    setErrorModal('')

    const { proyecto, tipo } = modalAccion
    const url = `/api/proyectos/${proyecto._id}/${tipo}`
    const body: Record<string, unknown> = {}

    if (tipo === 'avance') {
      if (!itemSel) return setErrorModal('Elegí el modelo')
      const cant = Number(cantidadSel)
      if (!cant || cant <= 0) return setErrorModal('Ingresá una cantidad válida')
      body.item_id = itemSel
      body.cantidad = cant
    }

    setProcesando(true)
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const data = await res.json()
    setProcesando(false)

    if (!data.ok) {
      setErrorModal(data.error + (data.faltantes ? ': ' + data.faltantes.join(', ') : ''))
      return
    }

    cerrarModal()
    cargar()
  }

  if (loading) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>Cargando proyectos...</div>
  }

  return (
    <div style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ marginBottom: '32px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#fff', letterSpacing: '1px' }}>ITELSA — FÁBRICA</h1>
        <p style={{ fontSize: '14px', color: '#5eead4', marginTop: '6px' }}>Proyectos en producción</p>
      </div>

      {proyectos.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#64748b', padding: '80px 0', fontSize: '16px' }}>
          No hay proyectos pendientes 🎉
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
          {proyectos.map((p) => {
            const cfg = estadoConfig[p.estado]
            const totalSol = p.items.reduce((a, i) => a + i.cantidad_solicitada, 0)
            const totalComp = p.items.reduce((a, i) => a + i.cantidad_completada, 0)
            const pct = totalSol > 0 ? Math.round((totalComp / totalSol) * 100) : 0
            return (
              <div key={p._id} style={{
                backgroundColor: '#141f2b', border: `1px solid ${p.prioridad === 'URGENTE' ? '#ef4444' : '#1e3448'}`,
                borderRadius: '14px', padding: '20px', position: 'relative', overflow: 'hidden',
              }}>
                {p.prioridad === 'URGENTE' && (
                  <div style={{ position: 'absolute', top: 0, right: 0, backgroundColor: '#ef4444', color: '#fff', fontSize: '10px', fontWeight: 800, padding: '4px 12px', borderBottomLeftRadius: '10px' }}>
                    URGENTE
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <div>
                    <div style={{ fontSize: '18px', fontWeight: 800, color: '#fff' }}>{p.numero}</div>
                    <div style={{ fontSize: '13px', color: '#94a3b8' }}>{p.cliente}</div>
                  </div>
                  <span style={{ fontSize: '10px', fontWeight: 700, padding: '3px 10px', borderRadius: '6px', backgroundColor: cfg.bg, color: cfg.color }}>
                    {cfg.label}
                  </span>
                </div>

                <div style={{ width: '100%', height: '6px', backgroundColor: '#1e3448', borderRadius: '3px', overflow: 'hidden', marginBottom: '6px' }}>
                  <div style={{ width: `${pct}%`, height: '100%', backgroundColor: pct === 100 ? '#16a34a' : '#2d7d78', transition: 'width 0.3s' }} />
                </div>
                <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '14px' }}>{totalComp}/{totalSol} equipos ({pct}%)</div>

                <div style={{ marginBottom: '14px' }}>
                  {p.items.map((it) => (
                    <div key={it.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#cbd5e1', padding: '4px 0', borderBottom: '1px solid #1e3448' }}>
                      <span>{it.modelo} <span style={{ color: '#64748b' }}>({it.optica})</span></span>
                      <span style={{ fontWeight: 700, color: it.cantidad_completada >= it.cantidad_solicitada ? '#16a34a' : '#fff' }}>
                        {it.cantidad_completada}/{it.cantidad_solicitada}
                      </span>
                    </div>
                  ))}
                </div>

                {p.tomado_por && (
                  <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '10px' }}>Tomado por: <b style={{ color: '#cbd5e1' }}>{p.tomado_por}</b></div>
                )}

                {p.estado === 'NUEVO' && (
                  <button onClick={() => abrirModal(p, 'tomar')} style={{
                    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    padding: '10px', borderRadius: '8px', border: 'none', backgroundColor: '#2d7d78', color: '#fff',
                    fontSize: '13px', fontWeight: 700, cursor: 'pointer',
                  }}>
                    <Play size={15} /> Tomar proyecto
                  </button>
                )}
                {(p.estado === 'PREPARACION' || p.estado === 'FABRICACION') && pct < 100 && (
                  <button onClick={() => abrirModal(p, 'avance')} style={{
                    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    padding: '10px', borderRadius: '8px', border: 'none', backgroundColor: '#f59e0b', color: '#1a1a1a',
                    fontSize: '13px', fontWeight: 700, cursor: 'pointer',
                  }}>
                    <PackagePlus size={15} /> Cargar avance
                  </button>
                )}
                {pct === 100 && p.estado !== 'LISTO' && (
                  <button onClick={() => abrirModal(p, 'listo')} style={{
                    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    padding: '10px', borderRadius: '8px', border: 'none', backgroundColor: '#16a34a', color: '#fff',
                    fontSize: '13px', fontWeight: 700, cursor: 'pointer',
                  }}>
                    <CheckCircle size={15} /> Marcar como listo
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}

      {modalAccion && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 300, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ backgroundColor: '#141f2b', border: '1px solid #1e3448', borderRadius: '14px', padding: '28px', maxWidth: '400px', width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <span style={{ fontSize: '15px', fontWeight: 700, color: '#fff' }}>
                {modalAccion.tipo === 'tomar' && 'Tomar proyecto'}
                {modalAccion.tipo === 'avance' && 'Cargar avance'}
                {modalAccion.tipo === 'listo' && 'Marcar como listo'}
              </span>
              <button onClick={cerrarModal} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={18} /></button>
            </div>

            <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '16px' }}>{modalAccion.proyecto.numero} — {modalAccion.proyecto.cliente}</div>

            {modalAccion.tipo === 'avance' && (
              <>
                <label style={{ fontSize: '11px', fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: '4px' }}>MODELO</label>
                <select value={itemSel} onChange={(e) => setItemSel(e.target.value)} style={{
                  width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #1e3448',
                  backgroundColor: '#0f1923', color: '#fff', fontSize: '13px', marginBottom: '12px', outline: 'none',
                }}>
                  <option value="">Seleccionar...</option>
                  {modalAccion.proyecto.items.map((it) => (
                    <option key={it.id} value={it.id}>
                      {it.modelo} ({it.optica}) — pendiente {it.cantidad_solicitada - it.cantidad_completada}
                    </option>
                  ))}
                </select>

                <label style={{ fontSize: '11px', fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: '4px' }}>CANTIDAD FABRICADA</label>
                <input type="number" min={1} value={cantidadSel} onChange={(e) => setCantidadSel(e.target.value)} style={{
                  width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #1e3448',
                  backgroundColor: '#0f1923', color: '#fff', fontSize: '13px', marginBottom: '16px', outline: 'none',
                }} />
              </>
            )}

            {errorModal && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#ef444422', color: '#f87171', padding: '8px 12px', borderRadius: '8px', fontSize: '12px', marginBottom: '12px' }}>
                <AlertTriangle size={14} /> {errorModal}
              </div>
            )}

            <button onClick={confirmarAccion} disabled={procesando} style={{
              width: '100%', padding: '12px', borderRadius: '8px', border: 'none',
              backgroundColor: '#2d7d78', color: '#fff', fontSize: '14px', fontWeight: 700,
              cursor: procesando ? 'not-allowed' : 'pointer', opacity: procesando ? 0.6 : 1,
            }}>
              {procesando ? 'Procesando...' : 'Confirmar'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
