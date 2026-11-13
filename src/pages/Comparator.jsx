/* Comparador de hasta 3 alojamientos: tabla comparativa + selector
   interactivo para elegir con qué trabajar. La selección persiste en
   memoria durante la sesión de la app (vive en ComparatorProvider). */
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  observeAccommodations,
  observeCities,
} from '../services/firestore'
import { useComparator } from '../context/useComparator.js'
import { formatPrice, pricePerPerson } from '../utils/format'
import '../styles/comparator.css'

const ROWS = [
  { key: 'photo', label: 'Fotografía' },
  { key: 'name', label: 'Nombre' },
  { key: 'city', label: 'Ciudad / barrio' },
  { key: 'priceTotal', label: 'Precio total (estadia)' },
  { key: 'pricePerPerson', label: 'Precio por persona' },
  { key: 'myRating', label: 'Mi puntuación personal' },
  { key: 'airbnbRating', label: 'Calificación Airbnb' },
  { key: 'distance', label: 'Distancia a la playa' },
  { key: 'capacity', label: 'Capacidad' },
  { key: 'bedrooms', label: 'Habitaciones' },
  { key: 'bathrooms', label: 'Baños' },
  { key: 'pool', label: 'Piscina' },
  { key: 'garage', label: 'Cochera' },
  { key: 'grill', label: 'Parrilla' },
  { key: 'airConditioning', label: 'Aire acondicionado' },
  { key: 'notes', label: 'Observaciones' },
  { key: 'airbnb', label: 'Publicación original' },
]

