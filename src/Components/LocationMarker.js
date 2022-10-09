import { Marker, Popup } from 'react-leaflet'
import { useMapEvents } from 'react-leaflet/hooks'

import { useState } from 'react'

const LocationMarker = ({otherSetPosition}) => {
    const [position, setPosition] = useState(null)

    const map = useMapEvents({
        click(e) {
            setPosition(e.latlng)
            otherSetPosition(e.latlng)
        }
    })

    return position === null ? null : (
    <Marker position={position}>
      <Popup>You are here</Popup>
    </Marker>
  )
}

export default LocationMarker