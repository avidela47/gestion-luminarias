'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { ArrowLeft } from 'lucide-react'

export default function RegistroPage() {
  const router = useRouter()
  const [form, setForm] = useState({ nombre: '', username: '', password: '', rol: 'usuario' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [ok, setOk] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setOk('')
    if (!form.nombre || !form.username || !form.password) {
      return setError('Todos los campos son obligatorios')
    }
    setLoading(true)
    const res = await fetch('/api/auth/registro', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    setLoading(false)
    if (!data.ok) return setError(data.error || 'Error al registrar')
    setOk(`Usuario "${data.data.username}" creado correctamente`)
    setForm({ nombre: '', username: '', password: '', rol: 'usuario' })
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0f1923',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '16px',
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
        width: '100%', maxWidth: '420px',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 32px 80px rgba(0,0,0,0.4)',
      }}>
        <button onClick={() => router.push('/dashboard')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
          <ArrowLeft size={16} /> Volver
        </button>

        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <Image src="/logo.png" alt="ITELSA" width={52} height={52}
            style={{ objectFit: 'contain', borderRadius: '10px', display: 'block', margin: '0 auto 12px', backgroundColor: '#fff', padding: '6px' }} />
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#ffffff' }}>Registrar usuario</div>
          <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>Solo administradores</div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {[
            { label: 'NOMBRE COMPLETO', key: 'nombre', type: 'text', placeholder: 'Ej: Juan Pérez' },
            { label: 'USUARIO', key: 'username', type: 'text', placeholder: 'Ej: jperez' },
            { label: 'CONTRASEÑA', key: 'password', type: 'password', placeholder: 'Mínimo 6 caracteres' },
          ].map(({ label, key, type, placeholder }) => (
            <div key={key}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#94a3b8', marginBottom: '6px' }}>
                {label}
              </label>
              <input
                type={type}
                value={form[key as keyof typeof form]}
                onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
                placeholder={placeholder}
                style={{
                  width: '100%', padding: '11px 14px',
                  backgroundColor: '#ffffff10', border: '1px solid #ffffff20',
                  borderRadius: '8px', fontSize: '14px', color: '#ffffff', outline: 'none',
                }}
              />
            </div>
          ))}

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#94a3b8', marginBottom: '6px' }}>
              ROL
            </label>
            <select
              value={form.rol}
              onChange={(e) => setForm((p) => ({ ...p, rol: e.target.value }))}
              style={{
                width: '100%', padding: '11px 14px',
                backgroundColor: '#ffffff10', border: '1px solid #ffffff20',
                borderRadius: '8px', fontSize: '14px', color: '#ffffff', outline: 'none',
              }}
            >
              <option value="usuario" style={{ backgroundColor: '#1e293b' }}>Usuario</option>
              <option value="admin" style={{ backgroundColor: '#1e293b' }}>Admin</option>
            </select>
          </div>

          {error && (
            <div style={{
              backgroundColor: '#dc262620', border: '1px solid #dc262640',
              color: '#fca5a5', padding: '10px 14px', borderRadius: '8px',
              fontSize: '13px', textAlign: 'center',
            }}>
              {error}
            </div>
          )}

          {ok && (
            <div style={{
              backgroundColor: '#16a34a20', border: '1px solid #16a34a40',
              color: '#86efac', padding: '10px 14px', borderRadius: '8px',
              fontSize: '13px', textAlign: 'center',
            }}>
              {ok}
            </div>
          )}

          <button type="submit" disabled={loading}
            style={{
              width: '100%', padding: '12px', marginTop: '4px',
              backgroundColor: 'var(--sidebar-accent)', color: '#ffffff',
              border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
            }}>
            {loading ? 'Registrando...' : 'Crear usuario'}
          </button>
        </form>
      </div>
    </div>
  )
}