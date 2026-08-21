'use client'
import { useEffect, useState, useCallback, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Play, PackagePlus, CheckCircle, AlertTriangle, X, Plus, ArrowLeft, Bell } from 'lucide-react'

interface Item { id: string; modelo: string; cantidad_solicitada: number; cantidad_completada: number }
interface Proyecto {
  _id: string
  numero: string
  cliente: string
  prioridad: 'NORMAL' | 'URGENTE'
  estado: 'NUEVO' | 'PREPARACION' | 'FABRICACION' | 'LISTO' | 'EN_FABRICA'
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
  const { data: session } = useSession()
  const router = useRouter()
  const esAdmin = session?.user?.rol === 'admin'
  const [proyectos, setProyectos] = useState<Proyecto[]>([])
  const [loading, setLoading] = useState(true)
  const [modalAccion, setModalAccion] = useState<{ proyecto: Proyecto; tipo: AccionTipo } | null>(null)
  const [itemSel, setItemSel] = useState('')
  const [cantidadSel, setCantidadSel] = useState('')
  const [operarioSel, setOperarioSel] = useState('')
  const [errorModal, setErrorModal] = useState('')
  const [procesando, setProcesando] = useState(false)
  const [alertaNueva, setAlertaNueva] = useState<Proyecto | null>(null)
  const idsConocidos = useRef<Set<string> | null>(null)

  const cargar = useCallback(() => {
    fetch('/api/proyectos')
      .then((r) => r.json())
      .then((data) => {
        if (!data.ok) return
        const activos: Proyecto[] = data.data.filter((p: Proyecto) => p.estado !== 'LISTO')

        if (idsConocidos.current !== null) {
          const nuevos = activos.filter((p) => p.estado === 'NUEVO' && !idsConocidos.current!.has(p._id))
          if (nuevos.length > 0) {
            setAlertaNueva(nuevos[0])
                        try {
              const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
              const osc = ctx.createOscillator()
              const gain = ctx.createGain()
              osc.connect(gain)
              gain.connect(ctx.destination)
              osc.type = 'sine'
              osc.frequency.value = 880
              gain.gain.setValueAtTime(0.3, ctx.currentTime)
              gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5)
              osc.start()
              osc.stop(ctx.currentTime + 0.5)
              setTimeout(() => {
                const osc2 = ctx.createOscillator()
                const gain2 = ctx.createGain()
                osc2.connect(gain2)
                gain2.connect(ctx.destination)
                osc2.type = 'sine'
                osc2.frequency.value = 1046
                gain2.gain.setValueAtTime(0.3, ctx.currentTime)
                gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5)
                osc2.start()
                osc2.stop(ctx.currentTime + 0.5)
              }, 300)
            } catch {}
          }
        }
        idsConocidos.current = new Set(activos.map((p) => p._id))
        setProyectos(activos)
      })
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
    setOperarioSel('')
    setErrorModal('')
  }

  const cerrarModal = () => setModalAccion(null)

  const confirmarAccion = async () => {
    if (!modalAccion) return
    setErrorModal('')
    if (!operarioSel) return setErrorModal('Elegí quién realiza la acción')

    const { proyecto, tipo } = modalAccion
    const url = `/api/proyectos/${proyecto._id}/${tipo}`
    const body: Record<string, unknown> = { operario: operarioSel }

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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <button onClick={() => router.push('/dashboard')} style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          padding: '8px 16px', borderRadius: '8px', border: '1px solid #1e3448',
          backgroundColor: '#141f2b', color: '#94a3b8', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
        }}>
          <ArrowLeft size={14} /> Volver
        </button>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#fff', letterSpacing: '1px' }}>ITELSA — FÁBRICA</h1>
          <p style={{ fontSize: '14px', color: '#5eead4', marginTop: '6px' }}>Proyectos en producción</p>
        </div>
        {esAdmin ? (
          <button onClick={() => router.push('/proyectos')} style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '8px 16px', borderRadius: '8px', border: '1px solid #1e3448',
            backgroundColor: '#141f2b', color: '#5eead4', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
          }}>
            <Plus size={14} /> Gestionar proyectos
          </button>
        ) : (
          <div style={{ width: '140px' }} />
        )}
      </div>

      {proyectos.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#64748b', padding: '80px 0', fontSize: '16px' }}>
          No hay proyectos pendientes 🎉
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
          {proyectos.map((p) => {
            const cfg = estadoConfig[p.estado] ?? estadoConfig.NUEVO
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
                      <span>{it.modelo}</span>
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

            <label style={{ fontSize: '11px', fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: '4px' }}>OPERARIO</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '16px' }}>
              {['Fabio', 'Cristian', 'Pajarito'].map((op) => (
                <button key={op} onClick={() => setOperarioSel(op)} style={{
                  padding: '10px 6px', borderRadius: '8px', fontSize: '12px', fontWeight: 700,
                  border: operarioSel === op ? '2px solid #2d7d78' : '1px solid #1e3448',
                  backgroundColor: operarioSel === op ? '#2d7d7822' : '#0f1923',
                  color: operarioSel === op ? '#5eead4' : '#94a3b8', cursor: 'pointer',
                }}>
                  {op}
                </button>
              ))}
            </div>

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
                      {it.modelo} — pendiente {it.cantidad_solicitada - it.cantidad_completada}
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

      {alertaNueva && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 400, backgroundColor: 'rgba(220,38,38,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{
            backgroundColor: '#141f2b', border: '3px solid #ef4444', borderRadius: '20px',
            padding: '48px', maxWidth: '480px', width: '100%', textAlign: 'center',
            boxShadow: '0 0 60px rgba(239,68,68,0.5)', animation: 'pulse 1.2s infinite',
          }}>
            <Bell size={56} color="#ef4444" style={{ marginBottom: '16px' }} />
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#f87171', letterSpacing: '2px', marginBottom: '8px' }}>
              NUEVA ORDEN DE TRABAJO
            </div>
            <div style={{ fontSize: '32px', fontWeight: 800, color: '#fff', marginBottom: '8px' }}>
              {alertaNueva.numero}
            </div>
            <div style={{ fontSize: '15px', color: '#94a3b8', marginBottom: '28px' }}>
              {alertaNueva.cliente}
            </div>
            <button onClick={() => setAlertaNueva(null)} style={{
              padding: '12px 32px', borderRadius: '10px', border: 'none',
              backgroundColor: '#ef4444', color: '#fff', fontSize: '15px', fontWeight: 700, cursor: 'pointer',
            }}>
              Entendido
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 60px rgba(239,68,68,0.5); }
          50% { box-shadow: 0 0 90px rgba(239,68,68,0.8); }
        }
      `}</style>
    </div>
  )
}