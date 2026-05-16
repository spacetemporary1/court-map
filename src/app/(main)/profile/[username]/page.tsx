import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { MapPin, Trophy, User, Bookmark } from 'lucide-react'
import type { Court } from '@/types'
import { FollowButton } from '@/components/profile/FollowButton'

interface PageProps {
  params: Promise<{ username: string }>
}

const SURFACE_ACCENT: Record<string, string> = {
  hard:   '#C9E832',
  clay:   '#E07B3A',
  grass:  '#3CB34A',
  carpet: '#7B5EA7',
}

function activityLabel(type: string) {
  if (type === 'match')    return 'Match'
  if (type === 'practice') return 'Practice'
  return 'Check-in'
}

export default async function ProfilePage({ params }: PageProps) {
  const { username } = await params
  const supabase = await createClient()
  const { data: { user: currentUser } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single()

  if (!profile) notFound()

  const isOwnProfile = currentUser?.id === profile.id

  // Parallel data fetches
  const [
    { data: activities },
    { data: checkInsData },
    { data: bookmarksData },
    { count: followerCount },
    { count: followingCount },
    { data: followRow },
  ] = await Promise.all([
    supabase
      .from('activities')
      .select('*, court:courts(*)')
      .eq('user_id', profile.id)
      .order('played_at', { ascending: false })
      .limit(20),

    // All check-ins to compute top courts
    supabase
      .from('check_ins')
      .select('court_id, court:courts(id, name, surface, address)')
      .eq('user_id', profile.id),

    // Top 3 bookmarks
    supabase
      .from('court_bookmarks')
      .select('court:courts(id, name, surface, address)')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false })
      .limit(3),

    supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('following_id', profile.id),

    supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('follower_id', profile.id),

    // Is current user following this profile?
    currentUser && !isOwnProfile
      ? supabase
          .from('follows')
          .select('follower_id')
          .eq('follower_id', currentUser.id)
          .eq('following_id', profile.id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ])

  // Compute top 3 courts by check-in count
  const courtVisitMap = new Map<string, { court: Court; count: number }>()
  for (const ci of checkInsData ?? []) {
    const court = ci.court as unknown as Court | null
    if (!court) continue
    const existing = courtVisitMap.get(court.id)
    if (existing) existing.count++
    else courtVisitMap.set(court.id, { court, count: 1 })
  }
  const topCourts = [...courtVisitMap.values()]
    .sort((a, b) => b.count - a.count)
    .slice(0, 3)

  const bookmarkedCourts = (bookmarksData ?? [])
    .map((b) => b.court as unknown as Court | null)
    .filter(Boolean) as Court[]

  const matchCount = (activities ?? []).filter((a) => a.activity_type === 'match').length
  const isFollowing = !!followRow

  return (
    <div className="h-full overflow-y-auto bg-gray-50">
      <div className="max-w-xl mx-auto px-4 py-8 space-y-5">

        {/* ── Profile card ─────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center overflow-hidden shrink-0">
                {profile.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={profile.avatar_url} alt={profile.username} className="w-full h-full object-cover" />
                ) : (
                  <User size={28} className="text-green-600" />
                )}
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {profile.full_name || profile.username}
                </h1>
                <p className="text-gray-400 text-sm">@{profile.username}</p>
                {profile.bio && (
                  <p className="text-gray-600 text-sm mt-1 leading-snug">{profile.bio}</p>
                )}
              </div>
            </div>

            {!isOwnProfile && currentUser && (
              <FollowButton
                currentUserId={currentUser.id}
                targetUserId={profile.id}
                initialIsFollowing={isFollowing}
              />
            )}
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-4 gap-3 mt-5 pt-5 border-t border-gray-100 text-center">
            <div>
              <p className="text-xl font-bold text-gray-900">{checkInsData?.length ?? 0}</p>
              <p className="text-xs text-gray-500 mt-0.5 flex items-center justify-center gap-1">
                <MapPin size={10} /> Check-ins
              </p>
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900">{matchCount}</p>
              <p className="text-xs text-gray-500 mt-0.5 flex items-center justify-center gap-1">
                <Trophy size={10} /> Matches
              </p>
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900">{followerCount ?? 0}</p>
              <p className="text-xs text-gray-500 mt-0.5">Followers</p>
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900">{followingCount ?? 0}</p>
              <p className="text-xs text-gray-500 mt-0.5">Following</p>
            </div>
          </div>
        </div>

        {/* ── Top favourite courts ──────────────────────────────────── */}
        {topCourts.length > 0 && (
          <section>
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1">
              Favourite courts
            </h2>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50">
              {topCourts.map(({ court, count }, i) => (
                <div
                  key={court.id}
                  className="flex items-center gap-3 px-4 py-3"
                  style={{ borderLeft: `3px solid ${SURFACE_ACCENT[court.surface ?? ''] ?? '#E2E8F0'}` }}
                >
                  <span className="text-xs font-bold text-gray-300 w-4">#{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{court.name}</p>
                    {court.address && (
                      <p className="text-xs text-gray-400 truncate mt-0.5">{court.address.split(',').slice(0, 2).join(',')}</p>
                    )}
                  </div>
                  <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full shrink-0">
                    {count}×
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Want to play (bookmarks) ──────────────────────────────── */}
        {bookmarkedCourts.length > 0 && (
          <section>
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1 flex items-center gap-1.5">
              <Bookmark size={11} /> Want to play
            </h2>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50">
              {bookmarkedCourts.map((court) => (
                <div
                  key={court.id}
                  className="flex items-center gap-3 px-4 py-3"
                  style={{ borderLeft: `3px solid ${SURFACE_ACCENT[court.surface ?? ''] ?? '#E2E8F0'}` }}
                >
                  <Bookmark size={14} className="text-amber-400 shrink-0" fill="currentColor" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{court.name}</p>
                    {court.address && (
                      <p className="text-xs text-gray-400 truncate mt-0.5">{court.address.split(',').slice(0, 2).join(',')}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Recent activity ───────────────────────────────────────── */}
        <section>
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1">
            Recent activity
          </h2>

          {(activities ?? []).length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <p className="text-sm">No activities yet</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {(activities ?? []).map((a) => {
                const surface = (a.court as unknown as Court | null)?.surface
                const accent  = SURFACE_ACCENT[surface ?? ''] ?? '#E2E8F0'
                return (
                  <div
                    key={a.id}
                    className="bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3"
                    style={{ borderLeft: `3px solid ${accent}` }}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        {activityLabel(a.activity_type)}
                      </span>
                      <span className="text-xs text-gray-400 shrink-0">
                        {new Date(a.played_at).toLocaleDateString()}
                      </span>
                    </div>
                    {(a.court as unknown as Court | null) && (
                      <p className="text-sm font-medium text-gray-800 mt-0.5 flex items-center gap-1">
                        <MapPin size={11} className="text-gray-400 shrink-0" />
                        {(a.court as unknown as Court).name}
                      </p>
                    )}
                    {a.score && (
                      <p className="text-sm font-semibold text-amber-700 mt-1 flex items-center gap-1">
                        <Trophy size={11} className="text-amber-500 shrink-0" />
                        {a.score}{a.opponent_name && ` vs ${a.opponent_name}`}
                      </p>
                    )}
                    {a.description && (
                      <p className="text-sm text-gray-600 mt-1">{a.description}</p>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </section>

      </div>
    </div>
  )
}
