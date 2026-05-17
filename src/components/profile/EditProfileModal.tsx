'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

interface EditProfileModalProps {
  userId: string
  initialLocation: string
  initialPlayers: string[]
  onClose: () => void
  onSaved: () => void
}

export function EditProfileModal({
  userId,
  initialLocation,
  initialPlayers,
  onClose,
  onSaved,
}: EditProfileModalProps) {
  const [location, setLocation] = useState(initialLocation)
  const [players, setPlayers]   = useState<[string, string, string]>([
    initialPlayers[0] ?? '',
    initialPlayers[1] ?? '',
    initialPlayers[2] ?? '',
  ])
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState<string | null>(null)

  function setPlayer(i: 0 | 1 | 2, val: string) {
    setPlayers((prev) => {
      const next = [...prev] as [string, string, string]
      next[i] = val
      return next
    })
  }

  async function handleSave() {
    setError(null)
    setLoading(true)

    const cleanPlayers = players.map((p) => p.trim()).filter(Boolean)

    const supabase = createClient()
    const { error } = await supabase
      .from('profiles')
      .update({ location: location.trim() || null, favorite_players: cleanPlayers })
      .eq('id', userId)

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    onSaved()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-gray-900">Edit profile</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <Input
            label="Location"
            placeholder="San Diego, CA"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">Favourite players (up to 3)</label>
            {([0, 1, 2] as const).map((i) => (
              <Input
                key={i}
                placeholder={i === 0 ? 'e.g. Roger Federer' : i === 1 ? 'e.g. Serena Williams' : 'e.g. Novak Djokovic'}
                value={players[i]}
                onChange={(e) => setPlayer(i, e.target.value)}
              />
            ))}
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex gap-3 pt-1">
            <Button variant="secondary" type="button" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSave} loading={loading} className="flex-1">
              Save
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
