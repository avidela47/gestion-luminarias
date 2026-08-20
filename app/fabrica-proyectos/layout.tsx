import { auth } from '@/auth'
import { redirect } from 'next/navigation'

export default async function FabricaLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user) redirect('/login')
  return <div style={{ minHeight: '100vh', backgroundColor: '#0f1923' }}>{children}</div>
}
