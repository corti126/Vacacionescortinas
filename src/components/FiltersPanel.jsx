/* Panel de filtros combinables, ordenamiento, chips removibles y
   calendario de disponibilidad (requisito 11 + filtro de fechas) */
import {
  SORT_OPTIONS,
  STATUS_OPTIONS,
  EMPTY_FILTERS,
} from './filtersConstants'
import DateRangeCalendar from './DateRangeCalendar'
import { formatShort } from '../utils/dates'

export default function FiltersPanel({
  filters,
  onChangeFilters,
  sort,
  onChangeSort,
  cities = [],
  onClear,
}) {
  const set = (patch) => onChangeFilters({ ...filters, ...patch })

  const sortLabel =
    SORT_OPTIONS.find((o) => o.value === sort)?.label || sort
  const statusLabel = STATUS_OPTIONS.find((o) => o.value === filters.status)
    ?.label || ''

  /* Chips: cada filtro activo se muestra y se puede quitar por individual.
     Se calculan en cada render (sin setState durante el render). */
  const chips = []
  if (filters.cityId) {
    chips.push({
      key: 'cityId',
      label: `Ciudad: ${cities.find((c) => c.id === filters.cityId)?.name || ''}`,
      clear: () => set({ cityId: '' }),
    })
  }
  if (filters.availFrom) {
    chips.push({
      key: 'avail',
      label: `Disponible: ${formatShort(filters.availFrom)}${
        filters.availTo && filters.availTo !== filters.availFrom
          ? ` → ${formatShort(filters.availTo)}`
          : ''
      }`,
      clear: () => set({ availFrom: '', availTo: '' }),
    })
  }
  if (filters.maxPrice)
    chips.push({
      key: 'maxPrice',
      label: `Precio ≤ US$ ${filters.maxPrice}`,
      clear: () => set({ maxPrice: '' }),
    })
  if (filters.maxDistance)
    chips.push({
      key: 'maxDistance',
      label: `Playa ≤ ${filters.maxDistance} m`,
      clear: () => set({ maxDistance: '' }),
    })
  if (filters.minCapacity)
    chips.push({
      key: 'minCapacity',
      label: `Huéspedes ≥ ${filters.minCapacity}`,
      clear: () => set({ minCapacity: '' }),
    })
  if (filters.minBedrooms)
    chips.push({
      key: 'minBedrooms',
      label: `Habitaciones ≥ ${filters.minBedrooms}`,
      clear: () => set({ minBedrooms: '' }),
    })
  if (filters.minRating)
    chips.push({
      key: 'minRating',
      label: `Puntuación ≥ ${filters.minRating}`,
      clear: () => set({ minRating: '' }),
    })
  if (filters.status)
    chips.push({
      key: 'status',
      label: `Estado: ${statusLabel}`,
      clear: () => set({ status: '' }),
    })
  if (filters.pool)
    chips.push({ key: 'pool', label: 'Piscina', clear: () => set({ pool: false }) })
  if (filters.garage)
    chips.push({ key: 'garage', label: 'Cochera', clear: () => set({ garage: false }) })
  if (sort !== 'price-asc')
    chips.push({
      key: 'sort',
      label: `Orden: ${sortLabel}`,
      clear: () => onChangeSort('price-asc'),
    })

  const handleClear = () => {
    onChangeFilters(EMPTY_FILTERS)
    onChangeSort('price-asc')
    if (onClear) onClear()
  }

  return (
    <section className="filters-panel">
      <div className="filters-panel-inner">
        <div className="filters-head">
          <div className="filters-head-left">
            <span className="filters-head-icon" aria-hidden="true">🔍</span>
            <h2 className="filters-title">Filtros</h2>
            {chips.length > 0 && (
              <span className="filters-count">
                {chips.length} activo{chips.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          <div className="filters-head-right">
            <div className="filters-sort">
              <label htmlFor="filters-sort-select">Ordenar por</label>
              <select
                id="filters-sort-select"
                value={sort}
                onChange={(e) => onChangeSort(e.target.value)}
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            {chips.length > 0 && (
              <button type="button" className="filters-clear" onClick={handleClear}>
                ✕ Limpiar filtros
              </button>
            )}
          </div>
        </div>

        {chips.length > 0 && (
          <div className="filters-chips">
            {chips.map((c) => (
              <button
                key={c.key}
                type="button"
                className="filter-chip"
                onClick={c.clear}
                title="Quitar este filtro"
              >
                {c.label}
                <span className="filter-chip-x" aria-hidden="true">×</span>
              </button>
            ))}
          </div>
        )}

        <div className="filters-grid">
          <div className="filter-field">
            <label htmlFor="filter-city">Ciudad</label>
            <select
              id="filter-city"
              value={filters.cityId}
              onChange={(e) => set({ cityId: e.target.value })}
            >
              <option value="">Todas las ciudades</option>
              {cities.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="filter-field">
            <label htmlFor="filter-price">Precio máximo</label>
            <div className="filter-input filter-input--prefix">
              <span className="filter-input-affix">US$</span>
              <input
                id="filter-price"
                type="number"
                min="0"
                value={filters.maxPrice}
                onChange={(e) => set({ maxPrice: e.target.value })}
                placeholder="3000"
              />
            </div>
          </div>

          <div className="filter-field">
            <label htmlFor="filter-distance">Distancia a la playa</label>
            <div className="filter-input filter-input--suffix">
              <span className="filter-input-affix">m máx.</span>
              <input
                id="filter-distance"
                type="number"
                min="0"
                value={filters.maxDistance}
                onChange={(e) => set({ maxDistance: e.target.value })}
                placeholder="500"
              />
            </div>
          </div>

          <div className="filter-field">
            <label htmlFor="filter-capacity">Capacidad mínima</label>
            <div className="filter-input filter-input--suffix">
              <span className="filter-input-affix">pers.</span>
              <input
                id="filter-capacity"
                type="number"
                min="1"
                value={filters.minCapacity}
                onChange={(e) => set({ minCapacity: e.target.value })}
                placeholder="4"
              />
            </div>
          </div>

          <div className="filter-field">
            <label htmlFor="filter-bedrooms">Habitaciones mínimas</label>
            <input
              id="filter-bedrooms"
              type="number"
              min="0"
              value={filters.minBedrooms}
              onChange={(e) => set({ minBedrooms: e.target.value })}
              placeholder="2"
            />
          </div>

          <div className="filter-field">
            <label htmlFor="filter-rating">Mi puntuación mínima</label>
            <div className="filter-input filter-input--suffix">
              <span className="filter-input-affix">/10</span>
              <input
                id="filter-rating"
                type="number"
                min="1"
                max="10"
                value={filters.minRating}
                onChange={(e) => set({ minRating: e.target.value })}
                placeholder="7"
              />
            </div>
          </div>

          <div className="filter-field">
            <label htmlFor="filter-status">Estado familiar</label>
            <select
              id="filter-status"
              value={filters.status}
              onChange={(e) => set({ status: e.target.value })}
            >
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          <div className="filter-field">
            <label>Características</label>
            <div className="filter-toggles">
              <button
                type="button"
                className={`filter-toggle ${filters.pool ? 'on' : ''}`}
                aria-pressed={filters.pool}
                onClick={() => set({ pool: !filters.pool })}
              >
                🏊 Piscina
              </button>
              <button
                type="button"
                className={`filter-toggle ${filters.garage ? 'on' : ''}`}
                aria-pressed={filters.garage}
                onClick={() => set({ garage: !filters.garage })}
              >
                🅿️ Cochera
              </button>
            </div>
          </div>
        </div>

        <div className="filters-availability">
          <div className="filters-availability-head">
            <div className="filters-availability-text">
              <span className="filters-availability-icon" aria-hidden="true">📅</span>
              <div>
                <h3>Disponibilidad</h3>
                <p>
                  Se muestran solo los alojamientos libres en <strong>todos</strong>{' '}
                  los días que elijas.
                </p>
              </div>
            </div>
            {filters.availFrom && (
              <button
                type="button"
                className="filters-clear"
                onClick={() => set({ availFrom: '', availTo: '' })}
              >
                ✕ Limpiar fechas
              </button>
            )}
          </div>
          <DateRangeCalendar
            from={filters.availFrom}
            to={filters.availTo}
            onChange={({ from, to }) => set({ availFrom: from, availTo: to })}
          />
        </div>
      </div>
    </section>
  )
}
