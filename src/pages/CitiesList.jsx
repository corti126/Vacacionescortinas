/* Listado de ciudades: ver, crear, editar, eliminar */
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  observeCities,
  observeAccommodations,
  deleteCity,
} from '../services/firestore'
import CityCard from '../components/CityCard'
import '../styles/lists.css'

export default function CitiesList() {
  const [cities, setCities] = useState([])
  const [accommodations, setAccommodations] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

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

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar esta ciudad? Esta acción no se puede deshacer.')) return
    try {
      await deleteCity(id)
    } catch (err) {
      alert('No se pudo eliminar la ciudad.')
      console.error(err)
    }
  }

  if (loading) {
    return (
      <div className="list-page">
        <div className="list-header">
          <h1>Ciudades</h1>
          <Link to="/ciudades/nuevo" className="btn-primary">+ Nueva ciudad</Link>
        </div>
        <div className="list-empty">Cargando…</div>
      </div>
    )
  }

  return (
    <div className="list-page">
      <div className="list-header">
        <h1>Ciudades</h1>
        <Link to="/ciudades/nuevo" className="btn-primary">+ Nueva ciudad</Link>
      </div>

      {cities.length === 0 ? (
        <div className="list-empty">
          <p>Aún no hay ciudades cargadas. Creá la primera para empezar.</p>
        </div>
      ) : (
        <div className="city-list-grid">
          {cities.map((city) => (
            <CityCard
              key={city.id}
              city={{ ...city, accommodationCount: countsByCity[city.id] || 0 }}
              onEdit={() => navigate(`/ciudades/${city.id}/editar`)}
              onDelete={() => handleDelete(city.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
