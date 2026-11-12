/* Listado público de ciudades: solo lectura. Crear/editar/eliminar
   vive en el panel de admin (/admin/ciudades). */
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  observeCities,
  observeAccommodations,
} from '../services/firestore'
import CityCard from '../components/CityCard'
import '../styles/lists.css'

export default function CitiesList() {
  const [cities, setCities] = useState([])
  const [accommodations, setAccommodations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const onError = (error) => {
      console.error(error)
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

  const countsByCity = {}
  for (const a of accommodations) {
    countsByCity[a.cityId] = (countsByCity[a.cityId] || 0) + 1
  }

  if (loading) {
    return (
      <div className="list-page">
        <div className="list-header">
          <h1>Ciudades</h1>
        </div>
        <div className="list-empty">Cargando…</div>
      </div>
    )
  }

  return (
    <div className="list-page">
      <div className="list-header">
        <h1>Ciudades</h1>
        <Link to="/mapa" className="btn-secondary">🗺️ Ver en el mapa</Link>
      </div>

      {cities.length === 0 ? (
        <div className="list-empty">
          <p>Aún no hay ciudades cargadas.</p>
        </div>
      ) : (
        <div className="city-list-grid">
          {cities.map((city) => (
            <CityCard
              key={city.id}
              city={{ ...city, accommodationCount: countsByCity[city.id] || 0 }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
