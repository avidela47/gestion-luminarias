import Sidebar from '@/components/Sidebar'
import ChatFlotante from '@/components/ChatFlotante'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
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