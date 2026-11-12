/* Ficha individual de un alojamiento: galería, datos y estado familiar */
import { useEffect, useMemo, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import {
  getAccommodation,
  observeCities,
  observeAccommodationStatuses,
  setAccommodationStatus,
  deleteAccommodation,
  ACCOMMODATION_STATUS,
} from '../services/firestore'
import StatusBadge from '../components/StatusBadge'
import { formatPrice, pricePerPerson, ratingInterpretation } from '../utils/format'
import '../styles/accommodation-view.css'

export default function AccommodationViewPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [accommodation, setAccommodation] = useState(null)
  const [cities, setCities] = useState([])
  const [statuses, setStatuses] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    let ready = 0
    const markReady = () => {
      ready += 1
      if (ready >= 3) setLoading(false)
    }
    getAccommodation(id).then((a) => {
      setAccommodation(a)
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
      unsubStatuses()
      unsubCities()
    }
  }, [id])

  const city = useMemo(() => cities.find((c) => c.id === accommodation?.cityId), [
    cities,
    accommodation,
  ])
  const status = useMemo(
    () => statuses.find((s) => s.id === id)?.status || ACCOMMODATION_STATUS.PENDING,
    [statuses, id],
  )
  const ppp = pricePerPerson(
    accommodation?.priceTotal,
    accommodation?.guestsForPrice,
  )

  const images = useMemo(() => {
    const imgs = []
    if (accommodation?.coverImage) imgs.push(accommodation.coverImage)
    if (accommodation?.images) imgs.push(...accommodation.images)
    return imgs.filter(Boolean)
  }, [accommodation])

  const features = []
  if (accommodation?.pool) features.push('Piscina')
  if (accommodation?.garage) features.push('Cochera')
  if (accommodation?.grill) features.push('Parrilla')
  if (accommodation?.airConditioning) features.push('Aire acondicionado')

  const handleSetStatus = async (next) => {
    await setAccommodationStatus(id, next)
  }

  const handleDelete = async () => {
    if (!window.confirm('¿Eliminar este alojamiento? Esta acción no se puede deshacer.'))
      return
    setDeleting(true)
    try {
      await deleteAccommodation(id)
      navigate('/ciudades')
    } catch (err) {
      alert('No se pudo eliminar el alojamiento.')
      console.error(err)
    } finally {
      setDeleting(false)
    }
  }

  if (loading || !accommodation) {
    return (
      <div className="view-page">
        <div className="view-header"><h1>Cargando alojamiento…</h1></div>
        <div className="view-empty">Un momento.</div>
      </div>
    )
  }

  return (
    <div className="view-page">
      <div className="view-header">
        <Link to={city ? `/ciudades/${city.id}` : '/ciudades'} className="back-link">
          ← Volver a {city ? city.name : 'ciudades'}
        </Link>
        <div className="view-actions">
          <StatusBadge status={status} size="md" />
          <button
            type="button"
            className="btn-secondary"
            onClick={() => navigate(`/alojamientos/${id}/editar`)}
          >
            Editar
          </button>
          <button
            type="button"
            className="btn-danger"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? 'Eliminando…' : 'Eliminar'}
          </button>
        </div>
      </div>

      <div className="view-gallery">
        {images.map((img, i) => (
          <img key={i} src={img} alt="" className="view-gallery-img" />
        ))}
        {images.length === 0 && (
          <div className="view-gallery-empty">Sin imágenes cargadas.</div>
        )}
      </div>

      <div className="view-body">
        <div className="view-main">
          <h1>{accommodation.name}</h1>
          <div className="view-location">
            {city ? city.name : ''}
            {accommodation.neighborhood && ` · ${accommodation.neighborhood}`}
          </div>
          <p className="view-desc">{accommodation.description || 'Sin descripción.'}</p>
          {accommodation.airbnbUrl && (
            <a
              href={accommodation.airbnbUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="view-airbnb"
            >
              Ver publicación original en Airbnb ↗
            </a>
          )}
        </div>

        <div className="view-side">
          <div className="view-card">
            <h3>Precio</h3>
            <p className="view-price">
              {formatPrice(accommodation.priceTotal)}
            </p>
            {ppp != null && (
              <p className="view-price-per">
                {formatPrice(ppp)} por persona
              </p>
            )}
            <p className="view-muted">
              Para {accommodation.guestsForPrice || '-'} persona{accommodation.guestsForPrice !== 1 ? 's' : ''}
            </p>
            {accommodation.distanceToBeach != null && (
              <p className="view-muted">🏖️ {accommodation.distanceToBeach} m a la playa</p>
            )}
          </div>

          <div className="view-card">
            <h3>Mi puntuación personal</h3>
            <p className="view-rating">
              {accommodation.myRating != null
                ? `${accommodation.myRating}/10 — ${ratingInterpretation(accommodation.myRating)}`
                : 'Sin puntuación'}
            </p>
            {accommodation.airbnbRating != null && (
              <p className="view-muted">
                Calificación Airbnb: {accommodation.airbnbRating}/5
              </p>
            )}
          </div>

          <div className="view-card">
            <h3>Capacidad y espacios</h3>
            <p className="view-muted">👥 {accommodation.capacity || '-'} huéspedes</p>
            <p className="view-muted">🛏️ {accommodation.bedrooms || '-'} habitaciones</p>
            <p className="view-muted">🚿 {accommodation.bathrooms || '-'} baños</p>
          </div>

          {features.length > 0 && (
            <div className="view-card">
              <h3>Características</h3>
              <div className="view-features">
                {features.map((f) => (
                  <span key={f} className="feature-tag">{f}</span>
                ))}
              </div>
            </div>
          )}

          {accommodation.notes && (
            <div className="view-card">
              <h3>Observaciones</h3>
              <p className="view-notes">{accommodation.notes}</p>
            </div>
          )}

          <div className="view-card">
            <h3>Estado familiar</h3>
            <select
              value={status}
              onChange={(e) => handleSetStatus(e.target.value)}
              className="view-status-select"
            >
              <option value="pending">⏳ Pendiente</option>
              <option value="favorite">❤️ Favorita</option>
              <option value="discarded">❌ Descartada</option>
            </select>
            <p className="view-muted">
              Esta decisión la ven todos los familiares en tiempo real.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
