/* Mapa de Brasil con las ciudades registradas (React Leaflet + OpenStreetMap) */
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import { divIcon } from 'leaflet'
import { observeCities } from '../services/firestore'
import 'leaflet/dist/leaflet.css'
import '../styles/map.css'

const CENTRO_BRASIL = [-14.235, -51.925]

/* Pino propio (divIcon): no depende de las imágenes PNG de Leaflet, que suelen
   fallar al empaquetarse con Vite y dejan los marcadores invisibles. */
function pinIcon() {
  return divIcon({
    className: 'map-pin-wrapper',
    html: '<span class="map-pin"></span>',
    iconSize: [28, 36],
    iconAnchor: [14, 34],
    popupAnchor: [0, -30],
  })
}

/* Leaflet necesita que se le avise cuándo el contenedor cambió de tamaño
   (porque la página se monta antes que los datos y antes que las fuentes). */
function MapSizeRefresher() {
  const map = useMap()
  useEffect(() => {
    const invalidate = () => map.invalidateSize()
    const t1 = setTimeout(invalidate, 80)
    const t2 = setTimeout(invalidate, 500)
    const t3 = setTimeout(invalidate, 1500)
    window.addEventListener('resize', invalidate)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
      window.removeEventListener('resize', invalidate)
    }
  }, [map])
  return null
}

export default function Mapa() {
  const [cities, setCities] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const icon = useMemo(() => pinIcon(), [])

  useEffect(() => {
    const unsub = observeCities(
      (list) => {
        setCities(list)
        setLoadError(null)
        setLoading(false)
      },
      (error) => {
        setLoadError(error)
        setLoading(false)
      },
    )
    return unsub
  }, [])

  const citiesWithCoords = cities.filter((c) => c.lat != null && c.lng != null)

  return (
    <div className="map-page">
      <div className="map-header">
        <h1>Mapa de Brasil</h1>
        <p className="map-subtitle">
          Ciudades registradas. Tocá un pino para ver detalles.
        </p>
      </div>

      {loadError ? (
        <div className="map-empty">
          <p>No se pudo conectar con Firestore para cargar el mapa.</p>
          <p>Revisá la conexión a internet y recargá la página.</p>
          <button type="button" className="btn-primary-map" onClick={() => window.location.reload()}>
            Reintentar
          </button>
        </div>
      ) : loading ? (
        <div className="map-loading">
          <div className="map-skeleton">
            <div className="skeleton-line"></div>
            <div className="skeleton-line short"></div>
            <div className="skeleton-map"></div>
          </div>
        </div>
      ) : (
        <div className="map-container">
          <MapContainer center={CENTRO_BRASIL} zoom={4} scrollWheelZoom={false}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
              maxZoom={19}
            />
            <MapSizeRefresher />
            {citiesWithCoords.map((city) => (
              <Marker key={city.id} position={[city.lat, city.lng]} icon={icon}>
                <Popup>
                  <div className="map-popup">
                    {city.coverImage && (
                      <Link to={`/ciudades/${city.id}`} className="map-popup-image-link">
                        <img
                          src={city.coverImage}
                          alt=""
                          className="map-popup-image"
                          loading="lazy"
                        />
                      </Link>
                    )}
                    <div className="map-popup-content">
                      <Link to={`/ciudades/${city.id}`} className="map-popup-link">
                        <h3>{city.name}</h3>
                      </Link>
                      {city.region && <div className="map-popup-region">{city.region}</div>}
                      <div className="map-popup-count">
                        {city.accommodationCount || 0} alojamiento
                        {city.accommodationCount !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>

          {cities.length === 0 && (
            <div className="map-overlay">
              <div className="map-overlay-card">
                <p>Todavía no hay ciudades cargadas.</p>
                <p>Los destinos se crean desde el panel de Administración.</p>
                <Link to="/admin" className="btn-primary-map">
                  Ir a Administrar
                </Link>
              </div>
            </div>
          )}
          {cities.length > 0 && citiesWithCoords.length === 0 && (
            <div className="map-overlay">
              <div className="map-overlay-card">
                <p>Ninguna ciudad tiene coordenadas cargadas aún.</p>
                <p>Desde Administrar podés agregar latitud y longitud a cada ciudad.</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
