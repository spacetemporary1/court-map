import { createClient } from '@/lib/supabase/server'
import { CourtMapClient } from '@/components/map/CourtMapClient'

export const metadata = { title: 'Map – CourtFinder' }

export default async function MapPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: courts } = await supabase
    .from('courts')
    .select('*')
    .order('name')

  return (
    <CourtMapClient
      initialCourts={courts ?? []}
      userId={user!.id}
    />
  )
}
