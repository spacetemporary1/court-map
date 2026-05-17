'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { EditProfileModal } from './EditProfileModal'

interface ProfileClientProps {
  userId: string
  initialLocation: string
  initialPlayers: string[]
  children: React.ReactNode
}

export function ProfileClient({ userId, initialLocation, initialPlayers, children }: ProfileClientProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)

  function handleSaved() {
    setOpen(false)
    router.refresh()
  }

  return (
    <>
      <span onClick={() => setOpen(true)}>{children}</span>

      {open && (
        <EditProfileModal
          userId={userId}
          initialLocation={initialLocation}
          initialPlayers={initialPlayers}
          onClose={() => setOpen(false)}
          onSaved={handleSaved}
        />
      )}
    </>
  )
}
