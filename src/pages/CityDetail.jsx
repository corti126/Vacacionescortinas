/* Detalle de una ciudad y sus alojamientos, con filtros, ordenamiento y pestañas de estado */
import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  observeCities,
  observeAccommodationsByCity,
  observeAccommodationStatuses,
  setAccommodationStatus,
  ACCOMMODATION_STATUS,
} from '../services/firestore'
import FiltersPanel from '../components/FiltersPanel'
import { EMPTY_FILTERS, SORT_OPTIONS } from '../components/filtersConstants'
import StatusTabs from '../components/StatusTabs'
import '../styles/lists.css'

export default function CityDetail() {
  const { id } = useParams()
  const [city, setCity] = useState(null)
  const [accommodations, setAccommodations] = useState([])
  const [statuses, setStatuses] = useState([])
  const [filters, setFilters] = useState(EMPTY_FILTERS)
  const [sort, setSort] = useState('price-asc')
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)

  useEffect(() => {
    let ready = 0
    const markReady = () => {
      ready += 1
      if (ready >= 3) setLoading(false)
    }
    const onError = (error) => {
      setLoadError(error)
      setLoading(false)
    }
    const unsubCities = observeCities((list) => {
      setCity(list.find((c) => c.id === id) || null)
      markReady()
    }, onError)
    const unsubAccommodations = observeAccommodationsByCity(id, (list) => {
      setAccommodations(list)
      markReady()
    }, onError)
    const unsubStatuses = observeAccommodationStatuses((list) => {
      setStatuses(list)
      markReady()
    }, onError)
    return () => {
      unsubCities()
      unsubAccommodations()
      unsubStatuses()
    }
  }, [id])

  const statusesById = useMemo(() => {
    const m = {}
    for (const s of statuses) m[s.id] = s
    return m
  }, [statuses])

  const filtered = useMemo(() => {
    return accommodations.filter((a) => {
      const st = statusesById[a.id]?.status || ACCOMMODATION_STATUS.PENDING
      if (filters.cityId && a.cityId !== filters.cityId) return false
      if (filters.maxPrice && Number(a.priceTotal) > Number(filters.maxPrice)) return false
      if (
        filters.maxDistance &&
        Number(a.distanceToBeach) > Number(filters.maxDistance)
      )
        return false
      if (filters.minCapacity && Number(a.capacity) < Number(filters.minCapacity))
        return false
      if (filters.minBedrooms && Number(a.bedrooms) < Number(filters.minBedrooms))
        return false
      if (filters.pool && a.pool !== true) return false
      if (filters.garage && a.garage !== true) return false
      if (filters.minRating && Number(a.myRating) < Number(filters.minRating))
        return false
      if (filters.status && st !== filters.status) return false
      return true
    })
  }, [accommodations, statusesById, filters])

  const sorted = useMemo(() => {
    const arr = [...filtered]
    switch (sort) {
      case 'price-asc':
        return arr.sort((a, b) => Number(a.priceTotal) - Number(b.priceTotal))
      case 'price-desc':
        return arr.sort((a, b) => Number(b.priceTotal) - Number(a.priceTotal))
      case 'distance-asc':
        return arr.sort((a, b) => Number(a.distanceToBeach) - Number(b.distanceToBeach))
      case 'rating-desc':
        return arr.sort(
          (a, b) => Number(b.myRating || -1) - Number(a.myRating || -1),
        )
      case 'rating-asc':
        return arr.sort(
          (a, b) => Number(a.myRating || 11) - Number(b.myRating || 11),
        )
      default:
        return arr
    }
  }, [filtered, sort])

  if (loading) {
    return (
      <div className="list-page">
        <div className="list-header"><h1>Cargando ciudad…</h1></div>
        <div className="list-empty">Un momento.</div>
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="list-page">
        <div className="list-header"><h1>Ciudad</h1></div>
        <div className="load-error" role="alert">
          No se pudo conectar con Firestore. Revisá la conexión a internet y
          recargá la página.
        </div>
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

  const sortLabel = SORT_OPTIONS.find((o) => o.value === sort)?.label || sort

  return (
    <div className="detail-page">
      <div className="detail-header">
        <div className="detail-header-inner">
          <Link to="/ciudades" className="back-link">← Volver a ciudades</Link>
          <div className="detail-actions">
            <Link to={`/ciudades/${id}/editar`} className="btn-secondary">Editar ciudad</Link>
            <Link
              to={`/ciudades/${id}/nuevo-alojamiento`}
              className="btn-primary"
            >
              + Nuevo alojamiento
            </Link>
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

      <FiltersPanel
        filters={filters}
        onChangeFilters={setFilters}
        sort={sort}
        onChangeSort={setSort}
        cities={[city]}
      />

      <div className="results-summary">
        {sorted.length} alojamiento{sorted.length !== 1 ? 's' : ''}
        {' · '}
        ordenado por: {sortLabel}
      </div>

      <StatusTabs
        accommodations={sorted}
        statusesById={statusesById}
        citiesById={{ [city.id]: city }}
        onStatusChange={(accommodationId, nextStatus) =>
          setAccommodationStatus(accommodationId, nextStatus)
        }
      />
    </div>
  )
}
