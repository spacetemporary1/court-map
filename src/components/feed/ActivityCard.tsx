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
  checkin:  'checked in at',
  match:    'played a match at',
  practice: 'practiced at',
}

const activityLabelNoVenue = {
  checkin:  'checked in',
  match:    'played a match',
  practice: 'practiced',
}

const SURFACE_ACCENT: Record<string, string> = {
  hard:   '#C9E832',
  clay:   '#E07B3A',
  grass:  '#3CB34A',
  carpet: '#7B5EA7',
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
  const court   = activity.court
  const accent  = SURFACE_ACCENT[court?.surface ?? ''] ?? '#E2E8F0'

  return (
    <div
      className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
      style={{ borderLeft: `4px solid ${accent}` }}
    >
      <div className="p-4">
        {/* Header row */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center shrink-0 overflow-hidden">
            {profile?.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.avatar_url} alt={profile.username} className="w-full h-full object-cover" />
            ) : (
              <User size={18} className="text-green-600" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-baseline justify-between gap-2">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {profile?.full_name || profile?.username || 'Unknown'}
              </p>
              <span className="text-xs text-gray-400 shrink-0">{timeAgo(activity.played_at)}</span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              {court
                ? <><span>{activityLabels[activity.activity_type]}</span> <span className="font-medium text-gray-700">{court.name}</span></>
                : activityLabelNoVenue[activity.activity_type]
              }
            </p>
          </div>
        </div>

        {/* Score pill */}
        {activity.score && (
          <div className="mt-3 flex items-center gap-2 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2 w-fit">
            <Trophy size={13} className="text-amber-500 shrink-0" />
            <span className="text-sm font-bold text-amber-800">{activity.score}</span>
            {activity.opponent_name && (
              <span className="text-xs text-amber-600">vs {activity.opponent_name}</span>
            )}
          </div>
        )}

        {/* Description */}
        {activity.description && (
          <p className="mt-2 text-sm text-gray-600 leading-relaxed">{activity.description}</p>
        )}

        {/* Location chip (fallback if not in the header line) */}
        {!court && activity.court_id && (
          <div className="flex items-center gap-1 mt-2 text-xs text-gray-400">
            <MapPin size={11} />
            <span>Unknown court</span>
          </div>
        )}

        {/* Like button */}
        <button
          onClick={toggleLike}
          className={`flex items-center gap-1.5 mt-3 text-xs font-medium transition-colors ${
            liked ? 'text-red-500' : 'text-gray-400 hover:text-red-400'
          }`}
        >
          <Heart size={13} fill={liked ? 'currentColor' : 'none'} />
          <span>
            {likeCount > 0
              ? `${likeCount} ${likeCount === 1 ? 'like' : 'likes'}`
              : 'Like'}
          </span>
        </button>
      </div>

      {/* Activity photo */}
      {activity.image_url && (
        <div className="border-t border-gray-50">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={activity.image_url}
            alt="Activity photo"
            className="w-full max-h-80 object-cover"
          />
        </div>
      )}
    </div>
  )
}
