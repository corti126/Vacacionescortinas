/* Panel de administración sencillo (sin autenticación, acceso por enlace) */
import { Link } from 'react-router-dom'
import '../styles/admin.css'

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
          <p>Ver, crear, editar y eliminar ciudades (destinos).</p>
        </Link>
        <Link to="/alojamientos" className="admin-card">
          <span className="admin-card-icon">🏠</span>
          <h3>Alojamientos</h3>
          <p>
            Ver, crear, editar y eliminar alojamientos. Cada uno se carga
            asignado a una ciudad creada.
          </p>
        </Link>
        <Link to="/mapa" className="admin-card">
          <span className="admin-card-icon">🗺️</span>
          <h3>Mapa de Brasil</h3>
          <p>Ver las ciudades en el mapa interactivo.</p>
        </Link>
      </div>

      <div className="admin-quick-create">
        <h2>Cargar contenido nuevo</h2>
        <div className="admin-quick-create-actions">
          <Link to="/ciudades/nuevo" className="btn-primary">+ Nueva ciudad</Link>
          <Link to="/alojamientos/nuevo" className="btn-primary">+ Nuevo alojamiento</Link>
        </div>
        <p className="admin-quick-create-hint">
          Los alojamientos se crean siempre <strong>asignados a una ciudad</strong>:
          primero cargá el destino (por ejemplo: Río de Janeiro, Búzios,
          Florianópolis) y después agregá las casas o departamentos dentro de esa
          ciudad.
        </p>
      </div>
    </div>
  )
}
