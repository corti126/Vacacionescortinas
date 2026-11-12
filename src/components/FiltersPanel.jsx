/* Panel de filtros combinables y ordenamientos (requisito 11) */
import {
  SORT_OPTIONS,
  STATUS_OPTIONS,
  EMPTY_FILTERS,
} from './filtersConstants'

export default function FiltersPanel({
  filters,
  onChangeFilters,
  sort,
  onChangeSort,
  cities = [],
  onClear,
}) {
  const isActive = () => {
    const f = filters
    return Boolean(
      f.cityId ||
      f.maxPrice ||
      f.maxDistance ||
      f.minCapacity ||
      f.minBedrooms ||
      f.pool ||
      f.garage ||
      f.minRating ||
      f.status ||
      sort !== 'price-asc',
    )
  }

  /* Cantidad de filtros activos, calculada en cada render (sin setState
     durante el render: eso provocaba un bucle infinito de re-render). */
  const activeFilters = [
    filters.cityId,
    filters.maxPrice,
    filters.maxDistance,
    filters.minCapacity,
    filters.minBedrooms,
    filters.minRating,
    filters.status,
    filters.pool,
    filters.garage,
    sort !== 'price-asc',
  ].filter(Boolean).length

  const handleClear = () => {
    onChangeFilters(EMPTY_FILTERS)
    onChangeSort('price-asc')
    if (onClear) onClear()
  }

  return (
    <section className="filters-panel">
      <div className="filters-panel-inner">
        <h2 className="filters-title">Filtros y ordenamiento</h2>

        <div className="filters-grid">
          <div className="filter-field">
            <label>Ciudad</label>
            <select
              value={filters.cityId}
              onChange={(e) => onChangeFilters({ ...filters, cityId: e.target.value })}
            >
              <option value="">Todas las ciudades</option>
              {cities.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="filter-field">
            <label>Precio máximo</label>
            <input
              type="number"
              min="0"
              value={filters.maxPrice}
              onChange={(e) => onChangeFilters({ ...filters, maxPrice: e.target.value })}
              placeholder="Ej. 3000"
            />
          </div>

          <div className="filter-field">
            <label>Distancia máxima a la playa (m)</label>
            <input
              type="number"
              min="0"
              value={filters.maxDistance}
              onChange={(e) => onChangeFilters({ ...filters, maxDistance: e.target.value })}
              placeholder="Ej. 500"
            />
          </div>

          <div className="filter-field">
            <label>Capacidad mínima</label>
            <input
              type="number"
              min="1"
              value={filters.minCapacity}
              onChange={(e) => onChangeFilters({ ...filters, minCapacity: e.target.value })}
              placeholder="Ej. 4"
            />
          </div>

          <div className="filter-field">
            <label>Habitaciones mínimas</label>
            <input
              type="number"
              min="0"
              value={filters.minBedrooms}
              onChange={(e) => onChangeFilters({ ...filters, minBedrooms: e.target.value })}
              placeholder="Ej. 2"
            />
          </div>

          <div className="filter-field">
            <label>Mi puntuación mínima</label>
            <input
              type="number"
              min="1"
              max="10"
              value={filters.minRating}
              onChange={(e) => onChangeFilters({ ...filters, minRating: e.target.value })}
              placeholder="Ej. 7"
            />
          </div>

          <div className="filter-field checkbox-row">
            <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input
                type="checkbox"
                checked={filters.pool}
                onChange={(e) => onChangeFilters({ ...filters, pool: e.target.checked })}
              />
              Piscina
            </label>
          </div>

          <div className="filter-field checkbox-row">
            <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input
                type="checkbox"
                checked={filters.garage}
                onChange={(e) => onChangeFilters({ ...filters, garage: e.target.checked })}
              />
              Cochera
            </label>
          </div>

          <div className="filter-field">
            <label>Estado familiar</label>
            <select
              value={filters.status}
              onChange={(e) => onChangeFilters({ ...filters, status: e.target.value })}
            >
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="filters-sort">
          <label>Ordenar por</label>
          <select
            value={sort}
            onChange={(e) => onChangeSort(e.target.value)}
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        <div className="filters-actions">
          {activeFilters > 0 && (
            <span className="filters-count">{activeFilters} filtro{activeFilters !== 1 ? 's' : ''} activo{activeFilters !== 1 ? 's' : ''}</span>
          )}
          {isActive() && (
            <button type="button" className="btn-clear" onClick={handleClear}>
              Limpiar filtros
            </button>
          )}
        </div>
      </div>
    </section>
  )
}
