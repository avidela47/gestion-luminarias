'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import Sidebar from '@/components/Sidebar'

export default function AppShell({
  nombreUsuario,
  rol,
  children,
}: {
  nombreUsuario: string
  rol: string
  children: React.ReactNode
}) {
  const pathname = usePathname()
  // El menú queda abierto solo en la pantalla donde se abrió: al navegar se cierra solo
  const [abiertoEn, setAbiertoEn] = useState<string | null>(null)
  const abierto = abiertoEn === pathname
  const setAbierto = (valor: boolean) => setAbiertoEn(valor ? pathname : null)

  // Bloquea el scroll del fondo mientras el menú está abierto en celular
  useEffect(() => {
    document.body.classList.toggle('menu-abierto', abierto)
    return () => document.body.classList.remove('menu-abierto')
  }, [abierto])

  // Cierra con la tecla Escape
  useEffect(() => {
    if (!abierto) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setAbiertoEn(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [abierto])

  return (
    <div className="app-shell" style={{ display: 'flex', minHeight: '100vh' }}>
      <header className="mobile-topbar">
        <button
          type="button"
          className="mobile-topbar-btn"
          onClick={() => setAbierto(!abierto)}
          aria-label={abierto ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={abierto}
          aria-controls="menu-lateral"
        >
          {abierto ? <X size={24} /> : <Menu size={24} />}
        </button>
        <Image src="/logo.png" alt="ITELSA SAS" width={96} height={96} className="mobile-topbar-logo" />
      </header>

      <div
        className={`sidebar-overlay${abierto ? ' open' : ''}`}
        onClick={() => setAbierto(false)}
        aria-hidden="true"
      />

      <Sidebar
        nombreUsuario={nombreUsuario}
        rol={rol}
        abierto={abierto}
        onNavegar={() => setAbierto(false)}
      />

      <main className="app-main">{children}</main>
    </div>
  )
}
