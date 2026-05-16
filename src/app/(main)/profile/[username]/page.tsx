import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { MapPin, Trophy, User } from 'lucide-react'

interface PageProps {
  params: Promise<{ username: string }>
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

  const [{ data: activities }, { count: checkInCount }] = await Promise.all([
    supabase
      .from('activities')
      .select('*, court:courts(*)')
      .eq('user_id', profile.id)
      .order('played_at', { ascending: false })
      .limit(20),
    supabase
      .from('check_ins')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', profile.id),
  ])

  const matchCount = (activities ?? []).filter((a) => a.activity_type === 'match').length

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center overflow-hidden">
              {profile.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profile.avatar_url} alt={profile.username} className="w-full h-full object-cover" />
              ) : (
                <User size={28} className="text-green-600" />
              )}
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{profile.full_name || profile.username}</h1>
              <p className="text-gray-500 text-sm">@{profile.username}</p>
              {profile.bio && <p className="text-gray-600 text-sm mt-1">{profile.bio}</p>}
            </div>
          </div>

          <div className="flex gap-6 mt-5 pt-5 border-t border-gray-100">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{checkInCount ?? 0}</p>
              <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                <MapPin size={11} /> Check-ins
              </p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{matchCount}</p>
              <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                <Trophy size={11} /> Matches
              </p>
            </div>
          </div>
        </div>

        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Recent activity
        </h2>

        {(activities ?? []).length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p>No activities yet</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {(activities ?? []).map((a) => (
              <div key={a.id} className="bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 capitalize">{a.activity_type}</span>
                  <span className="text-xs text-gray-400">
                    {new Date(a.played_at).toLocaleDateString()}
                  </span>
                </div>
                {a.court && (
                  <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                    <MapPin size={11} /> {a.court.name}
                  </p>
                )}
                {a.score && (
                  <p className="text-sm font-semibold text-yellow-700 mt-1">
                    {a.score}{a.opponent_name && ` vs ${a.opponent_name}`}
                  </p>
                )}
                {a.description && (
                  <p className="text-sm text-gray-600 mt-1">{a.description}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
