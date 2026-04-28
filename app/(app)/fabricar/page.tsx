'use client'

import { useEffect, useState } from 'react'
import { Factory, AlertTriangle, CheckCircle, ChevronDown } from 'lucide-react'

interface Receta {
  _id: string
  codigo: string
  nombre: string
  version: number
  componentes: { id_componente: string; cantidad: number }[]
}

interface Componente {
  id_componente: string
  nombre: string
  stock_actual: number
  unidad: string
}

interface ItemValidacion {
  id_componente: string
  nombre: string
  necesario: number
  disponible: number
  unidad: string
  ok: boolean
}

export default function FabricarPage() {
  const [recetas, setRecetas] = useState<Receta[]>([])
  const [componentes, setComponentes] = useState<Componente[]>([])
  const [codigoSeleccionado, setCodigoSeleccionado] = useState('')
  const [cantidad, setCantidad] = useState(1)
  const [operario, setOperario] = useState('')
  const [notas, setNotas] = useState('')
  const [validacion, setValidacion] = useState<ItemValidacion[] | null>(null)
  const [fabricando, setFabricando] = useState(false)
  const [resultado, setResultado] = useState<{ ok: boolean; mensaje: string } | null>(null)

  useEffect(() => {
    fetch('/api/recetas')
      .then((r) => r.json())
      .then((data) => { if (data.ok) setRecetas(data.data.filter((r: Receta) => r.componentes.length > 0)) })

    fetch('/api/componentes')
      .then((r) => r.json())
      .then((data) => { if (data.ok) setComponentes(data.data) })
  }, [])

  const recetaSeleccionada = recetas.find((r) => r.codigo === codigoSeleccionado)

  const validarStock = () => {
    if (!recetaSeleccionada || cantidad < 1) return
    setResultado(null)

    const items: ItemValidacion[] = recetaSeleccionada.componentes.map((item) => {
      const comp = componentes.find((c) => c.id_componente === item.id_componente)
      const necesario = item.cantidad * cantidad
      const disponible = comp?.stock_actual ?? 0
      return {
        id_componente: item.id_componente,
        nombre: comp?.nombre ?? item.id_componente,
        necesario,
        disponible,
        unidad: comp?.unidad ?? 'unidad',
        ok: disponible >= necesario,
      }
    })

    setValidacion(items)
  }

  const puedeProducir = validacion !== null && validacion.every((v) => v.ok)

  const confirmarFabricacion = async () => {
    if (!puedeProducir) return
    setFabricando(true)
    setResultado(null)

    const res = await fetch('/api/producciones', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        codigo_luminaria: codigoSeleccionado,
        cantidad,
        operario: operario || 'admin',
        notas,
      }),
    })

    const data = await res.json()
    setFabricando(false)

    if (data.ok) {
      setResultado({ ok: true, mensaje: `✓ Producción registrada correctamente. Se fabricaron ${cantidad} unidades de ${codigoSeleccionado}.` })
      setValidacion(null)
      setCodigoSeleccionado('')
      setCantidad(1)
      setOperario('')
      setNotas('')
      // Recargar componentes para ver stock actualizado
      fetch('/api/componentes')
        .then((r) => r.json())
        .then((d) => { if (d.ok) setComponentes(d.data) })
    } else {
      setResultado({ ok: false, mensaje: data.error || 'Error al registrar la producción' })
    }
  }

  return (
    <div style={{ padding: '32px', maxWidth: '800px' }}>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)' }}>
          Fabricar
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
          Registrá una producción y el sistema descontará el stock automáticamente
        </p>
      </div>

      {/* Formulario */}
      <div style={{
        backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)',
        borderRadius: '10px', padding: '24px', marginBottom: '20px',
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px', gap: '16px', marginBottom: '16px' }}>
          {/* Selector de luminaria */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
              LUMINARIA *
            </label>
            <div style={{ position: 'relative' }}>
              <select
                value={codigoSeleccionado}
                onChange={(e) => { setCodigoSeleccionado(e.target.value); setValidacion(null); setResultado(null) }}
                style={{
                  width: '100%', padding: '10px 36px 10px 12px',
                  border: '1px solid var(--border)', borderRadius: '8px',
                  fontSize: '13px', backgroundColor: 'var(--input-bg)',
                  color: codigoSeleccionado ? 'var(--text-primary)' : 'var(--text-muted)',
                  outline: 'none', appearance: 'none', cursor: 'pointer',
                }}
              >
                <option value="">Seleccionar luminaria...</option>
                {recetas.map((r) => (
                  <option key={r.codigo} value={r.codigo}>
                    {r.codigo} — {r.nombre}
                  </option>
                ))}
              </select>
              <ChevronDown size={16} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
            </div>
          </div>

          {/* Cantidad */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
              CANTIDAD *
            </label>
            <input
              type="number"
              min={1}
              value={cantidad}
              onChange={(e) => { setCantidad(Number(e.target.value)); setValidacion(null); setResultado(null) }}
              style={{
                width: '100%', padding: '10px 12px',
                border: '1px solid var(--border)', borderRadius: '8px',
                fontSize: '13px', backgroundColor: 'var(--input-bg)',
                color: 'var(--text-primary)', outline: 'none',
              }}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
              OPERARIO
            </label>
            <input
              type="text"
              value={operario}
              onChange={(e) => setOperario(e.target.value)}
              placeholder="Nombre del operario"
              style={{
                width: '100%', padding: '10px 12px',
                border: '1px solid var(--border)', borderRadius: '8px',
                fontSize: '13px', backgroundColor: 'var(--input-bg)',
                color: 'var(--text-primary)', outline: 'none',
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
              NOTAS
            </label>
            <input
              type="text"
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              placeholder="Ej: Pedido cliente X"
              style={{
                width: '100%', padding: '10px 12px',
                border: '1px solid var(--border)', borderRadius: '8px',
                fontSize: '13px', backgroundColor: 'var(--input-bg)',
                color: 'var(--text-primary)', outline: 'none',
              }}
            />
          </div>
        </div>

        <button
          onClick={validarStock}
          disabled={!codigoSeleccionado || cantidad < 1}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '10px 20px', borderRadius: '8px', fontSize: '13px', fontWeight: 600,
            border: 'none', backgroundColor: 'var(--secondary)', color: '#fff',
            cursor: !codigoSeleccionado || cantidad < 1 ? 'not-allowed' : 'pointer',
            opacity: !codigoSeleccionado || cantidad < 1 ? 0.5 : 1,
          }}
        >
          <Factory size={16} />
          Verificar stock
        </button>
      </div>

      {/* Resultado de validación */}
      {validacion && (
        <div style={{
          backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)',
          borderRadius: '10px', padding: '24px', marginBottom: '20px',
        }}>
          <h2 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px' }}>
            Componentes necesarios para {cantidad} unidad{cantidad > 1 ? 'es' : ''} de {codigoSeleccionado}
          </h2>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', marginBottom: '20px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid var(--border)' }}>
                {['Componente', 'Necesario', 'Disponible', 'Estado'].map((h) => (
                  <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {validacion.map((v, i) => (
  <tr key={`${v.id_componente}-${i}`} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '10px 12px' }}>
                    <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{v.id_componente}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{v.nombre}</div>
                  </td>
                  <td style={{ padding: '10px 12px', color: 'var(--text-primary)', fontWeight: 600 }}>
                    {v.necesario} {v.unidad}
                  </td>
                  <td style={{ padding: '10px 12px', fontWeight: 600, color: v.ok ? 'var(--success)' : 'var(--danger)' }}>
                    {v.disponible} {v.unidad}
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    {v.ok ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--success)', fontSize: '12px', fontWeight: 600 }}>
                        <CheckCircle size={14} /> OK
                      </span>
                    ) : (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--danger)', fontSize: '12px', fontWeight: 600 }}>
                        <AlertTriangle size={14} /> Falta {v.necesario - v.disponible} {v.unidad}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {puedeProducir ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                color: 'var(--success)', fontSize: '13px', fontWeight: 600,
              }}>
                <CheckCircle size={16} />
                Stock suficiente para fabricar {cantidad} unidad{cantidad > 1 ? 'es' : ''}
              </div>
              <button
                onClick={confirmarFabricacion}
                disabled={fabricando}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '10px 24px', borderRadius: '8px', fontSize: '13px', fontWeight: 600,
                  border: 'none', backgroundColor: 'var(--primary)', color: '#fff',
                  cursor: fabricando ? 'not-allowed' : 'pointer', opacity: fabricando ? 0.7 : 1,
                }}
              >
                <Factory size={16} />
                {fabricando ? 'Registrando...' : 'Confirmar fabricación'}
              </button>
            </div>
          ) : (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              color: 'var(--danger)', fontSize: '13px', fontWeight: 600,
            }}>
              <AlertTriangle size={16} />
              Stock insuficiente — no se puede fabricar la cantidad solicitada
            </div>
          )}
        </div>
      )}

      {/* Resultado final */}
      {resultado && (
        <div style={{
          padding: '16px 20px', borderRadius: '8px', fontSize: '13px', fontWeight: 500,
          backgroundColor: resultado.ok ? 'var(--success-bg)' : 'var(--danger-bg)',
          color: resultado.ok ? 'var(--success)' : 'var(--danger)',
          border: `1px solid ${resultado.ok ? 'var(--success)' : 'var(--danger)'}`,
        }}>
          {resultado.mensaje}
        </div>
      )}
    </div>
  )
}