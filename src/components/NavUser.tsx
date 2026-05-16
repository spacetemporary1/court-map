'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { User, LogOut, ChevronDown } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface NavUserProps {
  userId: string
  username: string
  avatarUrl: string | null
}

export function NavUser({ userId, username, avatarUrl }: NavUserProps) {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium text-gray-700"
      >
        <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center overflow-hidden">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt={username} className="w-full h-full object-cover" />
          ) : (
            <User size={15} className="text-green-600" />
          )}
        </div>
        <span className="hidden sm:block">{username || 'Profile'}</span>
        <ChevronDown size={14} className="text-gray-400" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1.5 w-44 bg-white rounded-xl shadow-lg border border-gray-100 z-50 py-1.5 overflow-hidden">
            <Link
              href={`/profile/${username}`}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <User size={15} />
              Profile
            </Link>
            <hr className="my-1 border-gray-100" />
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2.5 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 text-left"
            >
              <LogOut size={15} />
              Sign out
            </button>
          </div>
        </>
      )}
    </div>
  )
}
