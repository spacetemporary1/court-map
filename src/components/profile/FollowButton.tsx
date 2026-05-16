'use client'

import { useState } from 'react'
import { UserPlus, UserMinus } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface FollowButtonProps {
  currentUserId: string
  targetUserId: string
  initialIsFollowing: boolean
}

export function FollowButton({ currentUserId, targetUserId, initialIsFollowing }: FollowButtonProps) {
  const [following, setFollowing] = useState(initialIsFollowing)
  const [loading, setLoading]     = useState(false)

  async function toggle() {
    setLoading(true)
    const supabase = createClient()

    if (following) {
      await supabase
        .from('follows')
        .delete()
        .eq('follower_id', currentUserId)
        .eq('following_id', targetUserId)
      setFollowing(false)
    } else {
      await supabase
        .from('follows')
        .insert({ follower_id: currentUserId, following_id: targetUserId })
      setFollowing(true)
    }

    setLoading(false)
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
        following
          ? 'bg-gray-100 text-gray-700 hover:bg-red-50 hover:text-red-600 border border-gray-200'
          : 'bg-green-600 text-white hover:bg-green-700'
      }`}
    >
      {following ? (
        <><UserMinus size={15} /> Following</>
      ) : (
        <><UserPlus size={15} /> Follow</>
      )}
    </button>
  )
}
