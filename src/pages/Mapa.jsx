/* Mapa de Brasil con las ciudades registradas (React Leaflet + OpenStreetMap) */
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from 'react-leaflet'
import { observeCities } from '../services/firestore'
import 'leaflet/dist/leaflet.css'
import '../styles/map.css'

const CENTRO_BRASIL = [-14.235, -51.925]

/* Forza a Leaflet a recalcular el tamaño cuando los marcadores cambian,
   evitando que el mapa quede en blanco o mal centrado en producción. */
function MapSizeRefresher() {
  const map = useMap()
  useEffect(() => {
    const timer = setTimeout(() => map.invalidateSize(), 300)
    return () => clearTimeout(timer)
  }, [map])
  return null
}

export default function Mapa() {
  const [cities, setCities] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = observeCities((list) => {
      setCities(list)
      setLoading(false)
    })
    return unsub
  }, [])

  const citiesWithCoords = cities.filter(
    (c) => c.lat != null && c.lng != null,
  )

  if (loading) {
    return (
      <div className="map-page">
        <div className="map-header">
          <h1>Mapa de Brasil</h1>
        </div>
        <div className="map-loading">
          <div className="map-skeleton">
            <div className="skeleton-line"></div>
            <div className="skeleton-line short"></div>
            <div className="skeleton-map"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="map-page">
      <div className="map-header">
        <h1>Mapa de Brasil</h1>
        <p className="map-subtitle">
          Ciudades registradas. Tocá un marcador para ver detalles.
        </p>
      </div>
      {cities.length === 0 ? (
        <div className="map-empty">
          <p>Aún no hay ciudades cargadas.</p>
          <Link to="/ciudades/nuevo" className="btn-primary-map">
            Agregar primera ciudad
          </Link>
        </div>
      ) : citiesWithCoords.length === 0 ? (
        <div className="map-empty">
          <p>Ninguna ciudad tiene coordenadas cargadas aún.</p>
          <p>Desde Administrar podés agregar latitud y longitud a cada ciudad.</p>
        </div>
      ) : (
        <div className="map-container">
          <MapContainer
            center={CENTRO_BRASIL}
            zoom={4}
            zoomControl
            scrollWheelZoom={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              detectRetina
              maxZoom={19}
            />
            <MapSizeRefresher />
            {citiesWithCoords.map((city) => (
              <Marker
                key={city.id}
                position={[city.lat, city.lng]}
              >
                <Popup>
                  <div className="map-popup">
                    <Link to={`/ciudades/${city.id}`} className="map-popup-link">
                      <h3>{city.name}</h3>
                    </Link>
                    {city.region && <div className="map-popup-region">{city.region}</div>}
                    <div className="map-popup-count">
                      {city.accommodationCount || 0} alojamiento
                      {city.accommodationCount !== 1 ? 's' : ''}
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      )}
    </div>
  )
}
