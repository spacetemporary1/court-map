'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import type { Court } from '@/types'

interface NewActivityModalProps {
  userId: string
  onClose: () => void
  onCreated: () => void
}

export function NewActivityModal({ userId, onClose, onCreated }: NewActivityModalProps) {
  const [activityType, setActivityType] = useState<'checkin' | 'match' | 'practice'>('match')
  const [courtId, setCourtId] = useState('')
  const [score, setScore] = useState('')
  const [opponentName, setOpponentName] = useState('')
  const [description, setDescription] = useState('')
  const [courts, setCourts] = useState<Court[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('courts')
      .select('*')
      .order('name')
      .then(({ data }) => setCourts(data ?? []))
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.from('activities').insert({
      user_id: userId,
      court_id: courtId || null,
      activity_type: activityType,
      score: score || null,
      opponent_name: opponentName || null,
      description: description || null,
      played_at: new Date().toISOString(),
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    onCreated()
  }

  return (
    <Modal open title="Log activity" onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">Activity type</label>
          <div className="grid grid-cols-3 gap-2">
            {(['match', 'practice', 'checkin'] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setActivityType(type)}
                className={`py-2 rounded-lg text-sm font-medium border transition-colors capitalize ${
                  activityType === type
                    ? 'bg-green-600 text-white border-green-600'
                    : 'bg-white text-gray-600 border-gray-300 hover:border-green-400'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">Court (optional)</label>
          <select
            className="px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
            value={courtId}
            onChange={(e) => setCourtId(e.target.value)}
          >
            <option value="">Select a court...</option>
            {courts.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {activityType === 'match' && (
          <>
            <Input
              label="Score (optional)"
              placeholder="6-4, 7-5"
              value={score}
              onChange={(e) => setScore(e.target.value)}
            />
            <Input
              label="Opponent (optional)"
              placeholder="John Doe"
              value={opponentName}
              onChange={(e) => setOpponentName(e.target.value)}
            />
          </>
        )}

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">Notes (optional)</label>
          <textarea
            className="px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
            placeholder="How did it go?"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <div className="flex gap-3 pt-2">
          <Button variant="secondary" type="button" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button type="submit" loading={loading} className="flex-1">
            Post
          </Button>
        </div>
      </form>
    </Modal>
  )
}
