/* Detalle de una ciudad y sus alojamientos */
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  observeCities,
  observeAccommodationsByCity,
  observeAccommodationStatuses,
} from '../services/firestore'
import AccommodationCard from '../components/AccommodationCard'
import '../styles/lists.css'

export default function CityDetail() {
  const { id } = useParams()
  const [city, setCity] = useState(null)
  const [accommodations, setAccommodations] = useState([])
  const [statuses, setStatuses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubCities = observeCities((list) => {
      setCity(list.find((c) => c.id === id) || null)
    })
    const unsubAccommodations = observeAccommodationsByCity(id, (list) => {
      setAccommodations(list)
      setLoading(false)
    })
    const unsubStatuses = observeAccommodationStatuses((list) => {
      setStatuses(list)
      setLoading(false)
    })
    return () => {
      unsubCities()
      unsubAccommodations()
      unsubStatuses()
    }
  }, [id])

  const statusesById = {}
  for (const s of statuses) {
    statusesById[s.id] = s
  }

  if (loading) {
    return (
      <div className="list-page">
        <div className="list-header"><h1>Cargando ciudad…</h1></div>
        <div className="list-empty">Un momento.</div>
      </div>
    )
  }

  if (!city) {
    return (
      <div className="list-page">
        <div className="list-header"><h1>Ciudad no encontrada</h1></div>
        <div className="list-empty">
          <p>La ciudad no existe. <Link to="/ciudades">Volver a ciudades</Link></p>
        </div>
      </div>
    )
  }

  return (
    <div className="detail-page">
      <div className="detail-header">
        <div className="detail-header-inner">
          <Link to="/ciudades" className="back-link">← Volver a ciudades</Link>
          <div className="detail-actions">
            <Link to={`/ciudades/${id}/editar`} className="btn-secondary">Editar ciudad</Link>
            <Link to={`/ciudades/${id}/nuevo-alojamiento`} className="btn-primary">+ Nuevo alojamiento</Link>
          </div>
        </div>
        <div className="detail-cover">
          <img
            src={city.coverImage || 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=1200&auto=format&fit=crop'}
            alt=""
            className="detail-cover-img"
          />
        </div>
        <div className="detail-info">
          <h1>{city.name}</h1>
          {city.region && <span className="detail-region">{city.region}</span>}
          {city.description && <p className="detail-desc">{city.description}</p>}
          {(city.lat != null || city.lng != null) && (
            <p className="detail-coords">
              Coordenadas: {city.lat != null ? city.lat : '—'}, {city.lng != null ? city.lng : '—'}
            </p>
          )}
        </div>
      </div>

      <h2 className="section-title">Alojamientos en {city.name}</h2>
      {accommodations.length === 0 ? (
        <div className="list-empty">
          <p>Aún no hay alojamientos en esta ciudad.</p>
        </div>
      ) : (
        <div className="accommodation-list-grid">
          {accommodations.map((a) => {
            const status = statusesById[a.id]?.status || 'pending'
            return (
              <AccommodationCard
                key={a.id}
                accommodation={{ ...a, cityName: city.name }}
                status={status}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}
