/* Panel de administración de ciudades: crear, editar y eliminar.
   La gestión de destinos vive SIEMPRE acá: las páginas públicas de la
   familia son de solo lectura (solo pueden cambiar el estado familiar). */
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { deleteCity, observeAccommodations, observeCities } from '../services/firestore'
import '../styles/admin.css'

export default function AdminCities() {
  const navigate = useNavigate()
  const [cities, setCities] = useState([])
  const [accommodations, setAccommodations] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [deletingId, setDeletingId] = useState(null)

  useEffect(() => {
    const onError = (error) => {
      setLoadError(error)
      setLoading(false)
    }
    let ready = 0
    const markReady = () => {
      ready += 1
      if (ready >= 2) setLoading(false)
    }
    const unsubCities = observeCities((list) => {
      setCities(list)
      markReady()
    }, onError)
    const unsubAccommodations = observeAccommodations((list) => {
      setAccommodations(list)
      markReady()
    }, onError)
    return () => {
      unsubCities()
      unsubAccommodations()
    }
  }, [])

  const countsByCity = {}
  for (const a of accommodations) {
    countsByCity[a.cityId] = (countsByCity[a.cityId] || 0) + 1
  }

  const handleDelete = async (city) => {
    const count = countsByCity[city.id] || 0
    const detail =
      count > 0
        ? ` Esto también va a eliminar los ${count} alojamiento${count !== 1 ? 's' : ''} de esta ciudad.`
        : ''
    const ok = window.confirm(
      `¿Eliminar la ciudad "${city.name}"?${detail} Esta acción no se puede deshacer.`,
    )
    if (!ok) return
    setDeletingId(city.id)
    try {
      await deleteCity(city.id)
    } catch (err) {
      console.error(err)
      alert('No se pudo eliminar la ciudad. Revisá la conexión e intentá de nuevo.')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="admin-page">
      <div className="admin-header admin-header--row">
        <div>
          <Link to="/admin" className="back-link">← Volver a Administrar</Link>
          <h1>Ciudades / Destinos</h1>
          <p className="admin-subtitle">
            Creá, editá y eliminá los destinos del viaje. También se
            administran desde acá los alojamientos de cada ciudad.
          </p>
        </div>
        <Link to="/admin/ciudades/nuevo" className="btn-primary">
          + Nueva ciudad
        </Link>
      </div>

      <div className="admin-warning">
        ⚠️ Esta aplicación no tiene cuentas ni contraseñas: quien tenga el
        enlace puede modificar estos datos.
      </div>

      {loadError && (
        <div className="load-error" role="alert">
          No se pudo conectar con Firestore. Revisá la conexión a internet y
          recargá la página.
        </div>
      )}

      {loading && <div className="list-empty">Cargando ciudades…</div>}

      {!loading && !loadError && cities.length === 0 && (
        <div className="list-empty">
          <p>Todavía no hay ciudades creadas.</p>
          <button
            type="button"
            className="btn-primary"
            onClick={() => navigate('/admin/ciudades/nuevo')}
          >
            + Crear la primera ciudad
          </button>
        </div>
      )}

      {!loading && !loadError && cities.length > 0 && (
        <ul className="admin-acc-list">
          {cities.map((city) => {
            const count = countsByCity[city.id] || 0
            return (
              <li key={city.id} className="admin-acc-row">
                <img
                  className="admin-acc-thumb"
                  src={city.coverImage || 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=400&auto=format&fit=crop'}
                  alt=""
                  loading="lazy"
                />
                <div className="admin-acc-info">
                  <span className="admin-acc-name">{city.name}</span>
                  {city.region && (
                    <span className="admin-acc-meta">{city.region}</span>
                  )}
                  <span className="admin-acc-meta">
                    {count} alojamiento{count !== 1 ? 's' : ''}
                  </span>
                  <span className="admin-acc-avail">
                    {city.lat != null && city.lng != null
                      ? `📍 ${city.lat}, ${city.lng}`
                      : '📍 Sin coordenadas — no aparece en el mapa'}
                  </span>
                </div>
                <div className="admin-acc-actions">
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => navigate(`/ciudades/${city.id}`)}
                  >
                    Ver
                  </button>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => navigate(`/admin/ciudades/${city.id}/editar`)}
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    className="btn-danger"
                    onClick={() => handleDelete(city)}
                    disabled={deletingId === city.id}
                  >
                    {deletingId === city.id ? 'Eliminando…' : 'Eliminar'}
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
