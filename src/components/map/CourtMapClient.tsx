'use client'

import { useState, useCallback } from 'react'
import dynamic from 'next/dynamic'
import type { Court } from '@/types'
import { createClient } from '@/lib/supabase/client'

const CourtMap = dynamic(() => import('./CourtMap').then((m) => m.CourtMap), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-100">
      <div className="flex flex-col items-center gap-3 text-gray-500">
        <div className="animate-spin w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full" />
        <p className="text-sm">Loading map…</p>
      </div>
    </div>
  ),
})

interface CourtMapClientProps {
  initialCourts: Court[]
  userId: string
}

export function CourtMapClient({ initialCourts, userId }: CourtMapClientProps) {
  const [courts, setCourts] = useState<Court[]>(initialCourts)

  const refreshCourts = useCallback(async () => {
    const supabase = createClient()
    const { data } = await supabase.from('courts').select('*').order('name')
    if (data) setCourts(data)
  }, [])

  return (
    <div className="w-full h-full">
      <CourtMap courts={courts} userId={userId} onCourtsUpdate={refreshCourts} />
    </div>
  )
}
