/* ErrorBoundary: si un render revienta por datos inesperados, muestra una
   pantalla amable en vez de blanco total. */
import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('[Brasil Trip] Error no controlado:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary" role="alert">
          <div className="error-boundary-card">
            <div className="error-boundary-icon" aria-hidden="true">🌊</div>
            <h1>Algo se rompió</h1>
            <p>
              Ocurrió un error inesperado mostrando esta página.{' '}
              <strong>Tus alojamientos y decisiones siguen guardados en la nube.</strong>
            </p>
            <div className="error-boundary-actions">
              <button
                type="button"
                className="btn-primary"
                onClick={() => window.location.assign('/')}
              >
                Volver al inicio
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => window.location.reload()}
              >
                Reintentar
              </button>
            </div>
            {this.state.error?.message && (
              <p className="error-boundary-detail">Detalle: {this.state.error.message}</p>
            )}
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
