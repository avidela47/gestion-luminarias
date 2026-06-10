'use client'

import { useEffect, useState } from 'react'
import { Search, Shield } from 'lucide-react'

interface LogEntry {
  _id: string
  usuario_nombre: string
  usuario_username: string
  accion: 'crear' | 'editar' | 'eliminar' | 'ver'
  modulo: string
  detalle: string
  dato_id: string
  ip: string
  createdAt: string
}

const accionColor = {
  crear: { bg: 'var(--success-bg)', color: 'var(--success)', label: 'CREAR' },
  editar: { bg: 'var(--warning-bg)', color: 'var(--warning)', label: 'EDITAR' },
  eliminar: { bg: 'var(--danger-bg)', color: 'var(--danger)', label: 'ELIMINAR' },
  ver: { bg: 'var(--info-bg)', color: 'var(--info)', label: 'VER' },
}

export default function AuditoriaPage() {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [filtroModulo, setFiltroModulo] = useState('todos')
  const [filtroAccion, setFiltroAccion] = useState('todos')
  const [filtroUsuario, setFiltroUsuario] = useState('todos')

  useEffect(() => {
    fetch('/api/auditoria')
      .then((r) => r.json())
      .then((data) => {
        if (data.ok) setLogs(data.data)
        setLoading(false)
      })
  }, [])

  const modulos = ['todos', ...Array.from(new Set(logs.map((l) => l.modulo))).sort()]
  const usuarios = ['todos', ...Array.from(new Set(logs.map((l) => l.usuario_username))).sort()]

  const filtrados = logs.filter((l) => {
    const matchBusqueda = l.detalle.toLowerCase().includes(busqueda.toLowerCase()) ||
      l.usuario_nombre.toLowerCase().includes(busqueda.toLowerCase())
    const matchModulo = filtroModulo === 'todos' || l.modulo === filtroModulo
    const matchAccion = filtroAccion === 'todos' || l.accion === filtroAccion
    const matchUsuario = filtroUsuario === 'todos' || l.usuario_username === filtroUsuario
    return matchBusqueda && matchModulo && matchAccion && matchUsuario
  })

  return (
    <div style={{ padding: '32px', maxWidth: '1200px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Shield size={22} /> Auditoría
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Registro de acciones por usuario — últimas 500 entradas
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative' }}>
          <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Buscar en detalle o usuario..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            style={{
              padding: '8px 12px 8px 32px', width: '260px',
              border: '1px solid var(--border)', borderRadius: '8px',
              fontSize: '13px', backgroundColor: 'var(--input-bg)',
              color: 'var(--text-primary)', outline: 'none',
            }}
          />
        </div>

        <select value={filtroUsuario} onChange={(e) => setFiltroUsuario(e.target.value)}
          style={{
            padding: '8px 12px', border: '1px solid var(--border)', borderRadius: '8px',
            fontSize: '13px', backgroundColor: 'var(--input-bg)', color: 'var(--text-primary)', outline: 'none',
          }}>
          {usuarios.map((u) => <option key={u} value={u}>{u === 'todos' ? 'Todos los usuarios' : u}</option>)}
        </select>

        <select value={filtroModulo} onChange={(e) => setFiltroModulo(e.target.value)}
          style={{
            padding: '8px 12px', border: '1px solid var(--border)', borderRadius: '8px',
            fontSize: '13px', backgroundColor: 'var(--input-bg)', color: 'var(--text-primary)', outline: 'none',
          }}>
          {modulos.map((m) => <option key={m} value={m}>{m === 'todos' ? 'Todos los módulos' : m}</option>)}
        </select>

        <select value={filtroAccion} onChange={(e) => setFiltroAccion(e.target.value)}
          style={{
            padding: '8px 12px', border: '1px solid var(--border)', borderRadius: '8px',
            fontSize: '13px', backgroundColor: 'var(--input-bg)', color: 'var(--text-primary)', outline: 'none',
          }}>
          <option value="todos">Todas las acciones</option>
          <option value="crear">Crear</option>
          <option value="editar">Editar</option>
          <option value="eliminar">Eliminar</option>
        </select>
      </div>

      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px' }}>
        {filtrados.length} {filtrados.length === 1 ? 'registro' : 'registros'}
      </div>

      <div style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '10px', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Cargando...</div>
        ) : filtrados.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Shield size={32} style={{ marginBottom: '8px', opacity: 0.4 }} />
            <div>No hay registros</div>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid var(--border)' }}>
                {['Fecha', 'Usuario', 'Acción', 'Módulo', 'Detalle'].map((h) => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtrados.map((l) => {
                const cfg = accionColor[l.accion] ?? accionColor.ver
                return (
                  <tr key={l._id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '10px 16px', color: 'var(--text-secondary)', whiteSpace: 'nowrap', fontSize: '12px' }}>
                      {new Date(l.createdAt).toLocaleDateString('es-AR')} {new Date(l.createdAt).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td style={{ padding: '10px 16px' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '13px' }}>{l.usuario_nombre}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '11px' }}>{l.usuario_username}</div>
                    </td>
                    <td style={{ padding: '10px 16px' }}>
                      <span style={{
                        fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '4px',
                        backgroundColor: cfg.bg, color: cfg.color,
                      }}>
                        {cfg.label}
                      </span>
                    </td>
                    <td style={{ padding: '10px 16px', color: 'var(--text-secondary)', fontWeight: 500 }}>{l.modulo}</td>
                    <td style={{ padding: '10px 16px', color: 'var(--text-primary)' }}>{l.detalle}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}