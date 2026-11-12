import AppShell from '@/components/AppShell'
import ChatFlotante from '@/components/ChatFlotante'
import { auth } from '@/auth'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  const nombreUsuario = session?.user?.name ?? ''
  const rol = session?.user?.rol ?? 'usuario'
  return (
    <>
      <AppShell nombreUsuario={nombreUsuario} rol={rol}>
        {children}
      </AppShell>
      <ChatFlotante />
    </>
  )
}
