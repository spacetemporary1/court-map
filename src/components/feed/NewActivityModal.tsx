'use client'

import { useState, useEffect, useRef } from 'react'
import { ImagePlus, X } from 'lucide-react'
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
  const [courtId, setCourtId]           = useState('')
  const [score, setScore]               = useState('')
  const [opponentName, setOpponentName] = useState('')
  const [description, setDescription]   = useState('')
  const [courts, setCourts]             = useState<Court[]>([])
  const [loading, setLoading]           = useState(false)
  const [error, setError]               = useState<string | null>(null)

  // Photo state
  const [photoFile, setPhotoFile]       = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const fileInputRef                    = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('courts')
      .select('*')
      .order('name')
      .then(({ data }) => setCourts(data ?? []))
  }, [])

  function handlePhotoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  function removePhoto() {
    setPhotoFile(null)
    setPhotoPreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabase = createClient()

    // Upload photo first if one was selected
    let imageUrl: string | null = null
    if (photoFile) {
      const ext  = photoFile.name.split('.').pop() ?? 'jpg'
      const path = `${userId}/${Date.now()}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('activity-photos')
        .upload(path, photoFile, { contentType: photoFile.type })

      if (uploadError) {
        setError(`Photo upload failed: ${uploadError.message}`)
        setLoading(false)
        return
      }
      imageUrl = supabase.storage.from('activity-photos').getPublicUrl(path).data.publicUrl
    }

    const { error } = await supabase.from('activities').insert({
      user_id:       userId,
      court_id:      courtId || null,
      activity_type: activityType,
      score:         score || null,
      opponent_name: opponentName || null,
      description:   description || null,
      image_url:     imageUrl,
      played_at:     new Date().toISOString(),
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

        {/* Photo picker */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">Photo (optional)</label>
          {photoPreview ? (
            <div className="relative rounded-xl overflow-hidden border border-gray-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photoPreview} alt="Preview" className="w-full max-h-48 object-cover" />
              <button
                type="button"
                onClick={removePhoto}
                className="absolute top-2 right-2 w-7 h-7 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center justify-center gap-2 h-20 rounded-xl border-2 border-dashed border-gray-200 text-gray-400 hover:border-green-400 hover:text-green-500 transition-colors text-sm"
            >
              <ImagePlus size={18} />
              Add a photo
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={handlePhotoSelect}
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
