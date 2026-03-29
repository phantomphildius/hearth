import { useState } from 'react'
import Input from '../form/Input'
import Button from '../form/Button'
import type { LocationData } from '../../types'

interface LocationPickerProps {
  locationName: string
  address: string
  latitude: number | null
  longitude: number | null
  onChange: (location: LocationData) => void
}

type GeoState = 'idle' | 'requesting' | 'granted' | 'denied' | 'error'

export default function LocationPicker({ locationName, address, latitude, longitude, onChange }: LocationPickerProps) {
  const [geoState, setGeoState] = useState<GeoState>('idle')

  const handleGeolocate = () => {
    if (!navigator.geolocation) {
      setGeoState('error')
      return
    }

    setGeoState('requesting')

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setGeoState('granted')
        onChange({
          location_name: locationName,
          address,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        })
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          setGeoState('denied')
        } else {
          setGeoState('error')
        }
      },
      { timeout: 10000 }
    )
  }

  return (
    <div className="space-y-3">
      <Input
        label="Location Name"
        name="activity[location_name]"
        value={locationName}
        onChange={(value) => onChange({ location_name: value, address, latitude, longitude })}
        placeholder="e.g. Lincoln Park Field #3"
      />
      <Input
        label="Address"
        name="activity[address]"
        value={address}
        onChange={(value) => onChange({ location_name: locationName, address: value, latitude, longitude })}
        placeholder="123 Main St, City, State"
      />

      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={handleGeolocate}
          loading={geoState === 'requesting'}
          disabled={geoState === 'requesting'}
        >
          Use Current Location
        </Button>

        <div aria-live="polite" aria-atomic="true" className="flex items-center gap-3">
          {geoState === 'granted' && latitude !== null && longitude !== null && (
            <span className="text-xs text-green-600">
              Location set ({latitude.toFixed(4)}, {longitude.toFixed(4)})
            </span>
          )}
          {geoState === 'denied' && (
            <span className="text-xs text-red-600">
              Location access denied. Enable it in your browser settings.
            </span>
          )}
          {geoState === 'error' && (
            <span className="text-xs text-red-600">
              Could not get location. Try again or enter manually.
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
