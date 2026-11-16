/* Ficha individual de un alojamiento.
   Diseño tipo "publicación": galería grande + panel resumen a la derecha;
   detalles debajo en tarjetas. Solo muestra el estado familiar que la
   familia comparte: editar/eliminar vive en el panel de administración. */
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  observeAccommodationById,
  observeCities,
  observeAccommodationStatuses,
  setAccommodationStatus,
  ACCOMMODATION_STATUS,
} from '../services/firestore'
import StatusBadge from '../components/StatusBadge'
import { formatPrice, pricePerPerson, ratingInterpretation, formatDate } from '../utils/format'
import { formatRange } from '../utils/dates'
import { recifeInfo, isRecife } from '../utils/geo'
import { useComparator } from '../context/useComparator.js'
import '../styles/accommodation-view.css'
import { onImgError } from '../utils/images'

export default function AccommodationViewPage() {
  const { id } = useParams()
  const [accommodation, setAccommodation] = useState(null)
  const [cities, setCities] = useState([])
  const [statuses, setStatuses] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeImage, setActiveImage] = useState(0)
  const [loadError, setLoadError] = useState(null)
  const touchStartX = useRef(null)
  const { selected, toggle, isSelected, canAdd, max } = useComparator()

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
    const unsubDoc = observeAccommodationById(
      id,
      (a) => {
        setAccommodation(a)
        markReady()
      },
      (error) => {
        console.error(error)
        setLoadError(error)
        markReady()
      },
    )
    const unsubStatuses = observeAccommodationStatuses((list) => {
      setStatuses(list)
      markReady()
    }, onError)
    const unsubCities = observeCities((list) => {
      setCities(list)
      markReady()
    }, onError)
    return () => {
      unsubDoc()
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

  const currentIndex = Math.min(
    Math.max(activeImage || 0, 0),
    Math.max(images.length - 1, 0),
  )

  // Precarga las fotos adyacentes para que pasar con las flechas sea instantáneo.
  useEffect(() => {
    if (images.length <= 1) return
    const next = new Image()
    next.src = images[(currentIndex + 1) % images.length]
    const prev = new Image()
    prev.src = images[(currentIndex - 1 + images.length) % images.length]
  }, [currentIndex, images])

  const features = []
  if (accommodation?.pool) features.push({ icon: '🏊', label: 'Piscina' })
  if (accommodation?.garage) features.push({ icon: '🅿️', label: 'Cochera' })
  if (accommodation?.grill) features.push({ icon: '🍖', label: 'Parrilla' })
  if (accommodation?.airConditioning) features.push({ icon: '❄️', label: 'Aire acondicionado' })

  const availableRanges = (accommodation?.availableRanges || []).filter((r) => r?.start && r?.end)

  const handleSetStatus = async (next) => {
    await setAccommodationStatus(id, next)
  }

  if (loading || (!accommodation && !loadError)) {
    return (
      <div className="view-page">
        <div className="view-topbar">
          <Link to="/alojamientos" className="view-back">← Volver</Link>
        </div>
        <div className="view-loading">
          <div className="view-loading-skeleton view-loading-cover" />
          <div className="view-loading-skeleton view-loading-lines" />
        </div>
      </div>
    )
  }

  if (loadError || !accommodation) {
    return (
      <div className="view-page">
        <div className="view-topbar">
          <Link to="/alojamientos" className="view-back">← Volver</Link>
        </div>
        <div className="view-empty">
          <p>No se encontró el alojamiento o no se pudo conectar.</p>
          <Link to="/alojamientos" className="btn-primary">Volver al listado</Link>
        </div>
      </div>
    )
  }

  const showingImage = images[currentIndex]
  const showGalleryNav = images.length > 1

  const goPrev = () => {
    if (!showGalleryNav) return
    setActiveImage((i) => (Math.min(i, images.length - 1) - 1 + images.length) % images.length)
  }
  const goNext = () => {
    if (!showGalleryNav) return
    setActiveImage((i) => (i + 1) % images.length)
  }

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches?.[0]?.clientX ?? null
  }
  const handleTouchEnd = (e) => {
    const start = touchStartX.current
    touchStartX.current = null
    if (start == null || !showGalleryNav) return
    const end = e.changedTouches?.[0]?.clientX
    if (end == null) return
    const dx = end - start
    if (dx <= -40) goNext()
    else if (dx >= 40) goPrev()
  }
  const handleGalleryKey = (e) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault()
      goPrev()
    } else if (e.key === 'ArrowRight') {
      e.preventDefault()
      goNext()
    }
  }

  return (
    <div className="view-page">
      {/* Barra superior */}
      <div className="view-topbar">
        <Link to={city ? `/ciudades/${city.id}` : '/ciudades'} className="view-back">
          ← Volver a {city ? city.name : 'ciudades'}
        </Link>
        <StatusBadge status={status} size="md" />
      </div>

      {/* Hero: galería + resumen */}
      <section className="view-hero">
        <div className="view-gallery">
          <div
            className="view-cover"
            tabIndex={showGalleryNav ? 0 : -1}
            role={showGalleryNav ? 'group' : undefined}
            aria-label={showGalleryNav ? 'Galería de fotos (usá las flechas del teclado o deslizá)' : undefined}
            onKeyDown={handleGalleryKey}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <img onError={onImgError}
              src={showingImage}
              alt={`Foto ${currentIndex + 1} de ${accommodation.name}`}
              className="view-cover-img"
              draggable={false}
            />
            {showGalleryNav && (
              <>
                <button
                  type="button"
                  className="view-nav-btn view-nav-btn--prev"
                  onClick={goPrev}
                  aria-label="Imagen anterior"
                  title="Imagen anterior"
                >
                  ‹
                </button>
                <button
                  type="button"
                  className="view-nav-btn view-nav-btn--next"
                  onClick={goNext}
                  aria-label="Imagen siguiente"
                  title="Imagen siguiente"
                >
                  ›
                </button>
              </>
            )}
            {showGalleryNav && (
              <span className="view-cover-counter">
                {currentIndex + 1} / {images.length}
              </span>
            )}
          </div>
          {images.length > 1 && (
            <div className="view-thumbs">
              {images.map((img, i) => (
                <button
                  key={i}
                  type="button"
                  className={`view-thumb ${i === currentIndex ? 'active' : ''}`}
                  onClick={() => setActiveImage(i)}
                  aria-label={`Imagen ${i + 1}`}
                  aria-current={i === currentIndex}
                >
                  <img onError={onImgError} src={img} alt="" loading="lazy" />
                </button>
              ))}
            </div>
          )}
        </div>

        <aside className="view-summary">
          <div>
            <h1 className="view-name">{accommodation.name}</h1>
            <p className="view-location">
              📍 {city ? city.name : 'Ciudad sin nombre'}
              {accommodation.neighborhood && ` · ${accommodation.neighborhood}`}
            </p>
            <div className="view-rating-line">
              <span className="view-rating-badge">⭐ {accommodation.myRating ?? '—'}</span>
              <span className="view-rating-text">
                sobre 10 · {ratingInterpretation(accommodation.myRating)}
              </span>
            </div>
          </div>

          <div className="view-price-block">
            <div className="view-price">{formatPrice(accommodation.priceTotal)}</div>
            <div className="view-price-meta">
              estadía completa · {formatPrice(ppp)} por persona
            </div>
            <div className="view-price-foot">
              Para {accommodation.guestsForPrice || '-'} persona
              {accommodation.guestsForPrice !== 1 ? 's' : ''}
            </div>
          </div>

          {accommodation.distanceToBeach != null && (
            <p className="view-beach">🏖️ A <strong>{accommodation.distanceToBeach} m</strong> de la playa</p>
          )}
          {(() => {
            const r = recifeInfo(city)
            return r ? (
              <p className="view-recife" title="Distancia lineal desde el Aeropuerto de Recife y tiempo estimado en auto (aprox., ruta terrestre)">
                {isRecife(city) ? '✈️ Base de llegada' : <>✈️ <strong>{r.kmText}</strong> · ~{r.timeText} de auto desde el aeropuerto de Recife</>}
              </p>
            ) : null
          })()}

          {availableRanges.length > 0 && (
            <div className="view-availability">
              <h3>📅 Días disponibles</h3>
              <ul className="view-availability-list">
                {availableRanges.map((r, i) => (
                  <li key={i} className="view-availability-item">{formatRange(r)}</li>
                ))}
              </ul>
            </div>
          )}
          {availableRanges.length === 0 && (
            <p className="view-availability-empty">
              📅 Sin fechas de disponibilidad cargadas.
            </p>
          )}

          {(() => {
            const inCompare = isSelected(id)
            const full = !inCompare && selected.length >= max
            return (
              <button
                type="button"
                className={`view-compare ${inCompare ? 'active' : ''}`}
                onClick={() => toggle(id)}
                disabled={!inCompare && !canAdd(id)}
                title={full ? `Ya elegiste ${max} alojamientos para comparar` : undefined}
                aria-pressed={inCompare}
              >
                {inCompare ? '✓ Quitar del comparador' : '⚖️ Agregar al comparador'}
              </button>
            )
          })()}

          {accommodation.airbnbUrl && (
            <a
              href={accommodation.airbnbUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="view-airbnb-cta"
            >
              Ver y reservar en Airbnb ↗
            </a>
          )}

          <div className="view-status-block">
            <label className="view-status-label" htmlFor="view-status-select">
              Estado familiar
            </label>
            <select
              id="view-status-select"
              value={status}
              onChange={(e) => handleSetStatus(e.target.value)}
              className="view-status-select"
            >
              <option value="pending">⏳ Pendiente</option>
              <option value="favorite">❤️ Favorita</option>
              <option value="discarded">❌ Descartada</option>
            </select>
            <p className="view-status-hint">
              Esta decisión la ven todos los familiares en tiempo real.
            </p>
          </div>

          {(accommodation.createdAt || accommodation.updatedAt) && (
            <div className="view-dates">
              {accommodation.createdAt && (
                <span>🗓 Cargado el {formatDate(accommodation.createdAt)}</span>
              )}
              {accommodation.updatedAt && (
                <span>✏️ Actualizado el {formatDate(accommodation.updatedAt, 'short')}</span>
              )}
            </div>
          )}
        </aside>
      </section>

      {/* Detalles: estadísticas + contenido */}
      <section className="view-content">
        <div className="view-stats">
          <div className="stat-card">
            <span className="stat-icon">👥</span>
            <span className="stat-value">{accommodation.capacity ?? '—'}</span>
            <span className="stat-label">Huéspedes</span>
          </div>
          <div className="stat-card">
            <span className="stat-icon">🛏️</span>
            <span className="stat-value">{accommodation.bedrooms ?? '—'}</span>
            <span className="stat-label">Habitaciones</span>
          </div>
          <div className="stat-card">
            <span className="stat-icon">🚿</span>
            <span className="stat-value">{accommodation.bathrooms ?? '—'}</span>
            <span className="stat-label">Baños</span>
          </div>
          {features.map((f) => (
            <div key={f.label} className="stat-card stat-card--feature">
              <span className="stat-icon">{f.icon}</span>
              <span className="stat-value stat-value--sm">Sí</span>
              <span className="stat-label">{f.label}</span>
            </div>
          ))}
        </div>

        <div className="view-content-grid">
          {accommodation.description && (
            <div className="view-card view-card--description">
              <h2>Descripción</h2>
              <p>{accommodation.description}</p>
            </div>
          )}

          {accommodation.notes && (
            <div className="view-card view-card--notes">
              <h2>Observaciones</h2>
              <p>{accommodation.notes}</p>
            </div>
          )}

          {accommodation.airbnbRating != null && (
            <div className="view-card view-card--rating">
              <h2>Calificación Airbnb</h2>
              <p className="view-airbnb-rating">
                ⭐ {accommodation.airbnbRating}
                <span className="view-airbnb-rating-max">/5</span>
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
