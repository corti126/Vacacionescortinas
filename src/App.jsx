import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext.jsx'
import { ComparatorProvider } from './context/ComparatorContext.jsx'
import Layout from './layout/Layout'
import Home from './pages/Home'
import CitiesList from './pages/CitiesList'
import CityDetail from './pages/CityDetail'
import Mapa from './pages/Mapa'
import AccommodationsList from './pages/AccommodationsList'
import Comparator from './pages/Comparator'
import AccommodationViewPage from './pages/AccommodationViewPage'
import CityFormPage from './pages/CityFormPage'
import AccommodationFormPage from './pages/AccommodationFormPage'
import Admin from './pages/Admin'
import './styles/app.css'

function App() {
  return (
    <ThemeProvider>
      <ComparatorProvider>
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/ciudades" element={<CitiesList />} />
              <Route path="/ciudades/nuevo" element={<CityFormPage />} />
              <Route path="/ciudades/:id/editar" element={<CityFormPage />} />
              <Route path="/ciudades/:id" element={<CityDetail />} />
              <Route path="/ciudades/:cityId/nuevo-alojamiento" element={<AccommodationFormPage />} />
              <Route path="/alojamientos" element={<AccommodationsList />} />
              <Route path="/alojamientos/:id" element={<AccommodationViewPage />} />
              <Route path="/alojamientos/:id/editar" element={<AccommodationFormPage />} />
              <Route path="/mapa" element={<Mapa />} />
              <Route path="/comparador" element={<Comparator />} />
              <Route path="/admin" element={<Admin />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </ComparatorProvider>
    </ThemeProvider>
  )
}

export default App
