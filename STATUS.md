# CourtFinder — Project Status

## Last session
- Added forgot password flow (email reset link → set new password)
- Added photo uploads on activity posts (stored in Supabase Storage)
- Redesigned profile page: collect-em-all court grid, favourite players, location field, edit modal
- Added court bookmarks ("want to play" wishlist)
- Switched feed to following-only (with empty state prompting follows)
- Redesigned activity cards with surface-coloured accent bar
- Security hardening: tightened storage RLS, courts insert policy, enabled email confirmation

## What's working
- Mapbox map centred on San Diego with 17 seeded courts and tennis ball markers
- Surface filter chips, public-only / outdoor-only toggles, live viewport filtering
- Full auth: signup, login, forgot password, session management
- Check-ins, match/practice logging, optional photo, optional score
- Following-only activity feed with likes
- Profile page: stats, court collection, bookmarks, favourite players, follow/unfollow
- Deployed on Vercel, connected to GitHub (auto-deploys on push)

## Next up (ideas)
- Mobile layout pass — app hasn't been tested on small screens
- Profile avatar upload — no way to set a profile photo yet
- User search — no way to find people to follow without knowing their profile URL
- Expand courts beyond San Diego

## Known issues
- Vercel webhook occasionally doesn't fire on `git push` — fix by pushing an empty commit
- Email confirmation is now required for new signups; existing unverified accounts may need to re-verify
