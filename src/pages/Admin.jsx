/* Panel de administración sencillo (sin autenticación, acceso por enlace) */
import { Link } from 'react-router-dom'

export default function Admin() {
  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>Administrar</h1>
        <p className="admin-subtitle">
          Cargá y editá ciudades y alojamientos. Los cambios se reflejan para toda la familia en tiempo real.
        </p>
        <div className="admin-warning">
          ⚠️ Esta aplicación no tiene cuentas ni contraseñas. Quien tenga el enlace puede editar el contenido.
        </div>
      </div>

      <div className="admin-grid">
        <Link to="/ciudades" className="admin-card">
          <span className="admin-card-icon">🏙️</span>
          <h3>Ciudades</h3>
          <p>Ver, crear, editar y eliminar ciudades.</p>
        </Link>
        <Link to="/mapa" className="admin-card">
          <span className="admin-card-icon">🗺️</span>
          <h3>Mapa de Brasil</h3>
          <p>Ver las ciudades en el mapa interactivo.</p>
        </Link>
      </div>
    </div>
  )
}
