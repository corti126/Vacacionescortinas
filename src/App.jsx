import { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext.jsx'
import { ComparatorProvider } from './context/ComparatorContext.jsx'
import Layout from './layout/Layout'

// Hoja de estilo única y ordenada: si se carga una página directamente (o por
// code splitting), todos los estilos globales ya están disponibles.
import './styles/app.css'
import './styles/components.css'
import './styles/lists.css'
import './styles/forms.css'
import './styles/home.css'
import './styles/admin.css'
import './styles/comparator.css'
import './styles/accommodation-view.css'
import './styles/map.css'

// Code splitting: cada página baja su propio chunk para que la primera carga
// (Inicio) sea liviana. Firebase y Leaflet quedan en chunks compartidos.
const Home = lazy(() => import('./pages/Home'))
const CitiesList = lazy(() => import('./pages/CitiesList'))
const CityDetail = lazy(() => import('./pages/CityDetail'))
const Mapa = lazy(() => import('./pages/Mapa'))
const AccommodationsList = lazy(() => import('./pages/AccommodationsList'))
const Comparator = lazy(() => import('./pages/Comparator'))
const AccommodationViewPage = lazy(() => import('./pages/AccommodationViewPage'))
const CityFormPage = lazy(() => import('./pages/CityFormPage'))
const AccommodationFormPage = lazy(() => import('./pages/AccommodationFormPage'))
const Admin = lazy(() => import('./pages/Admin'))

function RouteFallback() {
  return (
    <div className="route-loading" role="status" aria-live="polite">
      <span className="route-loading-spinner" />
      <span>Cargando…</span>
    </div>
  )
}

function App() {
  return (
    <ThemeProvider>
      <ComparatorProvider>
        <BrowserRouter>
          <Layout>
            <Suspense fallback={<RouteFallback />}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/ciudades" element={<CitiesList />} />
                <Route path="/ciudades/nuevo" element={<CityFormPage />} />
                <Route path="/ciudades/:id" element={<CityDetail />} />
                <Route path="/ciudades/:id/editar" element={<CityFormPage />} />
                <Route
                  path="/ciudades/:cityId/nuevo-alojamiento"
                  element={<AccommodationFormPage />}
                />
                <Route path="/alojamientos" element={<AccommodationsList />} />
                <Route path="/alojamientos/nuevo" element={<AccommodationFormPage />} />
                <Route path="/alojamientos/:id" element={<AccommodationViewPage />} />
                <Route path="/alojamientos/:id/editar" element={<AccommodationFormPage />} />
                <Route path="/mapa" element={<Mapa />} />
                <Route path="/comparador" element={<Comparator />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="*" element={<Home />} />
              </Routes>
            </Suspense>
          </Layout>
        </BrowserRouter>
      </ComparatorProvider>
    </ThemeProvider>
  )
}

export default App
