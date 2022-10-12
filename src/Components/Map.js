import '../Styles/Map.css'
import {useState, useEffect} from 'react'
import { MapContainer, TileLayer, useMap, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png')
});

const Map = () => {

    const [coords, setCoords] = useState(null)
    const [canGetCoords, setCanGetCoords] = useState(true)

    const [markers, setMarkers] = useState([])
    
    useEffect(() => {
        if (canGetCoords) {
            navigator.geolocation.getCurrentPosition(pos => {
                let crd = pos.coords;
    
                console.log('Sua posição atual é:');
                console.log('Latitude : ' + crd.latitude);
                console.log('Longitude: ' + crd.longitude);
                console.log('Mais ou menos  ' + crd.accuracy + ' metros.');
                
                setCoords({latitude: pos.coords.latitude, longitude: pos.coords.longitude})
                setCanGetCoords(false)
            }, () => console.log('Não foi possível definir a localização.'), {timeout: 5000, enableHighAccuracy: true, maximumAge: 0})
        }

        if (!markers.length) {
            fetch('http://localhost:5000/api/places')
            .then(response => response.json())
            .then(response => {
                setMarkers([...response])
            })
        } 
        
    }, [canGetCoords])

    if (coords)
        return (
            <MapContainer center={[coords.latitude, coords.longitude]} zoom={13} scrollWheelZoom={false}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={[coords.latitude, coords.longitude]}>
                    <Popup>
                        Você está aqui.
                    </Popup>
                </Marker>
                {markers.length ? markers.map((marker, index) => (
                    <Marker key={index} position={[marker.latitude, marker.longitude]}>
                        <Popup>{marker.placename}</Popup>
                    </Marker>
                )) : null}
            </MapContainer>
        )
    else return null
}

export default Map