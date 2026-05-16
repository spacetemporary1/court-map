export interface Profile {
  id: string
  username: string
  full_name: string | null
  avatar_url: string | null
  bio: string | null
  created_at: string
}

export interface Court {
  id: string
  name: string
  address: string | null
  lat: number
  lng: number
  surface: 'hard' | 'clay' | 'grass' | 'carpet' | null
  num_courts: number | null
  is_indoor: boolean
  is_public: boolean
  added_by: string | null
  created_at: string
}

export interface CheckIn {
  id: string
  user_id: string
  court_id: string
  checked_in_at: string
  court?: Court
  profile?: Profile
}

export interface Activity {
  id: string
  user_id: string
  court_id: string | null
  activity_type: 'checkin' | 'match' | 'practice'
  description: string | null
  score: string | null
  opponent_name: string | null
  played_at: string
  created_at: string
  court?: Court
  profile?: Profile
  likes_count?: number
  user_has_liked?: boolean
}

export interface Follow {
  follower_id: string
  following_id: string
  created_at: string
}
