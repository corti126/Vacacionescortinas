import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext.jsx'
import Layout from './layout/Layout'
import Home from './pages/Home'
import CitiesList from './pages/CitiesList'
import CityDetail from './pages/CityDetail'
import Mapa from './pages/Mapa'
import StatusList from './pages/StatusList'
import CityFormPage from './pages/CityFormPage'
import AccommodationFormPage from './pages/AccommodationFormPage'
import Admin from './pages/Admin'
import './styles/app.css'

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/ciudades" element={<CitiesList />} />
            <Route path="/ciudades/nuevo" element={<CityFormPage />} />
            <Route path="/ciudades/:id/editar" element={<CityFormPage />} />
            <Route path="/ciudades/:id" element={<CityDetail />} />
            <Route path="/ciudades/:cityId/nuevo-alojamiento" element={<AccommodationFormPage />} />
            <Route path="/alojamientos/:id/editar" element={<AccommodationFormPage />} />
            <Route path="/mapa" element={<Mapa />} />
            <Route path="/favoritos" element={<StatusList status="favorite" />} />
            <Route path="/pendientes" element={<StatusList status="pending" />} />
            <Route path="/descartados" element={<StatusList status="discarded" />} />
            <Route path="/admin" element={<Admin />} />
            {/* Rutas pendientes de fases: /favoritos, /pendientes, /descartados, /mapa, /alojamientos/:id */}
          </Routes>
        </Layout>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
