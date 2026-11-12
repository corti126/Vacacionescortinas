/* Listado global de alojamientos (solo lectura para la familia):
   filtros combinables, calendario de disponibilidad, ordenamiento y
   pestañas de estado. La creación/edición vive en /admin/alojamientos. */
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  observeAccommodations,
  observeAccommodationStatuses,
  observeCities,
  setAccommodationStatus,
} from '../services/firestore'
import FiltersPanel from '../components/FiltersPanel'
import { EMPTY_FILTERS, SORT_OPTIONS } from '../components/filtersConstants'
import {
  filterAccommodations,
  sortAccommodations,
} from '../utils/filterAccommodations'
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

  const filtered = useMemo(
    () => filterAccommodations(accommodations, statusesById, filters),
    [accommodations, statusesById, filters],
  )

  const sorted = useMemo(
    () => sortAccommodations(filtered, sort),
    [filtered, sort],
  )

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
        {filters.availFrom && ' disponibles en las fechas elegidas'}
        {' · '}
        ordenado por: {sortLabel}
      </div>

      <StatusTabs
        accommodations={sorted}
        statusesById={statusesById}
        citiesById={citiesById}
        emptyMessage={
          accommodations.length > 0
            ? 'Ningún alojamiento coincide con los filtros y las fechas seleccionadas.'
            : null
        }
        onStatusChange={(accommodationId, nextStatus) =>
          setAccommodationStatus(accommodationId, nextStatus)
        }
      />
    </div>
  )
}
