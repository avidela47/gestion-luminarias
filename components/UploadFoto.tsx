'use client'
import { useRef, useState } from 'react'
import Image from 'next/image'
import { Upload, X, Loader2 } from 'lucide-react'

interface Props {
  value: string
  onChange: (url: string) => void
  code?: string
}

export default function UploadFoto({ value, onChange, code }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleFile(file: File) {
    setError('')
    setLoading(true)
    try {
      const form = new FormData()
      form.append('file', file)
      if (code) form.append('code', code)
      const res = await fetch('/api/upload', { method: 'POST', body: form })
      const data = await res.json()
      if (!res.ok || !data.ok) throw new Error(data.error || 'Error subiendo imagen')
      onChange(data.url)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error subiendo imagen')
    } finally {
      setLoading(false)
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const size = 300

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {value ? (
        <div style={{ position: 'relative', width: size, height: size, borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border)' }}
          className="group">
          <Image src={value} alt="Foto" fill style={{ objectFit: 'cover' }} sizes="300px" />
          <button
            type="button"
            onClick={() => onChange('')}
            style={{
              position: 'absolute', top: '6px', right: '6px',
              backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: '50%',
              border: 'none', cursor: 'pointer', padding: '4px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <X size={14} color="#fff" />
          </button>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          style={{
            width: size, height: size, borderRadius: '8px',
            border: '2px dashed var(--border)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            gap: '8px', cursor: 'pointer', backgroundColor: 'var(--input-bg)',
          }}
        >
          {loading ? (
            <Loader2 size={24} color="var(--text-muted)" />
          ) : (
            <>
              <Upload size={24} color="var(--text-muted)" />
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Subir foto</span>
            </>
          )}
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        style={{ display: 'none' }}
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
          e.target.value = ''
        }}
      />
      {error && <p style={{ fontSize: '12px', color: 'var(--danger)' }}>{error}</p>}
    </div>
  )
}