import Sidebar from '@/components/Sidebar'
import ChatFlotante from '@/components/ChatFlotante'
import { auth } from '@/auth'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  const nombreUsuario = session?.user?.name ?? ''
  const rol = session?.user?.rol ?? 'usuario'
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar nombreUsuario={nombreUsuario} rol={rol} />
      <main style={{
        marginLeft: '240px',
        flex: 1,
        minHeight: '100vh',
        backgroundColor: 'var(--background)',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {children}
      </main>
      <ChatFlotante />
    </div>
  )
}
