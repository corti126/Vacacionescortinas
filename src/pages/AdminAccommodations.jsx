/* Panel de administración de alojamientos: crear, editar y eliminar.
   Es la única vía de gestión: la pestaña pública de Alojamientos es de
   solo lectura (las decisiones familiares se cambian desde las tarjetas). */
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  observeAccommodations,
  observeCities,
  deleteAccommodation,
} from '../services/firestore'
import { formatPrice, pricePerPerson, ratingInterpretation } from '../utils/format'
import { formatRange } from '../utils/dates'
import '../styles/admin.css'

export default function AdminAccommodations() {
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
    const unsubCities = observeCities(setCities, onError)
    const unsubAccommodations = observeAccommodations((list) => {
      setAccommodations(list)
      setLoading(false)
    }, onError)
    return () => {
      unsubCities()
      unsubAccommodations()
    }
  }, [])

  const cityName = (cityId) =>
    cities.find((c) => c.id === cityId)?.name || 'Sin ciudad'

  const handleDelete = async (accommodation) => {
    const ok = window.confirm(
      `¿Eliminar "${accommodation.name}"? Esta acción no se puede deshacer.`,
    )
    if (!ok) return
    setDeletingId(accommodation.id)
    try {
      await deleteAccommodation(accommodation.id)
    } catch (err) {
      console.error(err)
      alert('No se pudo eliminar el alojamiento. Revisá la conexión e intentá de nuevo.')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="admin-page">
      <div className="admin-header admin-header--row">
        <div>
          <Link to="/admin" className="back-link">← Volver a Administrar</Link>
          <h1>Alojamientos</h1>
          <p className="admin-subtitle">
            Creá, editá y eliminá las casas y departamentos. Los cambios se
            reflejan para toda la familia en tiempo real.
          </p>
        </div>
        <Link to="/admin/alojamientos/nuevo" className="btn-primary">
          + Nuevo alojamiento
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

      {loading && <div className="list-empty">Cargando alojamientos…</div>}

      {!loading && !loadError && accommodations.length === 0 && (
        <div className="list-empty">
          <p>Todavía no hay alojamientos cargados.</p>
          <button
            type="button"
            className="btn-primary"
            onClick={() => navigate('/admin/alojamientos/nuevo')}
          >
            + Cargar el primer alojamiento
          </button>
        </div>
      )}

      {!loading && !loadError && accommodations.length > 0 && (
        <ul className="admin-acc-list">
          {accommodations.map((a) => {
            const ppp = pricePerPerson(a.priceTotal, a.guestsForPrice)
            const ranges = (a.availableRanges || []).filter((r) => r?.start)
            return (
              <li key={a.id} className="admin-acc-row">
                <img
                  className="admin-acc-thumb"
                  src={a.coverImage || 'https://images.unsplash.com/photo-1502672260266-1c1ef3d93668?q=80&w=400&auto=format&fit=crop'}
                  alt=""
                  loading="lazy"
                />
                <div className="admin-acc-info">
                  <span className="admin-acc-name">{a.name}</span>
                  <span className="admin-acc-meta">
                    {cityName(a.cityId)}
                    {a.neighborhood ? ` · ${a.neighborhood}` : ''}
                  </span>
                  <span className="admin-acc-meta">
                    {formatPrice(a.priceTotal)}
                    {ppp != null && ` · ${formatPrice(ppp)} por persona`}
                    {a.myRating != null &&
                      ` · ⭐ ${a.myRating}/10 (${ratingInterpretation(a.myRating)})`}
                  </span>
                  <span className="admin-acc-avail">
                    {ranges.length > 0
                      ? `📅 ${ranges.map(formatRange).join('  ·  ')}`
                      : '📅 Sin días de disponibilidad cargados'}
                  </span>
                </div>
                <div className="admin-acc-actions">
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => navigate(`/admin/alojamientos/${a.id}/editar`)}
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    className="btn-danger"
                    onClick={() => handleDelete(a)}
                    disabled={deletingId === a.id}
                  >
                    {deletingId === a.id ? 'Eliminando…' : 'Eliminar'}
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
