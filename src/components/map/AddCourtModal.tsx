'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

interface AddCourtModalProps {
  coord: { lat: number; lng: number }
  userId: string
  onClose: () => void
  onCreated: () => void
}

export function AddCourtModal({ coord, userId, onClose, onCreated }: AddCourtModalProps) {
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [surface, setSurface] = useState<string>('')
  const [numCourts, setNumCourts] = useState('')
  const [isIndoor, setIsIndoor] = useState(false)
  const [isPublic, setIsPublic] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.from('courts').insert({
      name,
      address: address || null,
      lat: coord.lat,
      lng: coord.lng,
      surface: surface || null,
      num_courts: numCourts ? parseInt(numCourts) : null,
      is_indoor: isIndoor,
      is_public: isPublic,
      added_by: userId,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    onCreated()
  }

  return (
    <Modal open title="Add tennis court" onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
          📍 {coord.lat.toFixed(5)}, {coord.lng.toFixed(5)}
        </div>

        <Input
          label="Court name *"
          placeholder="Central Park Tennis Courts"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <Input
          label="Address"
          placeholder="123 Main St, New York, NY"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">Surface</label>
          <select
            className="px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
            value={surface}
            onChange={(e) => setSurface(e.target.value)}
          >
            <option value="">Unknown</option>
            <option value="hard">Hard</option>
            <option value="clay">Clay</option>
            <option value="grass">Grass</option>
            <option value="carpet">Carpet</option>
          </select>
        </div>

        <Input
          label="Number of courts"
          type="number"
          min="1"
          placeholder="4"
          value={numCourts}
          onChange={(e) => setNumCourts(e.target.value)}
        />

        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isIndoor}
              onChange={(e) => setIsIndoor(e.target.checked)}
              className="rounded border-gray-300 text-green-600 focus:ring-green-500"
            />
            <span className="text-sm text-gray-700">Indoor</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="rounded border-gray-300 text-green-600 focus:ring-green-500"
            />
            <span className="text-sm text-gray-700">Public access</span>
          </label>
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
            Add court
          </Button>
        </div>
      </form>
    </Modal>
  )
}
