/* Crear o editar una ciudad */
import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import {
  createCity,
  updateCity,
  observeCities,
} from '../services/firestore'
import {
  validateForm,
  required,
  minLength,
  maxLength,
  url,
  minValue,
  maxValue,
} from '../utils/validation'
import ImageInput from '../components/ImageInput'
import '../styles/forms.css'

const CITY_SCHEMA = {
  name: [required, minLength(2), maxLength(100)],
  description: [required, minLength(5), maxLength(500)],
  region: [required],
  coverImage: [required, url],
  lat: [minValue(-90), maxValue(90)],
  lng: [minValue(-180), maxValue(180)],
}

const REGIONES = [
  'Río de Janeiro',
  'Buenos Aires', // no, Brasil. Quito.
  'Río de Janeiro (RJ)',
  'Buzios (RJ)',
  'Arraial do Cabo (RJ)',
  'Florianópolis (SC)',
  'Bombinhas (SC)',
  'Porto de Galinhas (PE)',
  'Salvador (BA)',
  'Ilhéus (BA)',
  'Natal (RN)',
  'Fortaleza (CE)',
  'Otra',
]

export default function CityFormPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = !!id
  const [city, setCity] = useState(null)
  const [values, setValues] = useState({
    name: '',
    description: '',
    region: '',
    coverImage: '',
    lat: '',
    lng: '',
  })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null)

  useEffect(() => {
    if (!isEdit) return
    const unsub = observeCities((list) => {
      const c = list.find((x) => x.id === id)
      setCity(c)
      if (c) {
        setValues({
          name: c.name || '',
          description: c.description || '',
          region: c.region || '',
          coverImage: c.coverImage || '',
          lat: c.lat != null ? String(c.lat) : '',
          lng: c.lng != null ? String(c.lng) : '',
        })
      }
    })
    return unsub
  }, [isEdit, id])

  const handleChange = (field, value) => {
    setValues((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: null }))
  }

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault()
    const result = validateForm(values, CITY_SCHEMA)
    if (!result.valido) {
      setErrors(result.errores)
      setMessage(null)
      return
    }
    setSaving(true)
    setMessage(null)
    try {
      const payload = {
        name: values.name.trim(),
        description: values.description.trim(),
        region: values.region.trim(),
        coverImage: values.coverImage.trim(),
        lat: values.lat ? Number(values.lat) : undefined,
        lng: values.lng ? Number(values.lng) : undefined,
      }
      if (isEdit) {
        await updateCity(id, payload)
      } else {
        await createCity(payload)
      }
      setMessage(isEdit ? 'Ciudad actualizada.' : 'Ciudad creada.')
      navigate(`/ciudades/${id || 'nuevo'}`)
    } catch (err) {
      setMessage('Error al guardar la ciudad.')
      console.error(err)
    } finally {
      setSaving(false)
    }
  }, [values, isEdit, id, navigate])

  if (isEdit && !city) {
    return (
      <div className="form-page">
        <div className="form-card">
          <h2>Cargando ciudad…</h2>
          <p className="muted">Un momento.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="form-page">
      <div className="form-header">
        <Link to="/ciudades" className="back-link">← Volver a ciudades</Link>
        <h1>{isEdit ? 'Editar ciudad' : 'Nueva ciudad'}</h1>
      </div>
      <form className="form-card" onSubmit={handleSubmit}>
        <div className="form-field">
          <label>Nombre <span className="required">*</span></label>
          <input
            name="name"
            value={values.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="Río de Janeiro"
            error={!!errors.name}
          />
          {errors.name && <span className="error-msg">{errors.name}</span>}
        </div>

        <div className="form-field">
          <label>Región / estado <span className="required">*</span></label>
          <select
            name="region"
            value={values.region}
            onChange={(e) => handleChange('region', e.target.value)}
            error={!!errors.region}
          >
            <option value="">Seleccionar región</option>
            {REGIONES.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
          {errors.region && <span className="error-msg">{errors.region}</span>}
        </div>

        <div className="form-field">
          <label>Descripción <span className="required">*</span></label>
          <textarea
            name="description"
            value={values.description}
            onChange={(e) => handleChange('description', e.target.value)}
            rows={4}
            placeholder="Breve descripción de la ciudad para la familia."
            error={!!errors.description}
          />
          {errors.description && <span className="error-msg">{errors.description}</span>}
        </div>

        <ImageInput
          value={{ coverImage: values.coverImage, images: [] }}
          onChange={(next) => handleChange('coverImage', next.coverImage)}
        />
        {errors.coverImage && <span className="error-msg">{errors.coverImage}</span>}

        <div className="form-grid">
          <div className="form-field">
            <label>Latitud</label>
            <input
              name="lat"
              type="number"
              step="any"
              value={values.lat}
              onChange={(e) => handleChange('lat', e.target.value)}
              placeholder="-22.9"
              error={!!errors.lat}
            />
            {errors.lat && <span className="error-msg">{errors.lat}</span>}
          </div>
          <div className="form-field">
            <label>Longitud</label>
            <input
              name="lng"
              type="number"
              step="any"
              value={values.lng}
              onChange={(e) => handleChange('lng', e.target.value)}
              placeholder="-43.2"
              error={!!errors.lng}
            />
            {errors.lng && <span className="error-msg">{errors.lng}</span>}
          </div>
        </div>

        {message && <div className={`message ${message.startsWith('Error') ? 'error' : 'success'}`}>{message}</div>}

        <div className="form-actions">
          <button type="button" className="btn-secondary" onClick={() => navigate(isEdit ? `/ciudades/${id}` : '/ciudades')}>
            Cancelar
          </button>
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? 'Guardando…' : isEdit ? 'Actualizar ciudad' : 'Crear ciudad'}
          </button>
        </div>
      </form>
    </div>
  )
}
