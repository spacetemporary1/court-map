import { createClient } from '@/lib/supabase/server'
import { FeedClient } from '@/components/feed/FeedClient'

export const metadata = { title: 'Feed – CourtFinder' }

export default async function FeedPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: activities } = await supabase
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

  // Normalize the aggregates Supabase returns
  const normalized = (activities ?? []).map((a) => ({
    ...a,
    likes_count: (a.likes_count as unknown as { count: number }[])[0]?.count ?? 0,
    user_has_liked: Array.isArray(a.user_has_liked)
      ? a.user_has_liked.some((l: { user_id: string }) => l.user_id === user!.id)
      : false,
  }))

  return <FeedClient initialActivities={normalized} userId={user!.id} />
}