export default function Comparator() {
  const { selected, toggle, remove, clear, isSelected, canAdd, max } =
    useComparator()
  const [cities, setCities] = useState([])
  const [accommodations, setAccommodations] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')

  useEffect(() => {
    let ready = 0
    const markReady = () => {
      ready += 1
      if (ready >= 2) setLoading(false)
    }
    const unsubCities = observeCities((list) => {
      setCities(list)
      markReady()
    })
    const unsubAccommodations = observeAccommodations((list) => {
      setAccommodations(list)
      markReady()
    })
    return () => {
      unsubCities()
      unsubAccommodations()
    }
  }, [])

  const citiesById = useMemo(() => {
    const m = {}
    for (const c of cities) m[c.id] = c
    return m
  }, [cities])

  const compared = useMemo(
    () =>
      selected
        .map((id) => accommodations.find((a) => a.id === id))
        .filter(Boolean),
    [selected, accommodations],
  )

  const pickerList = useMemo(() => {
    const q = query.trim().toLowerCase()
    const list = [...accommodations].sort(
      (a, b) => Number(b.myRating || 0) - Number(a.myRating || 0),
    )
    if (!q) return list
    return list.filter((a) => {
      const city = citiesById[a.cityId]
      return (
        a.name?.toLowerCase().includes(q) ||
        a.neighborhood?.toLowerCase().includes(q) ||
        city?.name?.toLowerCase().includes(q)
      )
    })
  }, [accommodations, citiesById, query])

  return (
    <div className="cmp-page">
      <div className="cmp-header">
        <div>
          <h1>Comparador</h1>
          <p className="cmp-subtitle">
            Elegí hasta {max} alojamientos y compará precio, puntuación y
            comodidades lado a lado.
          </p>
        </div>
        {compared.length > 0 && (
          <button
            type="button"
            className="btn-clear"
            onClick={clear}
            title="Quitar seleccionados"
          >
            Limpiar selección
          </button>
        )}
      </div>

      {loading && <div className="cmp-empty">Cargando alojamientos…</div>}

      {/* Tabla comparativa: solo si hay al menos uno elegido */}
      {!loading && compared.length > 0 && (
        <div className="cmp-table-wrap">
          <table className="cmp-table">
            <thead>
              <tr>
                <th className="cmp-row-label">Característica</th>
                {compared.map((a) => (
                  <td key={a.id} className="cmp-accom-cell">
                    <div className="cmp-accom-header">
                      <img
                        src={a.coverImage || 'https://images.unsplash.com/photo-1502672260266-1c1ef3d93668?q=80&w=400&auto=format&fit=crop'}
                        alt=""
                        className="cmp-accom-thumb"
                      />
                      <div>
                        <div className="cmp-accom-name">
                          <Link to={`/alojamientos/${a.id}`}>{a.name}</Link>
                        </div>
                        {a.cityId && citiesById[a.cityId] && (
                          <div className="cmp-accom-city">{citiesById[a.cityId].name}</div>
                        )}
                      </div>
                      <button
                        type="button"
                        className="cmp-remove"
                        onClick={() => remove(a.id)}
                        title="Quitar del comparador"
                        aria-label={`Quitar ${a.name}`}
                      >
                        ✕
                      </button>
                    </div>
                  </td>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row) => (
                <tr key={row.key}>
                  <th className="cmp-row-label">{row.label}</th>
                  {compared.map((a) => (
                    <td key={`${a.id}-${row.key}`} className="cmp-accom-cell">
                      {renderCell(citiesById, row.key, a)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selected.length >= max && (
        <p className="cmp-hint">
          Llegaste al límite de {max} alojamientos. Quitá uno para agregar otro.
        </p>
      )}

      {/* Selector interactivo: siempre visible para agregar/quitar */}
      {!loading && (
        <section className="cmp-picker">
          <div className="cmp-picker-head">
            <div>
              <h2>Elegí los alojamientos a comparar</h2>
              <p>
                {selected.length}/{max} elegidos · tocá{' '}
                <strong>+ Agregar</strong> en cualquiera de estas tarjetas.
              </p>
            </div>
            <div className="cmp-picker-search-wrap">
              <span className="cmp-picker-search-icon" aria-hidden="true">🔍</span>
              <input
                type="search"
                className="cmp-picker-search"
                placeholder="Buscar por nombre, barrio o ciudad…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Buscar alojamiento"
              />
            </div>
          </div>

          <div className="cmp-picker-grid">
            {pickerList.length === 0 && (
              <p className="cmp-picker-empty">
                Ningún alojamiento coincide con “{query}”.
              </p>
            )}
            {pickerList.map((a) => {
              const city = citiesById[a.cityId]
              const chosen = isSelected(a.id)
              const disabled = !chosen && !canAdd(a.id)
              const ppp = pricePerPerson(a.priceTotal, a.guestsForPrice)
              return (
                <div
                  key={a.id}
                  className={`cmp-pick-card ${chosen ? 'active' : ''}`}
                >
                  <img
                    src={a.coverImage || 'https://images.unsplash.com/photo-1502672260266-1c1ef3d93668?q=80&w=300&auto=format&fit=crop'}
                    alt=""
                    className="cmp-pick-thumb"
                    loading="lazy"
                  />
                  <div className="cmp-pick-info">
                    <span className="cmp-pick-name">{a.name}</span>
                    <span className="cmp-pick-city">
                      {city ? city.name : ''}
                      {a.neighborhood && ` · ${a.neighborhood}`}
                    </span>
                    <span className="cmp-pick-price">
                      {a.priceTotal != null ? formatPrice(a.priceTotal) : '—'}
                      {ppp != null && (
                        <span className="cmp-pick-price-per">
                          · {formatPrice(ppp)} por persona
                        </span>
                      )}
                    </span>
                    <span className="cmp-pick-rating">
                      ⭐ {a.myRating ?? '—'}/10
                    </span>
                  </div>
                  <button
                    type="button"
                    className={`cmp-pick-btn ${chosen ? 'active' : ''}`}
                    onClick={() => toggle(a.id)}
                    disabled={disabled}
                    title={
                      disabled
                        ? `Máximo ${max} alojamientos`
                        : chosen
                          ? 'Quitar del comparador'
                          : 'Agregar al comparador'
                    }
                    aria-pressed={chosen}
                  >
                    {chosen ? '✓ Elegido' : '+ Agregar'}
                  </button>
                </div>
              )
            })}
          </div>
        </section>
      )}
    </div>
  )
}

function renderCell(citiesById, key, a) {
  const city = citiesById[a.cityId]
  const ppp = pricePerPerson(a.priceTotal, a.guestsForPrice)
  switch (key) {
    case 'photo':
      return (
        <div className="cmp-cell-photo">
          <img
            src={a.coverImage || 'https://images.unsplash.com/photo-1502672260266-1c1ef3d93668?q=80&w=300&auto=format&fit=crop'}
            alt=""
            className="cmp-cell-thumb"
          />
        </div>
      )
    case 'name':
      return <div className="cmp-cell-name">{a.name}</div>
    case 'city':
      return (
        <div className="cmp-cell-city">
          {city ? city.name : ''}
          {a.neighborhood && ` · ${a.neighborhood}`}
        </div>
      )
    case 'priceTotal':
      return <div className="cmp-cell-price">{formatPrice(a.priceTotal)}</div>
    case 'pricePerPerson':
      return ppp != null ? (
        <div className="cmp-cell-price">{formatPrice(ppp)}</div>
      ) : (
        <div className="cmp-cell-muted">—</div>
      )
    case 'myRating':
      return (
        <div className={`cmp-cell-rating cmp-rating-${Math.round(a.myRating || 0)}`}>
          {a.myRating != null ? `${a.myRating}/10` : '—'}
        </div>
      )
    case 'airbnbRating':
      return (
        <div className="cmp-cell-muted">
          {a.airbnbRating != null ? `${a.airbnbRating}/5` : '—'}
        </div>
      )
    case 'distance':
      return <div className="cmp-cell-muted">{a.distanceToBeach != null ? a.distanceToBeach + ' m' : '—'}</div>
    case 'capacity':
      return <div className="cmp-cell-muted">{a.capacity != null ? a.capacity : '—'}</div>
    case 'bedrooms':
      return <div className="cmp-cell-muted">{a.bedrooms != null ? a.bedrooms : '—'}</div>
    case 'bathrooms':
      return <div className="cmp-cell-muted">{a.bathrooms != null ? a.bathrooms : '—'}</div>
    case 'pool':
    case 'garage':
    case 'grill':
    case 'airConditioning':
      return (
        <div className="cmp-cell-bool">
          {a[key] ? '✅ Sí' : '❌ No'}
        </div>
      )
    case 'notes':
      return <div className="cmp-cell-notes">{a.notes || '—'}</div>
    case 'airbnb':
      return (
        <a
          href={a.airbnbUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="cmp-cell-airbnb"
        >
          Ver en Airbnb ↗
        </a>
      )
    default:
      return <div className="cmp-cell-muted">—</div>
  }
}
