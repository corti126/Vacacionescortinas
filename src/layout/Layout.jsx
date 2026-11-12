import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useTheme } from '../context/useTheme.js'
import '../styles/layout.css'

const NAV_ITEMS = [
  { to: '/', label: 'Inicio' },
  { to: '/ciudades', label: 'Destinos' },
  { to: '/alojamientos', label: 'Alojamientos' },
  { to: '/mapa', label: 'Mapa' },
  { to: '/comparador', label: 'Comparador' },
  { to: '/admin', label: 'Administrar' },
]

export default function Layout({ children }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const { resolvedTheme, setTheme } = useTheme()
  const location = useLocation()
  const toggleTheme = () => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')

  return (
    <>
      <nav className="navbar">
        <div className="navbar-inner container">
          <Link to="/" className="navbar-brand" aria-label="Brasil Trip - inicio">
            <span className="navbar-brand-icon">🇧🇷</span>
            <span className="navbar-brand-text">Brasil Trip</span>
          </Link>

          <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`navbar-link ${location.pathname === item.to ? 'active' : ''}`}
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="navbar-end">
            <button
              type="button"
              className="navbar-theme-toggle"
              onClick={toggleTheme}
              aria-pressed={resolvedTheme === 'dark'}
              aria-label={resolvedTheme === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
              title={resolvedTheme === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
            >
              <span className="navbar-theme-toggle-icon" aria-hidden="true">
                {resolvedTheme === 'dark' ? '☀️' : '🌙'}
              </span>
            </button>

            <button
              className="navbar-menu-button"
              onClick={() => setMenuOpen((o) => !o)}
              aria-expanded={menuOpen}
              aria-label="Abrir menú"
            >
              <span className="menu-icon">☰</span>
            </button>
          </div>
        </div>
      </nav>

      <main className="page">{children}</main>

      <footer className="footer">
        <div className="footer-inner container">
          <p className="footer-note">
            Brasil Trip — organiza y compara alojamientos en familia.{' '}
            <strong>Las decisiones (favorita / pendiente / descartada) son compartidas</strong>
            entre todos los familiares que accedan al enlace. No hay cuentas ni registros.
          </p>
          <p className="footer-credit">© 2026 Brasil Trip · Datos en Cloud Firestore</p>
        </div>
      </footer>
    </>
  )
}
