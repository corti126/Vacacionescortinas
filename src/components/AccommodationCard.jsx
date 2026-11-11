/* Tarjeta de alojamiento */
import { Link } from 'react-router-dom'
import { formatPrice, pricePerPerson } from '../utils/format'
import StatusBadge from './StatusBadge'

export default function AccommodationCard({
  accommodation,
  status = 'pending',
  onStatusChange,
  onOpenAirbnb,
}) {
  const ppp = pricePerPerson(accommodation.priceTotal, accommodation.guestsForPrice, accommodation.currency)

  const features = []
  if (accommodation.pool) features.push('Piscina')
  if (accommodation.garage) features.push('Cochera')
  if (accommodation.grill) features.push('Parrilla')
  if (accommodation.airConditioning) features.push('Aire acondicionado')

  return (
    <article className="accommodation-card">
      <div className="accommodation-card-image">
        <img
          src={accommodation.coverImage || 'https://images.unsplash.com/photo-1502672260266-1c1ef3d93668?q=80&w=800&auto=format&fit=crop'}
          alt=""
          loading="lazy"
        />
        <StatusBadge status={status} size="sm" />
      </div>
      <div className="accommodation-card-body">
        <Link to={`/alojamientos/${accommodation.id}`} className="accommodation-card-link">
          <h3 className="accommodation-card-name">{accommodation.name}</h3>
        </Link>
        <div className="accommodation-card-location">
          {accommodation.cityName || ''}
          {accommodation.neighborhood && ` · ${accommodation.neighborhood}`}
        </div>
        <div className="accommodation-card-price">
          <span className="accommodation-card-price-total">
            {formatPrice(accommodation.priceTotal, accommodation.currency)}
          </span>
          {ppp != null && (
            <span className="accommodation-card-price-per">
              / persona {formatPrice(ppp, accommodation.currency)}
            </span>
          )}
        </div>
        <div className="accommodation-card-meta">
          <span className="meta-item" title="Distancia a la playa">🏖️ {accommodation.distanceToBeach || 0} m</span>
          <span className="meta-item" title="Capacidad">👥 {accommodation.capacity || '-'}</span>
          <span className="meta-item" title="Habitaciones">🛏️ {accommodation.bedrooms || '-'}</span>
          {accommodation.myRating != null && (
            <span className="meta-item rating" title={`Mi puntuación: ${accommodation.myRating}/10`}>
              ⭐ {accommodation.myRating}
            </span>
          )}
        </div>
        {features.length > 0 && (
          <div className="accommodation-card-features">
            {features.map((f) => (
              <span key={f} className="feature-tag">{f}</span>
            ))}
          </div>
        )}
      </div>
      <div className="accommodation-card-actions">
        <button
          type="button"
          className="accommodation-card-action view"
          onClick={() => onOpenAirbnb && onOpenAirbnb(accommodation.airbnbUrl)}
          title="Abrir en Airbnb"
        >
          Abrir Airbnb ↗
        </button>
        <button
          type="button"
          className="accommodation-card-action status"
          onClick={() => onStatusChange && onStatusChange()}
          title="Cambiar estado familiar"
        >
          {statusLabel(status)}
        </button>
      </div>
    </article>
  )
}

function statusLabel(status) {
  const labels = { pending: 'Pendiente', favorite: 'Favorita', discarded: 'Descartada' }
  return labels[status] || 'Pendiente'
}
