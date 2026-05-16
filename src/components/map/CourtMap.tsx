'use client'

import { useState, useCallback, useRef } from 'react'
import Map, { Marker, Popup, NavigationControl, GeolocateControl, type MapRef } from 'react-map-gl/mapbox'
import type { LngLatBounds } from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { Plus } from 'lucide-react'
import type { Court } from '@/types'
import { CourtPanel } from './CourtPanel'
import { AddCourtModal } from './AddCourtModal'
import { SidePanel } from './SidePanel'

interface CourtMapProps {
  courts: Court[]
  userId: string
  onCourtsUpdate: () => void
}

// Tennis-themed colors per surface type
const SURFACE_COLOR: Record<string, string> = {
  hard:   '#C9E832', // classic tennis ball lime-yellow
  clay:   '#E07B3A', // burnt clay orange
  grass:  '#3CB34A', // grass green
  carpet: '#7B5EA7', // court carpet purple
}

function TennisBallMarker({ color, selected }: { color: string; selected: boolean }) {
  return (
    <svg
      width="36"
      height="46"
      viewBox="0 0 36 46"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ filter: selected ? 'drop-shadow(0 0 6px rgba(0,0,0,0.5))' : 'drop-shadow(0 2px 3px rgba(0,0,0,0.25))' }}
    >
      {/* Ground shadow */}
      <ellipse cx="18" cy="45" rx="6" ry="2" fill="rgba(0,0,0,0.15)" />
      {/* Pin pointer — drawn first so ball covers its top edge seamlessly */}
      <path d="M12 29 L18 45 L24 29" fill={color} />
      {/* Ball */}
      <circle cx="18" cy="18" r="17" fill={color} stroke="white" strokeWidth={selected ? 3 : 2} />
      {/* Tennis ball seams — two C-shaped arcs, one on each side */}
      <path d="M3 13 Q18 19 3 25"  stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M33 13 Q18 19 33 25" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    </svg>
  )
}

// San Diego metro: covers all seeded courts from Del Mar (N) to Chula Vista (S)
const SD_INITIAL_VIEW = { longitude: -117.15, latitude: 32.79, zoom: 10 }

export function CourtMap({ courts, userId, onCourtsUpdate }: CourtMapProps) {
  const mapRef = useRef<MapRef>(null)

  const [selectedCourt, setSelectedCourt]   = useState<Court | null>(null)
  const [addingCourt, setAddingCourt]       = useState(false)
  const [pendingCoord, setPendingCoord]     = useState<{ lat: number; lng: number } | null>(null)
  const [mapBounds, setMapBounds]           = useState<LngLatBounds | null>(null)

  // Filter state
  const [activeSurface, setActiveSurface]   = useState<string | null>(null)
  const [publicOnly, setPublicOnly]         = useState(false)
  const [outdoorOnly, setOutdoorOnly]       = useState(false)

  const handleMapClick = useCallback(
    (e: { lngLat: { lat: number; lng: number } }) => {
      if (addingCourt) {
        setPendingCoord({ lat: e.lngLat.lat, lng: e.lngLat.lng })
      } else {
        setSelectedCourt(null)
      }
    },
    [addingCourt]
  )

  // Apply active filters
  const filteredCourts = courts.filter(court => {
    if (activeSurface && court.surface !== activeSurface) return false
    if (publicOnly && !court.is_public) return false
    if (outdoorOnly && court.is_indoor) return false
    return true
  })

  // Further narrow to what's currently on screen
  const visibleCourts = mapBounds
    ? filteredCourts.filter(c => mapBounds.contains([c.lng, c.lat]))
    : filteredCourts

  // Fly to a court and open its popup when selected from the side panel
  const handleCourtSelect = useCallback((court: Court) => {
    mapRef.current?.flyTo({ center: [court.lng, court.lat], zoom: 14, duration: 800 })
    setSelectedCourt(court)
  }, [])

  return (
    <div className="flex h-full">

      <SidePanel
        allCourts={filteredCourts}
        visibleCourts={visibleCourts}
        activeSurface={activeSurface}
        publicOnly={publicOnly}
        outdoorOnly={outdoorOnly}
        selectedCourt={selectedCourt}
        onSurfaceChange={setActiveSurface}
        onPublicOnlyChange={setPublicOnly}
        onOutdoorOnlyChange={setOutdoorOnly}
        onCourtSelect={handleCourtSelect}
      />

      <div className="relative flex-1">
        <Map
          ref={mapRef}
          mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
          initialViewState={SD_INITIAL_VIEW}
          style={{ width: '100%', height: '100%' }}
          mapStyle="mapbox://styles/mapbox/streets-v12"
          onClick={handleMapClick}
          cursor={addingCourt ? 'crosshair' : 'grab'}
          onLoad={() => {
            if (mapRef.current) setMapBounds(mapRef.current.getBounds())
          }}
          onMoveEnd={() => {
            if (mapRef.current) setMapBounds(mapRef.current.getBounds())
          }}
        >
          <NavigationControl position="top-right" />
          <GeolocateControl position="top-right" trackUserLocation showUserHeading />

          {filteredCourts.map(court => (
            <Marker
              key={court.id}
              longitude={court.lng}
              latitude={court.lat}
              anchor="bottom"
              onClick={e => {
                e.originalEvent.stopPropagation()
                setSelectedCourt(court)
              }}
            >
              <div
                className="cursor-pointer transition-transform hover:scale-110 active:scale-95"
                style={{ transformOrigin: 'bottom center' }}
              >
                <TennisBallMarker
                  color={SURFACE_COLOR[court.surface ?? ''] ?? '#94A3B8'}
                  selected={selectedCourt?.id === court.id}
                />
              </div>
            </Marker>
          ))}

          {/* Pending new-court placement pin */}
          {pendingCoord && (
            <Marker longitude={pendingCoord.lng} latitude={pendingCoord.lat} anchor="bottom">
              <div className="w-8 h-8 rounded-full border-2 border-white bg-yellow-400 shadow-lg flex items-center justify-center animate-bounce">
                <Plus size={16} className="text-white" />
              </div>
            </Marker>
          )}

          {selectedCourt && (
            <Popup
              longitude={selectedCourt.lng}
              latitude={selectedCourt.lat}
              anchor="bottom"
              onClose={() => setSelectedCourt(null)}
              closeButton={false}
              offset={48}
              maxWidth="none"
              className="court-popup"
            >
              <CourtPanel
                court={selectedCourt}
                userId={userId}
                onClose={() => setSelectedCourt(null)}
                onUpdate={onCourtsUpdate}
              />
            </Popup>
          )}
        </Map>

        {/* Add court FAB */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-10">
          {addingCourt ? (
            <>
              <button
                onClick={() => { setAddingCourt(false); setPendingCoord(null) }}
                className="px-4 py-2 bg-white border border-gray-300 rounded-full text-sm font-medium shadow-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              {pendingCoord && (
                <span className="px-4 py-2 bg-green-600 text-white rounded-full text-sm font-medium shadow-lg">
                  Click to confirm location
                </span>
              )}
            </>
          ) : (
            <button
              onClick={() => setAddingCourt(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-full text-sm font-medium shadow-lg hover:bg-green-700 transition-colors"
            >
              <Plus size={16} />
              Add court
            </button>
          )}
        </div>

        {pendingCoord && addingCourt && (
          <AddCourtModal
            coord={pendingCoord}
            onClose={() => { setPendingCoord(null); setAddingCourt(false) }}
            onCreated={() => { setPendingCoord(null); setAddingCourt(false); onCourtsUpdate() }}
            userId={userId}
          />
        )}
      </div>
    </div>
  )
}
