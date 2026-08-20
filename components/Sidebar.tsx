'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import {
  LayoutDashboard, Package, Cpu, Factory, ArrowLeftRight,
  Users, Truck, FileText, Receipt, BarChart3, ChevronRight,
  ClipboardList, LogOut, Zap, Lightbulb, ClipboardCheck, Shield, Wrench, PackageCheck, Radio,
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
            { label: 'Vales', href: '/vales', icon: ClipboardCheck },
      { label: 'Proyectos Fábrica', href: '/proyectos', icon: Radio },
    ],
  },
  {
    grupo: 'STOCK',
    items: [
      { label: 'Sensores y Fuentes', href: '/sensores', icon: Zap },
      { label: 'Luminarias', href: '/luminarias', icon: Lightbulb },
      { label: 'Herramientas', href: '/herramientas', icon: Wrench },
    ],
  },
  {
  grupo: 'COMERCIAL',
  items: [
    { label: 'Clientes', href: '/clientes', icon: Users },
    { label: 'Proveedores', href: '/proveedores', icon: Truck },
    { label: 'Presupuestos', href: '/presupuestos', icon: FileText },
    { label: 'Órdenes de Trabajo', href: '/ordenes', icon: ClipboardList },
    { label: 'Recibos', href: '/recibos', icon: Receipt },
    { label: 'Despachos', href: '/despachos', icon: PackageCheck },
  ],
},
  {
    grupo: 'REPORTES',
    items: [
      { label: 'Reportes', href: '/reportes', icon: BarChart3 },
      { label: 'Auditoría', href: '/auditoria', icon: Shield },
    ],
  },
]

export default function Sidebar({ nombreUsuario }: { nombreUsuario: string }) {
  const pathname = usePathname()

  return (
    <aside style={{
      width: '240px', minHeight: '100vh',
      backgroundColor: 'var(--sidebar-bg)',
      borderRight: '1px solid var(--sidebar-border)',
      display: 'flex', flexDirection: 'column',
      position: 'fixed', top: 0, left: 0, bottom: 0,
      zIndex: 50, overflowY: 'auto',
    }}>
      <div style={{
        padding: '24px 20px 20px',
        borderBottom: '1px solid var(--sidebar-border)',
        display: 'flex', alignItems: 'center', gap: '12px',
      }}>
        <Image src="/logo.png" alt="ITELSA SAS" width={128} height={128}
          style={{ objectFit: 'contain', borderRadius: '8px' }} />
        <div>
          {nombreUsuario && (
            <div style={{ color: '#94a3b8', fontSize: '11px', marginTop: '4px', fontWeight: 500 }}>
              {nombreUsuario}
            </div>
          )}
        </div>
      </div>

      <nav style={{ flex: 1, padding: '16px 0' }}>
        {menuItems.map((grupo) => (
          <div key={grupo.grupo} style={{ marginBottom: '8px' }}>
            <div style={{
              padding: '8px 20px 4px', fontSize: '10px', fontWeight: 600,
              letterSpacing: '1.2px', color: 'var(--text-muted)',
            }}>
              {grupo.grupo}
            </div>
            {grupo.items.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <Link key={item.href} href={item.href}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '9px 20px', margin: '1px 8px', borderRadius: '6px',
                    textDecoration: 'none', fontSize: '13.5px',
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

      <div style={{
        padding: '16px 20px',
        borderTop: '1px solid var(--sidebar-border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
          v1.0.0 — {new Date().getFullYear()}
        </div>
        <button onClick={() => signOut({ callbackUrl: '/login' })}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: '11px', color: 'var(--text-muted)',
            display: 'flex', alignItems: 'center', gap: '4px', padding: '4px',
          }}
          title="Cerrar sesión"
        >
          <LogOut size={13} /> Salir
        </button>
      </div>
    </aside>
  )
}