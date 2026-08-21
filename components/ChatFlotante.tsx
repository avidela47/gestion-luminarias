'use client'
import { useEffect, useState, useRef, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { MessageCircle, X, Send } from 'lucide-react'

interface Mensaje {
  _id: string
  autor: string
  texto: string
  createdAt: string
}

export default function ChatFlotante() {
  const { data: session } = useSession()
  const [abierto, setAbierto] = useState(false)
  const [mensajes, setMensajes] = useState<Mensaje[]>([])
  const [texto, setTexto] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [sinLeer, setSinLeer] = useState(0)
  const ultimoCount = useRef(0)
  const abiertoRef = useRef(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    abiertoRef.current = abierto
  }, [abierto])

  const cargar = useCallback(() => {
    fetch('/api/mensajes')
      .then((r) => r.json())
      .then((data) => {
        if (!data.ok) return
        const nuevos: Mensaje[] = data.data
        if (ultimoCount.current > 0 && nuevos.length > ultimoCount.current && !abiertoRef.current) {
          setSinLeer((prev) => prev + (nuevos.length - ultimoCount.current))
        }
        ultimoCount.current = nuevos.length
        setMensajes(nuevos)
      })
  }, [])

  useEffect(() => {
    cargar()
    const interval = setInterval(cargar, 6000)
    return () => clearInterval(interval)
  }, [cargar])

  useEffect(() => {
    if (abierto) {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight })
    }
  }, [abierto, mensajes])

  const enviar = async () => {
    if (!texto.trim() || enviando) return
    setEnviando(true)
    const res = await fetch('/api/mensajes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ texto }),
    })
    setEnviando(false)
    if (res.ok) {
      setTexto('')
      cargar()
    }
  }

  const formatHora = (iso: string) => {
    const d = new Date(iso)
    return d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
  }

  if (!session?.user) return null

  return (
    <>
      <button
        onClick={() => {
          setAbierto((v) => !v)
          setSinLeer(0)
        }}
        style={{
          position: 'fixed', bottom: '24px', right: '24px', zIndex: 500,
          width: '56px', height: '56px', borderRadius: '50%',
          backgroundColor: '#2d7d78', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
        }}
      >
        {abierto ? <X size={24} color="#fff" /> : <MessageCircle size={24} color="#fff" />}
        {!abierto && sinLeer > 0 && (
          <span style={{
            position: 'absolute', top: '-4px', right: '-4px',
            backgroundColor: '#ef4444', color: '#fff', fontSize: '11px', fontWeight: 700,
            borderRadius: '50%', minWidth: '20px', height: '20px',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px',
          }}>
            {sinLeer > 9 ? '9+' : sinLeer}
          </span>
        )}
      </button>

      {abierto && (
        <div style={{
          position: 'fixed', bottom: '90px', right: '24px', zIndex: 500,
          width: '340px', maxWidth: 'calc(100vw - 48px)', height: '440px',
          backgroundColor: '#141f2b', border: '1px solid #1e3448', borderRadius: '14px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)', display: 'flex', flexDirection: 'column', overflow: 'hidden',
        }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid #1e3448', backgroundColor: '#0f1923' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>Chat Oficina — Fábrica</div>
          </div>

          <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {mensajes.length === 0 ? (
              <div style={{ fontSize: '12px', color: '#64748b', textAlign: 'center', marginTop: '20px' }}>
                Sin mensajes todavía
              </div>
            ) : (
              mensajes.map((m) => {
                const esPropio = m.autor === session.user?.name
                return (
                  <div key={m._id} style={{ display: 'flex', flexDirection: 'column', alignItems: esPropio ? 'flex-end' : 'flex-start' }}>
                    {!esPropio && (
                      <div style={{ fontSize: '10px', fontWeight: 700, color: '#5eead4', marginBottom: '2px' }}>{m.autor}</div>
                    )}
                    <div style={{
                      maxWidth: '85%', padding: '8px 12px', borderRadius: '10px',
                      backgroundColor: esPropio ? '#2d7d78' : '#1e3448',
                      color: '#fff', fontSize: '13px', lineHeight: 1.4,
                    }}>
                      {m.texto}
                    </div>
                    <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>{formatHora(m.createdAt)}</div>
                  </div>
                )
              })
            )}
          </div>

          <div style={{ padding: '12px', borderTop: '1px solid #1e3448', display: 'flex', gap: '8px' }}>
            <input
              type="text"
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') enviar() }}
              placeholder="Escribí un mensaje..."
              style={{
                flex: 1, padding: '9px 12px', borderRadius: '8px', border: '1px solid #1e3448',
                backgroundColor: '#0f1923', color: '#fff', fontSize: '13px', outline: 'none',
              }}
            />
            <button
              onClick={enviar}
              disabled={enviando || !texto.trim()}
              style={{
                width: '38px', height: '38px', borderRadius: '8px', border: 'none',
                backgroundColor: '#2d7d78', display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: enviando || !texto.trim() ? 'not-allowed' : 'pointer',
                opacity: enviando || !texto.trim() ? 0.5 : 1,
              }}
            >
              <Send size={16} color="#fff" />
            </button>
          </div>
        </div>
      )}
    </>
  )
}