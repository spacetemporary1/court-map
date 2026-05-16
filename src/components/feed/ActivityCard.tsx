'use client'

import { useState } from 'react'
import { MapPin, Trophy, Heart, User } from 'lucide-react'
import type { Activity } from '@/types'
import { createClient } from '@/lib/supabase/client'

interface ActivityCardProps {
  activity: Activity
  currentUserId: string
}

const activityLabels = {
  checkin: 'checked in',
  match: 'played a match',
  practice: 'practiced',
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString()
}

export function ActivityCard({ activity, currentUserId }: ActivityCardProps) {
  const [liked, setLiked] = useState(activity.user_has_liked ?? false)
  const [likeCount, setLikeCount] = useState(activity.likes_count ?? 0)

  async function toggleLike() {
    const supabase = createClient()
    if (liked) {
      await supabase
        .from('activity_likes')
        .delete()
        .eq('activity_id', activity.id)
        .eq('user_id', currentUserId)
      setLiked(false)
      setLikeCount((c) => c - 1)
    } else {
      await supabase
        .from('activity_likes')
        .insert({ activity_id: activity.id, user_id: currentUserId })
      setLiked(true)
      setLikeCount((c) => c + 1)
    }
  }

  const profile = activity.profile
  const court = activity.court

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center shrink-0 overflow-hidden">
          {profile?.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profile.avatar_url} alt={profile.username} className="w-full h-full object-cover" />
          ) : (
            <User size={20} className="text-green-600" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-baseline justify-between gap-2 flex-wrap">
            <p className="text-sm font-semibold text-gray-900">
              {profile?.full_name || profile?.username || 'Unknown'}
              <span className="font-normal text-gray-500 ml-1">
                {activityLabels[activity.activity_type]}
              </span>
            </p>
            <span className="text-xs text-gray-400 shrink-0">{timeAgo(activity.played_at)}</span>
          </div>

          {court && (
            <div className="flex items-center gap-1.5 mt-1 text-xs text-gray-500">
              <MapPin size={12} />
              <span className="truncate">{court.name}</span>
            </div>
          )}

          {activity.score && (
            <div className="flex items-center gap-1.5 mt-2 px-3 py-1.5 bg-yellow-50 rounded-lg w-fit">
              <Trophy size={13} className="text-yellow-600" />
              <span className="text-sm font-semibold text-yellow-800">{activity.score}</span>
              {activity.opponent_name && (
                <span className="text-xs text-yellow-600">vs {activity.opponent_name}</span>
              )}
            </div>
          )}

          {activity.description && (
            <p className="mt-2 text-sm text-gray-600">{activity.description}</p>
          )}

          <button
            onClick={toggleLike}
            className={`flex items-center gap-1.5 mt-3 text-xs font-medium transition-colors ${
              liked ? 'text-red-500' : 'text-gray-400 hover:text-red-400'
            }`}
          >
            <Heart size={14} fill={liked ? 'currentColor' : 'none'} />
            <span>{likeCount > 0 ? likeCount : ''} {likeCount === 1 ? 'like' : likeCount > 1 ? 'likes' : 'Like'}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
