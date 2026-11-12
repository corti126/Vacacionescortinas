/* Listado global de alojamientos con filtros, ordenamiento y pestañas de estado */
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  observeAccommodations,
  observeAccommodationStatuses,
  observeCities,
  setAccommodationStatus,
  ACCOMMODATION_STATUS,
} from '../services/firestore'
import FiltersPanel from '../components/FiltersPanel'
import { EMPTY_FILTERS, SORT_OPTIONS } from '../components/filtersConstants'
import StatusTabs from '../components/StatusTabs'
import '../styles/lists.css'

export default function AccommodationsList() {
  const [cities, setCities] = useState([])
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
      setCities(list)
      markReady()
    }, onError)
    const unsubAccommodations = observeAccommodations((list) => {
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
  }, [])

  const statusesById = useMemo(() => {
    const m = {}
    for (const s of statuses) m[s.id] = s
    return m
  }, [statuses])

  const citiesById = useMemo(() => {
    const m = {}
    for (const c of cities) m[c.id] = c
    return m
  }, [cities])

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
        <div className="list-header"><h1>Alojamientos</h1></div>
        <div className="list-empty">Cargando…</div>
      </div>
    )
  }

  const sortLabel = SORT_OPTIONS.find((o) => o.value === sort)?.label || sort

  return (
    <div className="list-page">
      <div className="list-header">
        <h1>Alojamientos</h1>
        <div className="list-header-actions">
          <Link to="/ciudades" className="btn-secondary">
            ← Destinos
          </Link>
          <Link to="/alojamientos/nuevo" className="btn-primary">
            + Nuevo alojamiento
          </Link>
        </div>
      </div>

      {loadError && (
        <div className="load-error" role="alert">
          No se pudo conectar con Firestore. Revisá la conexión a internet y
          recargá la página.
        </div>
      )}

      <FiltersPanel
        filters={filters}
        onChangeFilters={setFilters}
        sort={sort}
        onChangeSort={setSort}
        cities={cities}
      />

      <div className="results-summary">
        {sorted.length} alojamiento{sorted.length !== 1 ? 's' : ''}
        {' · '}
        ordenado por: {sortLabel}
      </div>

      {accommodations.length === 0 && !loadError && (
        <div className="list-cta" role="status">
          <p className="list-cta-title">Todavía no hay alojamientos cargados.</p>
          <p className="list-cta-text">
            {cities.length === 0
              ? 'Para cargar un alojamiento primero tenés que crear una ciudad (destino).'
              : 'Cargá el primer alojamiento asignándole una de las ciudades creadas.'}
          </p>
          <div className="list-cta-actions">
            {cities.length === 0 && (
              <Link to="/ciudades/nuevo" className="btn-primary">
                + Crear ciudad
              </Link>
            )}
            <Link
              to="/alojamientos/nuevo"
              className={cities.length === 0 ? 'btn-secondary' : 'btn-primary'}
            >
              + Nuevo alojamiento
            </Link>
          </div>
        </div>
      )}

      <StatusTabs
        accommodations={sorted}
        statusesById={statusesById}
        citiesById={citiesById}
        onStatusChange={(accommodationId, nextStatus) =>
          setAccommodationStatus(accommodationId, nextStatus)
        }
      />
    </div>
  )
}
