'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { Upload, X, Loader2 } from 'lucide-react'

interface Props {
  value: string        // URL actual guardada en MongoDB
  onChange: (url: string) => void
  code?: string        // prefijo del archivo (ej: id_componente)
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

  return (
    <div className="flex flex-col gap-2">
      {value ? (
        <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-white/10 group">
          <Image
            src={value}
            alt="Foto"
            fill
            className="object-cover"
            sizes="128px"
          />
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute top-1 right-1 bg-black/60 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X size={14} className="text-white" />
          </button>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="w-32 h-32 rounded-lg border-2 border-dashed border-white/20 flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-white/40 transition-colors"
        >
          {loading ? (
            <Loader2 size={20} className="animate-spin text-white/40" />
          ) : (
            <>
              <Upload size={20} className="text-white/40" />
              <span className="text-xs text-white/40">Subir foto</span>
            </>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
          e.target.value = ''
        }}
      />

      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
}