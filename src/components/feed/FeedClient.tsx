'use client'

import { useState, useCallback } from 'react'
import { Plus, Rss } from 'lucide-react'
import type { Activity } from '@/types'
import { ActivityCard } from './ActivityCard'
import { NewActivityModal } from './NewActivityModal'
import { createClient } from '@/lib/supabase/client'

interface FeedClientProps {
  initialActivities: Activity[]
  userId: string
}

export function FeedClient({ initialActivities, userId }: FeedClientProps) {
  const [activities, setActivities] = useState<Activity[]>(initialActivities)
  const [showModal, setShowModal] = useState(false)

  const refreshFeed = useCallback(async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('activities')
      .select(`
        *,
        profile:profiles(*),
        court:courts(*),
        likes_count:activity_likes(count),
        user_has_liked:activity_likes!inner(user_id)
      `)
      .order('played_at', { ascending: false })
      .limit(50)

    if (data) {
      setActivities(
        data.map((a) => ({
          ...a,
          likes_count: (a.likes_count as unknown as { count: number }[])[0]?.count ?? 0,
          user_has_liked: Array.isArray(a.user_has_liked)
            ? a.user_has_liked.some((l: { user_id: string }) => l.user_id === userId)
            : false,
        }))
      )
    }
  }, [userId])

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Rss size={20} className="text-green-600" />
            <h1 className="text-xl font-bold text-gray-900">Activity Feed</h1>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Plus size={16} />
            Log activity
          </button>
        </div>

        {activities.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <div className="text-5xl mb-3">🎾</div>
            <p className="font-medium">No activities yet</p>
            <p className="text-sm mt-1">Be the first to log a match or check in to a court!</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {activities.map((activity) => (
              <ActivityCard key={activity.id} activity={activity} currentUserId={userId} />
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <NewActivityModal
          userId={userId}
          onClose={() => setShowModal(false)}
          onCreated={() => { setShowModal(false); refreshFeed() }}
        />
      )}
    </div>
  )
}
