'use client'

import { MapPin, Users, Wifi, WifiOff, SlidersHorizontal } from 'lucide-react'
import type { Court } from '@/types'

interface SidePanelProps {
  allCourts: Court[]
  visibleCourts: Court[]
  activeSurface: string | null
  publicOnly: boolean
  outdoorOnly: boolean
  selectedCourt: Court | null
  onSurfaceChange: (surface: string | null) => void
  onPublicOnlyChange: (v: boolean) => void
  onOutdoorOnlyChange: (v: boolean) => void
  onCourtSelect: (court: Court) => void
}

const SURFACES = [
  { key: null,      label: 'All',    color: null },
  { key: 'hard',    label: 'Hard',   color: '#C9E832' },
  { key: 'clay',    label: 'Clay',   color: '#E07B3A' },
  { key: 'grass',   label: 'Grass',  color: '#3CB34A' },
  { key: 'carpet',  label: 'Carpet', color: '#7B5EA7' },
]

const SURFACE_BADGE: Record<string, string> = {
  hard:   'bg-lime-100 text-lime-700',
  clay:   'bg-orange-100 text-orange-700',
  grass:  'bg-green-100 text-green-700',
  carpet: 'bg-purple-100 text-purple-700',
}

function Toggle({ on, onToggle, label }: { on: boolean; onToggle: () => void; label: string }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer select-none">
      <button
        role="switch"
        aria-checked={on}
        onClick={onToggle}
        className={`relative w-8 h-4 rounded-full transition-colors focus:outline-none ${on ? 'bg-green-500' : 'bg-gray-200'}`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full shadow transition-transform ${on ? 'translate-x-4' : 'translate-x-0'}`}
        />
      </button>
      <span className="text-xs text-gray-600">{label}</span>
    </label>
  )
}

function CourtCard({ court, selected, onSelect }: { court: Court; selected: boolean; onSelect: () => void }) {
  return (
    <button
      onClick={onSelect}
      className={`w-full text-left px-4 py-3 transition-colors hover:bg-gray-50 ${
        selected ? 'bg-green-50 border-l-2 border-green-500' : 'border-l-2 border-transparent'
      }`}
    >
      <p className="text-sm font-medium text-gray-900 leading-snug">{court.name}</p>

      {court.address && (
        <p className="text-xs text-gray-400 mt-0.5 truncate flex items-center gap-1">
          <MapPin size={10} className="shrink-0" />
          {court.address.split(',').slice(0, 2).join(',')}
        </p>
      )}

      <div className="flex flex-wrap gap-1 mt-1.5">
        {court.surface && (
          <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${SURFACE_BADGE[court.surface] ?? 'bg-gray-100 text-gray-500'}`}>
            {court.surface.charAt(0).toUpperCase() + court.surface.slice(1)}
          </span>
        )}
        {court.num_courts != null && (
          <span className="text-xs px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 font-medium flex items-center gap-0.5">
            <Users size={9} />
            {court.num_courts}
          </span>
        )}
        <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${court.is_public ? 'bg-gray-100 text-gray-500' : 'bg-amber-50 text-amber-700'}`}>
          {court.is_public ? 'Public' : 'Private'}
        </span>
        <span className={`text-xs px-1.5 py-0.5 rounded font-medium flex items-center gap-0.5 ${court.is_indoor ? 'bg-violet-50 text-violet-600' : 'bg-sky-50 text-sky-600'}`}>
          {court.is_indoor ? <><Wifi size={9} /> Indoor</> : <><WifiOff size={9} /> Outdoor</>}
        </span>
      </div>
    </button>
  )
}

export function SidePanel({
  allCourts,
  visibleCourts,
  activeSurface,
  publicOnly,
  outdoorOnly,
  selectedCourt,
  onSurfaceChange,
  onPublicOnlyChange,
  onOutdoorOnlyChange,
  onCourtSelect,
}: SidePanelProps) {
  const publicCount  = allCourts.filter(c => c.is_public).length
  const privateCount = allCourts.filter(c => !c.is_public).length
  const indoorCount  = allCourts.filter(c => c.is_indoor).length

  return (
    <aside className="w-72 shrink-0 h-full bg-white border-r border-gray-200 flex flex-col z-10 shadow-sm">

      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="px-4 pt-4 pb-3 border-b border-gray-100">
        <div className="flex items-baseline justify-between">
          <h2 className="font-semibold text-gray-900">Courts</h2>
          <span className="text-xs text-gray-400">
            {visibleCourts.length} of {allCourts.length} in view
          </span>
        </div>
        <p className="text-xs text-gray-400 mt-0.5">Pan or zoom to explore</p>
      </div>

      {/* ── Filters ────────────────────────────────────────────────── */}
      <div className="px-4 py-3 border-b border-gray-100 space-y-3">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">
          <SlidersHorizontal size={11} />
          Filter
        </div>

        {/* Surface chips */}
        <div className="flex flex-wrap gap-1.5">
          {SURFACES.map(({ key, label, color }) => {
            const active = activeSurface === key
            return (
              <button
                key={String(key)}
                onClick={() => onSurfaceChange(active && key !== null ? null : key)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                  active
                    ? 'bg-gray-900 text-white border-gray-900'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                }`}
              >
                {color && <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />}
                {label}
              </button>
            )
          })}
        </div>

        <div className="flex flex-col gap-2">
          <Toggle on={publicOnly}  onToggle={() => onPublicOnlyChange(!publicOnly)}   label="Public access only" />
          <Toggle on={outdoorOnly} onToggle={() => onOutdoorOnlyChange(!outdoorOnly)} label="Outdoor only" />
        </div>
      </div>

      {/* ── Court list ─────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto">
        {visibleCourts.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 h-36 text-gray-400 px-6 text-center">
            <span className="text-3xl">🎾</span>
            <p className="text-sm font-medium">No courts here</p>
            <p className="text-xs">Zoom out or adjust your filters</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-50">
            {visibleCourts.map(court => (
              <li key={court.id}>
                <CourtCard
                  court={court}
                  selected={selectedCourt?.id === court.id}
                  onSelect={() => onCourtSelect(court)}
                />
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* ── Footer stats ───────────────────────────────────────────── */}
      <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
          San Diego totals
        </p>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="text-lg font-bold text-gray-900">{publicCount}</p>
            <p className="text-xs text-gray-500">Public</p>
          </div>
          <div>
            <p className="text-lg font-bold text-gray-900">{privateCount}</p>
            <p className="text-xs text-gray-500">Private</p>
          </div>
          <div>
            <p className="text-lg font-bold text-gray-900">{indoorCount}</p>
            <p className="text-xs text-gray-500">Indoor</p>
          </div>
        </div>
      </div>

    </aside>
  )
}
