import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useTheme } from '../context/useTheme.js'
import '../styles/layout.css'

const NAV_ITEMS = [
  { to: '/', label: 'Inicio' },
  { to: '/ciudades', label: 'Destinos' },
  { to: '/favoritos', label: 'Favoritas' },
  { to: '/pendientes', label: 'Pendientes' },
  { to: '/descartados', label: 'Descartadas' },
  { to: '/mapa', label: 'Mapa' },
  { to: '/comparador', label: 'Comparador' },
  { to: '/admin', label: 'Administrar' },
]

const THEME_OPTIONS = [
  { value: 'light', label: 'Claro', icon: '☀️' },
  { value: 'dark', label: 'Oscuro', icon: '🌙' },
  { value: 'auto', label: 'Auto', icon: '🔄' },
]

export default function Layout({ children }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const location = useLocation()

  return (
    <>
      <nav className="navbar">
        <div className="navbar-inner container">
          <Link to="/" className="navbar-brand" aria-label="Brasil Trip - inicio">
            <span className="navbar-brand-icon">🇧🇷</span>
            Brasil Trip
          </Link>

          <button
            className="navbar-menu-button"
            onClick={() => setMenuOpen((o) => !o)}
            aria-expanded={menuOpen}
            aria-label="Abrir menú"
          >
            <span className="menu-icon">☰</span>
          </button>

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

            <div className="navbar-theme">
              <span className="navbar-theme-title">Tema</span>
              <div className="navbar-theme-select" role="radiogroup" aria-label="Seleccionar tema">
                {THEME_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    role="radio"
                    aria-checked={theme === option.value}
                    className={`navbar-theme-option ${theme === option.value ? 'active' : ''}`}
                    onClick={() => setTheme(option.value)}
                  >
                    <span className="theme-icon">{option.icon}</span>
                    <span className="theme-text">{option.label}</span>
                  </button>
                ))}
              </div>
            </div>
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
