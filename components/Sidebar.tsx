'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Package, Cpu, Factory, ArrowLeftRight, Users, Truck, BoxSelect, FileText,
  Receipt, BarChart3, ChevronRight, ClipboardList,
} from 'lucide-react'

const menuItems = [
  {
    grupo: 'PRODUCCIÓN',
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { label: 'Componentes', href: '/componentes', icon: Cpu },
      { label: 'Recetas (BOM)', href: '/recetas', icon: Package },
      { label: 'Fabricar', href: '/fabricar', icon: Factory },
      { label: 'Movimientos', href: '/movimientos', icon: ArrowLeftRight },
    ],
  },
  {
    grupo: 'COMERCIAL',
    items: [
      { label: 'Clientes', href: '/clientes', icon: Users },
      { label: 'Proveedores', href: '/proveedores', icon: Truck },
      { label: 'Producto Terminado', href: '/productos', icon: BoxSelect },
      { label: 'Presupuestos', href: '/presupuestos', icon: FileText },
      { label: 'Órdenes de Trabajo', href: '/ordenes', icon: ClipboardList },
      { label: 'Facturas', href: '/facturas', icon: Receipt },
    ],
  },
  {
    grupo: 'REPORTES',
    items: [
      { label: 'Reportes', href: '/reportes', icon: BarChart3 },
    ],
  },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside
      style={{
        width: '240px',
        minHeight: '100vh',
        backgroundColor: 'var(--sidebar-bg)',
        borderRight: '1px solid var(--sidebar-border)',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        zIndex: 50,
        overflowY: 'auto',
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: '24px 20px 20px',
          borderBottom: '1px solid var(--sidebar-border)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        <Image
          src="/logo.png"
          alt="ITELSA SAS"
          width={38}
          height={38}
          style={{ objectFit: 'contain', borderRadius: '8px' }}
        />
        <div>
          <div style={{ color: '#ffffff', fontWeight: 700, fontSize: '15px', letterSpacing: '0.5px' }}>
            ITELSA SAS
          </div>
          <div style={{ color: 'var(--sidebar-accent)', fontSize: '10px', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
            Smart Lighting
          </div>
        </div>
      </div>

      {/* Menú */}
      <nav style={{ flex: 1, padding: '16px 0' }}>
        {menuItems.map((grupo) => (
          <div key={grupo.grupo} style={{ marginBottom: '8px' }}>
            <div
              style={{
                padding: '8px 20px 4px',
                fontSize: '10px',
                fontWeight: 600,
                letterSpacing: '1.2px',
                color: 'var(--text-muted)',
              }}
            >
              {grupo.grupo}
            </div>
            {grupo.items.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '9px 20px',
                    margin: '1px 8px',
                    borderRadius: '6px',
                    textDecoration: 'none',
                    fontSize: '13.5px',
                    fontWeight: isActive ? 600 : 400,
                    color: isActive ? 'var(--sidebar-text-active)' : 'var(--sidebar-text)',
                    backgroundColor: isActive ? 'var(--sidebar-accent)' : 'transparent',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'var(--sidebar-hover)'
                      e.currentTarget.style.color = '#ffffff'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'transparent'
                      e.currentTarget.style.color = 'var(--sidebar-text)'
                    }
                  }}
                >
                  <Icon size={16} strokeWidth={1.8} />
                  <span style={{ flex: 1 }}>{item.label}</span>
                  {isActive && <ChevronRight size={14} />}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div
        style={{
          padding: '16px 20px',
          borderTop: '1px solid var(--sidebar-border)',
          fontSize: '11px',
          color: 'var(--text-muted)',
        }}
      >
        v1.0.0 — {new Date().getFullYear()}
      </div>
    </aside>
  )
}