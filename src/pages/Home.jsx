import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import heroImg from '../assets/hero.png'
import {
  observeCities,
  observeAccommodations,
  observeAccommodationStatuses,
  ACCOMMODATION_STATUS,
} from '../services/firestore'
import '../styles/home.css'

const PLACEHOLDER_CITY =
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=1200&auto=format&fit=crop'

function statusCounts(accommodations, statusesById) {
  const counts = {
    [ACCOMMODATION_STATUS.PENDING]: 0,
    [ACCOMMODATION_STATUS.FAVORITE]: 0,
    [ACCOMMODATION_STATUS.DISCARDED]: 0,
  }
  for (const a of accommodations) {
    const status = statusesById[a.id]?.status || ACCOMMODATION_STATUS.PENDING
    counts[status] = (counts[status] || 0) + 1
  }
  return counts
}

export default function Home() {
  const [cities, setCities] = useState([])
  const [accommodations, setAccommodations] = useState([])
  const [statuses, setStatuses] = useState([])

  useEffect(() => {
    const unsubCities = observeCities(setCities)
    const unsubAccommodations = observeAccommodations(setAccommodations)
    const unsubStatuses = observeAccommodationStatuses(setStatuses)

    return () => {
      unsubCities()
      unsubAccommodations()
      unsubStatuses()
    }
  }, [])

  const statusesById = {}
  for (const s of statuses) {
    statusesById[s.id] = s
  }
  const counts = statusCounts(accommodations, statusesById)

  const quickAccess = [
    { to: '/ciudades', label: 'Todos los destinos', count: cities.length },
    { to: '/favoritos', label: 'Favoritas', count: counts[ACCOMMODATION_STATUS.FAVORITE] },
    { to: '/pendientes', label: 'Pendientes', count: counts[ACCOMMODATION_STATUS.PENDING] },
    { to: '/descartados', label: 'Descartadas', count: counts[ACCOMMODATION_STATUS.DISCARDED] },
    { to: '/mapa', label: 'Mapa de Brasil', count: null },
  ]

  return (
    <div className="home">
      <header className="home-hero">
        <div className="home-hero-content">
          <img src={heroImg} alt="" className="home-hero-image" />
          <h1>Brasil Trip 🇧🇷</h1>
          <p className="home-subtitle">Nuestro próximo viaje en familia.</p>

          <div className="home-stats">
            <div className="stat">
              <span className="stat-value">{cities.length}</span>
              <span className="stat-label">Ciudades investigadas</span>
            </div>
            <div className="stat">
              <span className="stat-value">{accommodations.length}</span>
              <span className="stat-label">Alojamientos en total</span>
            </div>
            <div className="stat">
              <span className="stat-value favorite">{counts[ACCOMMODATION_STATUS.FAVORITE]}</span>
              <span className="stat-label">Favoritas</span>
            </div>
            <div className="stat">
              <span className="stat-value pending">{counts[ACCOMMODATION_STATUS.PENDING]}</span>
              <span className="stat-label">Pendientes</span>
            </div>
            <div className="stat">
              <span className="stat-value discarded">{counts[ACCOMMODATION_STATUS.DISCARDED]}</span>
              <span className="stat-label">Descartadas</span>
            </div>
          </div>
        </div>
      </header>

      <section className="home-quick-access">
        <div className="container">
          <h2>Accesos rápidos</h2>
          <div className="quick-grid">
            {quickAccess.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="quick-card"
              >
                <span className="quick-label">{item.label}</span>
                {item.count !== null && (
                  <span className="quick-count">{item.count}</span>
                )}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="home-cities">
        <div className="container">
          <h2>Destinos</h2>
          <p className="section-intro">
            Explorá las ciudades donde ya hay alojamientos investigados.
          </p>
          {cities.length === 0 ? (
            <div className="empty">
              <p>Aún no hay ciudades cargadas. Podés agregarlas desde Administrar.</p>
            </div>
          ) : (
            <div className="city-grid">
              {cities.map((city) => (
                <Link key={city.id} to={`/ciudades/${city.id}`} className="city-card">
                  <div className="city-image">
                    <img
                      src={city.coverImage || PLACEHOLDER_CITY}
                      alt=""
                      loading="lazy"
                    />
                  </div>
                  <div className="city-body">
                    <h3>{city.name}</h3>
                    <p className="city-region">{city.region || ''}</p>
                    <p className="city-desc">{city.description || 'Sin descripción.'}</p>
                    <span className="city-count">
                      {city.accommodationCount || 0} alojamiento{city.accommodationCount !== 1 ? 's' : ''}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
