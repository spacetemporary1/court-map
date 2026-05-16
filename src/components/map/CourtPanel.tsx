'use client'

import { useState, useEffect } from 'react'
import { MapPin, Users, Check, X, Wifi, WifiOff, Bookmark } from 'lucide-react'
import type { Court } from '@/types'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'

interface CourtPanelProps {
  court: Court
  userId: string
  onClose: () => void
  onUpdate: () => void
}

const surfaceLabels: Record<string, string> = {
  hard: 'Hard',
  clay: 'Clay',
  grass: 'Grass',
  carpet: 'Carpet',
}

export function CourtPanel({ court, userId, onClose, onUpdate }: CourtPanelProps) {
  const [loading, setLoading] = useState(false)
  const [checked, setChecked] = useState(false)
  const [bookmarked, setBookmarked] = useState(false)
  const [bookmarkLoading, setBookmarkLoading] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('court_bookmarks')
      .select('court_id')
      .eq('user_id', userId)
      .eq('court_id', court.id)
      .maybeSingle()
      .then(({ data }) => setBookmarked(!!data))
  }, [userId, court.id])

  async function handleCheckIn() {
    setLoading(true)
    const supabase = createClient()

    const { error } = await supabase.from('check_ins').insert({
      user_id: userId,
      court_id: court.id,
    })

    if (!error) {
      await supabase.from('activities').insert({
        user_id: userId,
        court_id: court.id,
        activity_type: 'checkin',
        played_at: new Date().toISOString(),
      })
      setChecked(true)
      onUpdate()
    }

    setLoading(false)
  }

  async function toggleBookmark() {
    setBookmarkLoading(true)
    const supabase = createClient()
    if (bookmarked) {
      await supabase
        .from('court_bookmarks')
        .delete()
        .eq('user_id', userId)
        .eq('court_id', court.id)
      setBookmarked(false)
    } else {
      await supabase
        .from('court_bookmarks')
        .insert({ user_id: userId, court_id: court.id })
      setBookmarked(true)
    }
    setBookmarkLoading(false)
  }

  return (
    <div className="w-72 text-sm">
      <div className="flex items-start justify-between gap-2 mb-3">
        <h3 className="font-semibold text-gray-900 leading-tight">{court.name}</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 shrink-0">
          <X size={16} />
        </button>
      </div>

      {court.address && (
        <div className="flex items-start gap-1.5 text-gray-500 mb-3">
          <MapPin size={14} className="mt-0.5 shrink-0" />
          <span>{court.address}</span>
        </div>
      )}

      <div className="flex flex-wrap gap-2 mb-4">
        {court.surface && (
          <span className="px-2 py-0.5 rounded-full bg-green-50 text-green-700 text-xs font-medium">
            {surfaceLabels[court.surface] ?? court.surface}
          </span>
        )}
        {court.num_courts && (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-medium">
            <Users size={11} />
            {court.num_courts} {court.num_courts === 1 ? 'court' : 'courts'}
          </span>
        )}
        <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
          court.is_public ? 'bg-gray-100 text-gray-600' : 'bg-orange-50 text-orange-700'
        }`}>
          {court.is_public ? 'Public' : 'Private'}
        </span>
        <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
          court.is_indoor ? 'bg-purple-50 text-purple-700' : 'bg-sky-50 text-sky-700'
        }`}>
          {court.is_indoor ? <><Wifi size={11} /> Indoor</> : <><WifiOff size={11} /> Outdoor</>}
        </span>
      </div>

      <div className="flex gap-2">
        {checked ? (
          <div className="flex items-center gap-2 text-green-700 bg-green-50 rounded-lg px-3 py-2 flex-1">
            <Check size={16} />
            <span className="font-medium">Checked in!</span>
          </div>
        ) : (
          <Button onClick={handleCheckIn} loading={loading} className="flex-1">
            Check in here
          </Button>
        )}

        <button
          onClick={toggleBookmark}
          disabled={bookmarkLoading}
          title={bookmarked ? 'Remove from want-to-play list' : 'Add to want-to-play list'}
          className={`flex items-center justify-center w-10 h-10 rounded-lg border transition-colors ${
            bookmarked
              ? 'bg-amber-50 border-amber-200 text-amber-600 hover:bg-amber-100'
              : 'bg-white border-gray-200 text-gray-400 hover:border-gray-300 hover:text-gray-600'
          }`}
        >
          <Bookmark size={16} fill={bookmarked ? 'currentColor' : 'none'} />
        </button>
      </div>
    </div>
  )
}
