'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const res = await signIn('credentials', {
      username,
      password,
      redirect: false,
    })

    setLoading(false)

    if (res?.error) {
      setError('Usuario o contraseña incorrectos')
      return
    }

    router.push('/dashboard')
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0f1923',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0,
        backgroundImage: 'radial-gradient(circle at 20% 50%, #1a3a4a22 0%, transparent 50%), radial-gradient(circle at 80% 20%, #2d7d7822 0%, transparent 50%)',
      }} />

      <div style={{
        position: 'relative', zIndex: 1,
        backgroundColor: '#ffffff08',
        border: '1px solid #ffffff14',
        borderRadius: '16px',
        padding: '36px 40px',
        width: '100%',
        maxWidth: '400px',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 32px 80px rgba(0,0,0,0.4)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <Image
            src="/logo.png"
            alt="ITELSA"
            width={52}
            height={52}
            style={{ objectFit: 'contain', borderRadius: '10px', marginBottom: '12px', display: 'block', margin: '0 auto 12px' }}
          />
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#ffffff', letterSpacing: '1px' }}>
            ITELSA SAS
          </div>
          <div style={{ fontSize: '12px', color: 'var(--sidebar-accent)', letterSpacing: '2px', textTransform: 'uppercase', marginTop: '4px' }}>
            Smart Lighting
          </div>
          <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '8px' }}>
            Sistema de gestión interno
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#94a3b8', marginBottom: '6px', letterSpacing: '0.5px' }}>
              USUARIO
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Ingresá tu usuario"
              required
              style={{
                width: '100%', padding: '11px 14px',
                backgroundColor: '#ffffff10',
                border: '1px solid #ffffff20',
                borderRadius: '8px',
                fontSize: '14px', color: '#ffffff',
                outline: 'none',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#94a3b8', marginBottom: '6px', letterSpacing: '0.5px' }}>
              CONTRASEÑA
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ingresá tu contraseña"
              required
              style={{
                width: '100%', padding: '11px 14px',
                backgroundColor: '#ffffff10',
                border: '1px solid #ffffff20',
                borderRadius: '8px',
                fontSize: '14px', color: '#ffffff',
                outline: 'none',
              }}
            />
          </div>

          {error && (
            <div style={{
              backgroundColor: '#dc262620',
              border: '1px solid #dc262640',
              color: '#fca5a5',
              padding: '10px 14px',
              borderRadius: '8px',
              fontSize: '13px',
              textAlign: 'center',
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              marginTop: '4px',
              backgroundColor: 'var(--sidebar-accent)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              letterSpacing: '0.5px',
            }}
          >
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '11px', color: '#475569' }}>
          v1.0.0 — {new Date().getFullYear()}
        </div>
      </div>
    </div>
  )
}