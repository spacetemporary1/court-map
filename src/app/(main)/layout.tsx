import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { NavUser } from '@/components/NavUser'

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('username, avatar_url')
    .eq('id', user.id)
    .single()

  return (
    <div className="h-full flex flex-col">
      <header className="h-14 bg-white border-b border-gray-200 flex items-center px-4 gap-4 shrink-0 z-10">
        <Link href="/map" className="flex items-center gap-2 font-bold text-gray-900 text-lg">
          🎾 <span>CourtFinder</span>
        </Link>

        <nav className="flex items-center gap-1 ml-2">
          <Link
            href="/map"
            className="px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
          >
            Map
          </Link>
          <Link
            href="/feed"
            className="px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
          >
            Feed
          </Link>
        </nav>

        <div className="ml-auto">
          <NavUser userId={user.id} username={profile?.username ?? ''} avatarUrl={profile?.avatar_url ?? null} />
        </div>
      </header>

      <main className="flex-1 overflow-hidden">{children}</main>
    </div>
  )
}
