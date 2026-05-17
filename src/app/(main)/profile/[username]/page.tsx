import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { MapPin, Trophy, User, Bookmark, Star, Pencil } from 'lucide-react'
import type { Court } from '@/types'
import { FollowButton } from '@/components/profile/FollowButton'
import { ProfileClient } from '@/components/profile/ProfileClient'

interface PageProps {
  params: Promise<{ username: string }>
}

const SURFACE_ACCENT: Record<string, string> = {
  hard:   '#C9E832',
  clay:   '#E07B3A',
  grass:  '#3CB34A',
  carpet: '#7B5EA7',
}

const SURFACE_LABEL: Record<string, string> = {
  hard: 'Hard', clay: 'Clay', grass: 'Grass', carpet: 'Carpet',
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

    supabase
      .from('check_ins')
      .select('court_id, court:courts(id, name, surface, address)')
      .eq('user_id', profile.id),

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

    currentUser && !isOwnProfile
      ? supabase
          .from('follows')
          .select('follower_id')
          .eq('follower_id', currentUser.id)
          .eq('following_id', profile.id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ])

  // Compute unique courts visited with visit count
  const courtVisitMap = new Map<string, { court: Court; count: number }>()
  for (const ci of checkInsData ?? []) {
    const court = ci.court as unknown as Court | null
    if (!court) continue
    const existing = courtVisitMap.get(court.id)
    if (existing) existing.count++
    else courtVisitMap.set(court.id, { court, count: 1 })
  }
  const visitedCourts = [...courtVisitMap.values()].sort((a, b) => b.count - a.count)
  const topCourts     = visitedCourts.slice(0, 3)

  const bookmarkedCourts = (bookmarksData ?? [])
    .map((b) => b.court as unknown as Court | null)
    .filter(Boolean) as Court[]

  const matchCount   = (activities ?? []).filter((a) => a.activity_type === 'match').length
  const isFollowing  = !!followRow
  const favPlayers   = (profile.favorite_players as string[] | null) ?? []
  const location     = (profile.location as string | null) ?? ''

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
                {location && (
                  <p className="text-gray-500 text-xs mt-0.5 flex items-center gap-1">
                    <MapPin size={11} /> {location}
                  </p>
                )}
                {profile.bio && (
                  <p className="text-gray-600 text-sm mt-1 leading-snug">{profile.bio}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {isOwnProfile && (
                <ProfileClient
                  userId={profile.id}
                  initialLocation={location}
                  initialPlayers={favPlayers}
                >
                  <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors">
                    <Pencil size={13} /> Edit
                  </button>
                </ProfileClient>
              )}
              {!isOwnProfile && currentUser && (
                <FollowButton
                  currentUserId={currentUser.id}
                  targetUserId={profile.id}
                  initialIsFollowing={isFollowing}
                />
              )}
            </div>
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

        {/* ── Collect-em-all courts ─────────────────────────────────── */}
        {visitedCourts.length > 0 && (
          <section>
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1">
              Courts visited · {visitedCourts.length}
            </h2>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <div className="flex flex-wrap gap-2">
                {visitedCourts.slice(0, 20).map(({ court, count }) => {
                  const accent = SURFACE_ACCENT[court.surface ?? ''] ?? '#94A3B8'
                  return (
                    <div
                      key={court.id}
                      title={`${court.name}${count > 1 ? ` · ${count} visits` : ''}`}
                      className="group relative"
                    >
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-base shadow-sm ring-2 ring-white cursor-default select-none"
                        style={{ backgroundColor: accent }}
                      >
                        🎾
                      </div>
                      {count > 1 && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-gray-900 text-white text-[9px] font-bold flex items-center justify-center leading-none">
                          {count > 9 ? '9+' : count}
                        </span>
                      )}
                    </div>
                  )
                })}
                {visitedCourts.length > 20 && (
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-xs font-semibold text-gray-500 ring-2 ring-white">
                    +{visitedCourts.length - 20}
                  </div>
                )}
              </div>

              {/* Top 3 detail rows */}
              {topCourts.length > 0 && (
                <div className="mt-4 pt-3 border-t border-gray-50 space-y-2">
                  {topCourts.map(({ court, count }, i) => (
                    <div key={court.id} className="flex items-center gap-3">
                      <span className="text-xs font-bold text-gray-300 w-4 shrink-0">#{i + 1}</span>
                      <div
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: SURFACE_ACCENT[court.surface ?? ''] ?? '#94A3B8' }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{court.name}</p>
                        {court.surface && (
                          <p className="text-xs text-gray-400">{SURFACE_LABEL[court.surface]}</p>
                        )}
                      </div>
                      <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full shrink-0">
                        {count}×
                      </span>
                    </div>
                  ))}
                </div>
              )}
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
                      <p className="text-xs text-gray-400 truncate mt-0.5">
                        {court.address.split(',').slice(0, 2).join(',')}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Favourite players ─────────────────────────────────────── */}
        {favPlayers.length > 0 && (
          <section>
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1 flex items-center gap-1.5">
              <Star size={11} /> Favourite players
            </h2>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <div className="flex flex-wrap gap-2">
                {favPlayers.map((player) => (
                  <div
                    key={player}
                    className="flex items-center gap-2 px-3 py-2 rounded-full bg-amber-50 border border-amber-100"
                  >
                    <Star size={12} className="text-amber-400" fill="currentColor" />
                    <span className="text-sm font-medium text-amber-800">{player}</span>
                  </div>
                ))}
              </div>
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
                    className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
                    style={{ borderLeft: `3px solid ${accent}` }}
                  >
                    <div className="px-4 py-3">
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
                    {a.image_url && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={a.image_url} alt="Activity photo" className="w-full max-h-60 object-cover" />
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
