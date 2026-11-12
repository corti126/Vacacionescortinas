/* Comparador de hasta 3 alojamientos: tabla comparativa */
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
  const { selected, remove, clear, max } = useComparator()
  const [cities, setCities] = useState([])
  const [accommodations, setAccommodations] = useState([])
  const [loading, setLoading] = useState(true)

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

  const compared = useMemo(() => {
    return selected
      .map((id) => accommodations.find((a) => a.id === id))
      .filter(Boolean)
  }, [selected, accommodations])

  if (loading) {
    return (
      <div className="cmp-page">
        <div className="cmp-header"><h1>Comparador</h1></div>
        <div className="cmp-empty">Cargando…</div>
      </div>
    )
  }

  if (compared.length === 0) {
    return (
      <div className="cmp-page">
        <div className="cmp-header">
          <h1>Comparador</h1>
          <p className="cmp-subtitle">
            Seleccioná hasta {max} alojamientos desde cualquier listado para
            compararlos uno al lado del otro.
          </p>
        </div>
        <div className="cmp-empty">
          <p>Aún no hay alojamientos seleccionados.</p>
          <p>Usá el botón “Comparar” de las tarjetas para agregarlos.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="cmp-page">
      <div className="cmp-header">
        <h1>Comparador</h1>
        <div className="cmp-actions">
          <button
            type="button"
            className="btn-clear"
            onClick={clear}
            title="Quitar seleccionados"
          >
            Limpiar selección
          </button>
        </div>
      </div>

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
                    {renderCell(row.key, a)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected.length >= max && (
        <p className="cmp-hint">
          Llegaste al límite de {max} alojamientos. Quitá uno para agregar otro.
        </p>
      )}
    </div>
  )

  function renderCell(key, a) {
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
          <div className="cmp-cell-price">
            {formatPrice(ppp)}
          </div>
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
}
