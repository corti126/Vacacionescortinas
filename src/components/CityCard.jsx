/* Tarjeta de ciudad (solo lectura: editar/eliminar vive en /admin/ciudades) */
import { Link } from 'react-router-dom'

export default function CityCard({ city }) {
  return (
    <article className="city-card">
      <div className="city-card-image">
        <img
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
        </div>
      </div>
    </article>
  )
}
