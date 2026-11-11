/* Listado de alojamientos filtrado por estado familiar compartido */
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  observeAccommodations,
  observeAccommodationStatuses,
  observeCities,
  setAccommodationStatus,
  ACCOMMODATION_STATUS,
} from '../services/firestore'
import AccommodationCard from '../components/AccommodationCard'
import { statusLabel } from '../utils/format'
import '../styles/lists.css'

const STATUS_TITLES = {
  [ACCOMMODATION_STATUS.FAVORITE]: 'Favoritas',
  [ACCOMMODATION_STATUS.PENDING]: 'Pendientes',
  [ACCOMMODATION_STATUS.DISCARDED]: 'Descartadas',
}

const STATUS_COLORS = {
  [ACCOMMODATION_STATUS.FAVORITE]: 'var(--success)',
  [ACCOMMODATION_STATUS.PENDING]: 'var(--warning)',
  [ACCOMMODATION_STATUS.DISCARDED]: 'var(--danger)',
}

export default function StatusList() {
  const { status } = useParams()
  const title = STATUS_TITLES[status] || 'Alojamientos'
  const [accommodations, setAccommodations] = useState([])
  const [statuses, setStatuses] = useState([])
  const [cities, setCities] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let ready = 0
    const markReady = () => {
      ready += 1
      if (ready >= 3) setLoading(false)
    }
    const unsubAccommodations = observeAccommodations((list) => {
      setAccommodations(list)
      markReady()
    })
    const unsubStatuses = observeAccommodationStatuses((list) => {
      setStatuses(list)
      markReady()
    })
    const unsubCities = observeCities((list) => {
      setCities(list)
      markReady()
    })
    return () => {
      unsubAccommodations()
      unsubStatuses()
      unsubCities()
    }
  }, [status])

  const statusesById = {}
  for (const s of statuses) {
    statusesById[s.id] = s
  }

  const citiesById = {}
  for (const c of cities) {
    citiesById[c.id] = c
  }

  const filtered = accommodations.filter(
    (a) => (statusesById[a.id]?.status || ACCOMMODATION_STATUS.PENDING) === status,
  )

  if (loading) {
    return (
      <div className="list-page">
        <div className="list-header"><h1>{title}</h1></div>
        <div className="list-empty">Cargando…</div>
      </div>
    )
  }

  return (
    <div className="list-page">
      <div className="list-header">
        <h1 style={{ color: STATUS_COLORS[status] || 'var(--text-h)' }}>{title}</h1>
        <Link to="/ciudades" className="btn-secondary-link">← Todos los destinos</Link>
      </div>

      {filtered.length === 0 ? (
        <div className="list-empty">
          <p>No hay alojamientos marcados como {statusLabel(status).toLowerCase()}.</p>
          <Link to="/ciudades" className="btn-primary-map">Ver todos los destinos</Link>
        </div>
      ) : (
        <div className="accommodation-list-grid">
          {filtered.map((a) => {
            const city = citiesById[a.cityId]
            const st = statusesById[a.id]?.status || ACCOMMODATION_STATUS.PENDING
            return (
              <AccommodationCard
                key={a.id}
                accommodation={{ ...a, cityName: city ? city.name : '' }}
                status={st}
                onStatusChange={(nextStatus) =>
                  setAccommodationStatus(a.id, nextStatus)
                }
              />
            )
          })}
        </div>
      )}
    </div>
  )
}
