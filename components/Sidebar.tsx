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
      { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, soloAdmin: false },
      { label: 'Componentes', href: '/componentes', icon: Cpu, soloAdmin: false },
      { label: 'Recetas (BOM)', href: '/recetas', icon: Package, soloAdmin: false },
      { label: 'Fabricar', href: '/fabricar', icon: Factory, soloAdmin: false },
      { label: 'Movimientos', href: '/movimientos', icon: ArrowLeftRight, soloAdmin: true },
      { label: 'Vales', href: '/vales', icon: ClipboardCheck, soloAdmin: false },
      { label: 'Proyectos Fábrica', href: '/fabrica-proyectos', icon: Radio, soloAdmin: false },
    ],
  },
  {
    grupo: 'STOCK',
    items: [
      { label: 'Sensores y Fuentes', href: '/sensores', icon: Zap, soloAdmin: false },
      { label: 'Luminarias', href: '/luminarias', icon: Lightbulb, soloAdmin: false },
      { label: 'Herramientas', href: '/herramientas', icon: Wrench, soloAdmin: false },
    ],
  },
  {
    grupo: 'COMERCIAL',
    items: [
      { label: 'Clientes', href: '/clientes', icon: Users, soloAdmin: true },
      { label: 'Proveedores', href: '/proveedores', icon: Truck, soloAdmin: true },
      { label: 'Presupuestos', href: '/presupuestos', icon: FileText, soloAdmin: true },
      { label: 'Órdenes de Trabajo', href: '/ordenes', icon: ClipboardList, soloAdmin: true },
      { label: 'Recibos', href: '/recibos', icon: Receipt, soloAdmin: true },
      { label: 'Despachos', href: '/despachos', icon: PackageCheck, soloAdmin: true },
    ],
  },
  {
    grupo: 'REPORTES',
    items: [
      { label: 'Reportes', href: '/reportes', icon: BarChart3, soloAdmin: true },
      { label: 'Auditoría', href: '/auditoria', icon: Shield, soloAdmin: true },
    ],
  },
]

export default function Sidebar({ nombreUsuario, rol }: { nombreUsuario: string; rol: string }) {
  const pathname = usePathname()
  const esAdmin = rol === 'admin'

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
        {menuItems.map((grupo) => {
          const itemsVisibles = grupo.items.filter((item) => esAdmin || !item.soloAdmin)
          if (itemsVisibles.length === 0) return null
          return (
            <div key={grupo.grupo} style={{ marginBottom: '8px' }}>
              <div style={{
                padding: '8px 20px 4px', fontSize: '10px', fontWeight: 600,
                letterSpacing: '1.2px', color: 'var(--text-muted)',
              }}>
                {grupo.grupo}
              </div>
              {itemsVisibles.map((item) => {
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
          )
        })}
      </nav>

      <div style={{
        padding: '16px 20px',
        borderTop: '1px solid var(--sidebar-border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
          v1.0.0 — {new Date().getFullYear()}
        </div>
        <button onClick={async () => {
          await signOut({ redirect: false })
          window.location.href = '/login'
        }}
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