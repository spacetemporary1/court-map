'use client'

import { useState, useCallback, useRef } from 'react'
import Map, { Marker, Popup, NavigationControl, GeolocateControl } from 'react-map-gl/mapbox'
import 'mapbox-gl/dist/mapbox-gl.css'
import { MapPin, Plus } from 'lucide-react'
import type { Court } from '@/types'
import { CourtPanel } from './CourtPanel'
import { AddCourtModal } from './AddCourtModal'

interface CourtMapProps {
  courts: Court[]
  userId: string
  onCourtsUpdate: () => void
}

export function CourtMap({ courts, userId, onCourtsUpdate }: CourtMapProps) {
  const [selectedCourt, setSelectedCourt] = useState<Court | null>(null)
  const [addingCourt, setAddingCourt] = useState(false)
  const [pendingCoord, setPendingCoord] = useState<{ lat: number; lng: number } | null>(null)
  const mapRef = useRef(null)

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

  const surfaceColors: Record<string, string> = {
    hard: '#3B82F6',
    clay: '#F97316',
    grass: '#22C55E',
    carpet: '#A855F7',
  }

  return (
    <div className="relative w-full h-full">
      <Map
        ref={mapRef}
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
        initialViewState={{ longitude: 0, latitude: 20, zoom: 2 }}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        onClick={handleMapClick}
        cursor={addingCourt ? 'crosshair' : 'grab'}
      >
        <NavigationControl position="top-right" />
        <GeolocateControl
          position="top-right"
          trackUserLocation
          showUserHeading
        />

        {courts.map((court) => (
          <Marker
            key={court.id}
            longitude={court.lng}
            latitude={court.lat}
            anchor="bottom"
            onClick={(e) => {
              e.originalEvent.stopPropagation()
              setSelectedCourt(court)
            }}
          >
            <div className="group cursor-pointer">
              <div
                className="w-8 h-8 rounded-full border-2 border-white shadow-lg flex items-center justify-center transition-transform group-hover:scale-110"
                style={{ backgroundColor: surfaceColors[court.surface ?? ''] ?? '#6B7280' }}
              >
                <MapPin size={14} className="text-white" fill="white" />
              </div>
            </div>
          </Marker>
        ))}

        {pendingCoord && (
          <Marker longitude={pendingCoord.lng} latitude={pendingCoord.lat} anchor="bottom">
            <div className="w-8 h-8 rounded-full border-2 border-white bg-yellow-500 shadow-lg flex items-center justify-center animate-bounce">
              <MapPin size={14} className="text-white" fill="white" />
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
            offset={40}
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

      {/* Add court / cancel toggle */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3">
        {addingCourt ? (
          <>
            <button
              onClick={() => { setAddingCourt(false); setPendingCoord(null) }}
              className="px-4 py-2 bg-white border border-gray-300 rounded-full text-sm font-medium shadow-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            {pendingCoord && (
              <button
                onClick={() => {/* opens AddCourtModal via state below */}}
                className="px-4 py-2 bg-green-600 text-white rounded-full text-sm font-medium shadow-lg hover:bg-green-700"
              >
                Place court here
              </button>
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

      {/* Surface legend */}
      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-3 text-xs space-y-1.5">
        <p className="font-semibold text-gray-700 mb-2">Surface</p>
        {Object.entries(surfaceColors).map(([surface, color]) => (
          <div key={surface} className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
            <span className="capitalize text-gray-600">{surface}</span>
          </div>
        ))}
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-gray-500" />
          <span className="text-gray-600">Unknown</span>
        </div>
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
  )
}
