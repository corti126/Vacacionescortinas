/* Tarjeta de ciudad (solo lectura: editar/eliminar vive en /admin/ciudades) */
import { Link } from 'react-router-dom'
import { recifeInfo, isRecife } from '../utils/geo'
import { onImgError } from '../utils/images'

export default function CityCard({ city }) {
  const recife = recifeInfo(city)
  return (
    <article className="city-card">
      <div className="city-card-image">
        <img onError={onImgError}
          src={city.coverImage || 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=800&auto=format&fit=crop'}
          alt=""
          loading="lazy"
        />
      </div>
      <div className="city-card-body">
        <Link to={`/ciudades/${city.id}`} className="city-card-link">
          <h3 className="city-card-name">{city.name}</h3>
        </Link>
        {city.region && <span className="city-card-region">{city.region}</span>}
        {city.description && (
          <p className="city-card-desc">{city.description}</p>
        )}
        <div className="city-card-meta">
          <span className="city-card-count">
            {city.accommodationCount || 0} alojamiento
            {city.accommodationCount !== 1 ? 's' : ''}
          </span>
          {recife && (
            <span className="city-card-recife" title="Distancia lineal y tiempo estimado en auto desde el Aeropuerto de Recife">
              {isRecife(city) ? '✈️ Base de llegada' : '✈️ ' + recife.kmText + ' · ~' + recife.timeText}
            </span>
          )}
        </div>
      </div>
    </article>
  )
}
