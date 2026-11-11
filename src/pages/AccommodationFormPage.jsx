/* Crear o editar un alojamiento */
import { useEffect, useState, useCallback } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import {
  getAccommodation,
  observeCities,
  createAccommodation,
  updateAccommodation,
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
import { formatPrice, pricePerPerson } from '../utils/format'
import ImageInput from '../components/ImageInput'
import '../styles/forms.css'

const ACCOM_SCHEMA = {
  cityId: [required],
  name: [required, minLength(2), maxLength(150)],
  neighborhood: [required, minLength(2), maxLength(100)],
  description: [required, minLength(5), maxLength(1000)],
  airbnbUrl: [url],
  priceTotal: [required, minValue(1)],
  guestsForPrice: [required, minValue(1)],
  distanceToBeach: [minValue(0)],
  capacity: [minValue(1)],
  bedrooms: [minValue(0)],
  bathrooms: [minValue(0)],
  myRating: [minValue(1), maxValue(10)],
  airbnbRating: [minValue(1), maxValue(5)],
  coverImage: [required, url],
}

export default function AccommodationFormPage() {
  const navigate = useNavigate()
  const { id, cityId: routeCityId } = useParams()
  const isEdit = !!id
  const [cities, setCities] = useState([])
  const [acc, setAcc] = useState(null)
  const [values, setValues] = useState({
    cityId: routeCityId || '',
    name: '',
    neighborhood: '',
    description: '',
    airbnbUrl: '',
    priceTotal: '',
    currency: 'BRL',
    guestsForPrice: '',
    distanceToBeach: '',
    capacity: '',
    bedrooms: '',
    bathrooms: '',
    pool: false,
    garage: false,
    grill: false,
    airConditioning: false,
    myRating: '',
    airbnbRating: '',
    notes: '',
    coverImage: '',
    images: [],
  })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null)

  useEffect(() => {
    const unsub = observeCities(setCities)
    return unsub
  }, [])

  useEffect(() => {
    if (!isEdit) return
    const unsub = observeCities(() => {}) // keep cities subscription alive
    // Cargar el alojamiento una vez
    const load = async () => {
      const a = await getAccommodation(id)
      if (a) {
        setAcc(a)
        setValues({
          cityId: a.cityId || '',
          name: a.name || '',
          neighborhood: a.neighborhood || '',
          description: a.description || '',
          airbnbUrl: a.airbnbUrl || '',
          priceTotal: a.priceTotal != null ? String(a.priceTotal) : '',
          currency: a.currency || 'BRL',
          guestsForPrice: a.guestsForPrice != null ? String(a.guestsForPrice) : '',
          distanceToBeach: a.distanceToBeach != null ? String(a.distanceToBeach) : '',
          capacity: a.capacity != null ? String(a.capacity) : '',
          bedrooms: a.bedrooms != null ? String(a.bedrooms) : '',
          bathrooms: a.bathrooms != null ? String(a.bathrooms) : '',
          pool: !!a.pool,
          garage: !!a.garage,
          grill: !!a.grill,
          airConditioning: !!a.airConditioning,
          myRating: a.myRating != null ? String(a.myRating) : '',
          airbnbRating: a.airbnbRating != null ? String(a.airbnbRating) : '',
          notes: a.notes || '',
          coverImage: a.coverImage || '',
          images: a.images || [],
        })
      }
    }
    load()
    return unsub
  }, [isEdit, id])

  const handleChange = (field, value) => {
    setValues((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: null }))
  }

  const handleToggle = (field) => {
    setValues((prev) => {
      const next = { ...prev, [field]: !prev[field] }
      if (errors[field]) next[field] = prev[field]
      return next
    })
  }

  const ppp = pricePerPerson(values.priceTotal, values.guestsForPrice)

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault()
    const result = validateForm(values, ACCOM_SCHEMA)
    if (!result.valido) {
      setErrors(result.errores)
      setMessage(null)
      return
    }
    setSaving(true)
    setMessage(null)
    try {
      const payload = {
        cityId: values.cityId,
        name: values.name.trim(),
        neighborhood: values.neighborhood.trim(),
        description: values.description.trim(),
        airbnbUrl: values.airbnbUrl.trim(),
        priceTotal: Number(values.priceTotal),
        currency: values.currency,
        guestsForPrice: Number(values.guestsForPrice),
        distanceToBeach: values.distanceToBeach ? Number(values.distanceToBeach) : 0,
        capacity: values.capacity ? Number(values.capacity) : undefined,
        bedrooms: values.bedrooms ? Number(values.bedrooms) : undefined,
        bathrooms: values.bathrooms ? Number(values.bathrooms) : undefined,
        pool: !!values.pool,
        garage: !!values.garage,
        grill: !!values.grill,
        airConditioning: !!values.airConditioning,
        myRating: values.myRating ? Number(values.myRating) : undefined,
        airbnbRating: values.airbnbRating ? Number(values.airbnbRating) : undefined,
        notes: values.notes.trim(),
        coverImage: values.coverImage.trim(),
        images: (values.images || []).filter(Boolean),
      }
      if (isEdit) {
        await updateAccommodation(id, payload)
      } else {
        await createAccommodation(payload)
      }
      setMessage(isEdit ? 'Alojamiento actualizado.' : 'Alojamiento creado.')
      navigate(isEdit ? `/alojamientos/${id}/editar` : `/ciudades/${values.cityId}`)
    } catch (err) {
      setMessage('Error al guardar el alojamiento.')
      console.error(err)
    } finally {
      setSaving(false)
    }
  }, [values, isEdit, id, navigate])

  const cityOptions = cities.map((c) => ({ value: c.id, label: c.name }))

  if (isEdit && !acc) {
    return (
      <div className="form-page">
        <div className="form-card">
          <h2>Cargando alojamiento…</h2>
          <p className="muted">Un momento.</p>
        </div>
      </div>
    )
  }

  const cityDisabled = isEdit || !!routeCityId

  return (
    <div className="form-page">
      <div className="form-header">
        <Link to={isEdit ? `/alojamientos/${id}/editar` : `/ciudades/${values.cityId || 'nuevo'}`} className="back-link">
          ← Volver
        </Link>
        <h1>{isEdit ? 'Editar alojamiento' : 'Nuevo alojamiento'}</h1>
      </div>
      <form className="form-card" onSubmit={handleSubmit}>
        <div className="form-field">
          <label>Ciudad <span className="required">*</span></label>
          <select
            name="cityId"
            value={values.cityId}
            onChange={(e) => handleChange('cityId', e.target.value)}
            disabled={cityDisabled}
            error={!!errors.cityId}
          >
            <option value="">Seleccionar ciudad</option>
            {cityOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          {errors.cityId && <span className="error-msg">{errors.cityId}</span>}
          {cityDisabled && routeCityId && (
            <span className="image-input-hint">Ciudad preseleccionada desde el destino.</span>
          )}
        </div>

        <div className="form-field">
          <label>Nombre <span className="required">*</span></label>
          <input
            name="name"
            value={values.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="Casa frente al mar"
            error={!!errors.name}
          />
          {errors.name && <span className="error-msg">{errors.name}</span>}
        </div>

        <div className="form-field">
          <label>Barrio o zona <span className="required">*</span></label>
          <input
            name="neighborhood"
            value={values.neighborhood}
            onChange={(e) => handleChange('neighborhood', e.target.value)}
            placeholder="Leblon, Río de Janeiro"
            error={!!errors.neighborhood}
          />
          {errors.neighborhood && <span className="error-msg">{errors.neighborhood}</span>}
        </div>

        <div className="form-field">
          <label>Descripción <span className="required">*</span></label>
          <textarea
            name="description"
            value={values.description}
            onChange={(e) => handleChange('description', e.target.value)}
            rows={4}
            placeholder="Qué te gustó, qué observar…"
            error={!!errors.description}
          />
          {errors.description && <span className="error-msg">{errors.description}</span>}
        </div>

        <div className="form-field">
          <label>Enlace de Airbnb</label>
          <input
            name="airbnbUrl"
            type="url"
            value={values.airbnbUrl}
            onChange={(e) => handleChange('airbnbUrl', e.target.value)}
            placeholder="https://airbnb.com/rooms/..."
            error={!!errors.airbnbUrl}
          />
          {errors.airbnbUrl && <span className="error-msg">{errors.airbnbUrl}</span>}
        </div>

        <fieldset className="form-fieldset">
          <legend className="form-legend">Precio</legend>
          <div className="form-grid">
            <div className="form-field">
              <label>Precio total (estadia completa) <span className="required">*</span></label>
              <input
                name="priceTotal"
                type="number"
                step="0.01"
                min="0"
                value={values.priceTotal}
                onChange={(e) => handleChange('priceTotal', e.target.value)}
                placeholder="2500"
                error={!!errors.priceTotal}
              />
              {errors.priceTotal && <span className="error-msg">{errors.priceTotal}</span>}
            </div>
            <div className="form-field">
              <label>Moneda</label>
              <select
                name="currency"
                value={values.currency}
                onChange={(e) => handleChange('currency', e.target.value)}
                error={false}
              >
                <option value="BRL">BRL (Reales brasileños)</option>
                <option value="USD">USD (Dólares)</option>
              </select>
            </div>
            <div className="form-field">
              <label>Personas para el cálculo <span className="required">*</span></label>
              <input
                name="guestsForPrice"
                type="number"
                min="1"
                value={values.guestsForPrice}
                onChange={(e) => handleChange('guestsForPrice', e.target.value)}
                placeholder="4"
                error={!!errors.guestsForPrice}
              />
              {errors.guestsForPrice && <span className="error-msg">{errors.guestsForPrice}</span>}
            </div>
            <div className="form-field">
              <label>Precio por persona</label>
              <div className="price-per-display">
                {ppp != null ? formatPrice(ppp, values.currency) : '—'}
              </div>
            </div>
          </div>
        </fieldset>

        <fieldset className="form-fieldset">
          <legend className="form-legend">Ubicación y capacidad</legend>
          <div className="form-grid">
            <div className="form-field">
              <label>Distancia a la playa (metros)</label>
              <input
                name="distanceToBeach"
                type="number"
                min="0"
                value={values.distanceToBeach}
                onChange={(e) => handleChange('distanceToBeach', e.target.value)}
                placeholder="300"
                error={!!errors.distanceToBeach}
              />
              {errors.distanceToBeach && <span className="error-msg">{errors.distanceToBeach}</span>}
            </div>
            <div className="form-field">
              <label>Capacidad de huéspedes</label>
              <input
                name="capacity"
                type="number"
                min="1"
                value={values.capacity}
                onChange={(e) => handleChange('capacity', e.target.value)}
                placeholder="6"
                error={!!errors.capacity}
              />
              {errors.capacity && <span className="error-msg">{errors.capacity}</span>}
            </div>
            <div className="form-field">
              <label>Habitaciones</label>
              <input
                name="bedrooms"
                type="number"
                min="0"
                value={values.bedrooms}
                onChange={(e) => handleChange('bedrooms', e.target.value)}
                placeholder="3"
                error={!!errors.bedrooms}
              />
              {errors.bedrooms && <span className="error-msg">{errors.bedrooms}</span>}
            </div>
            <div className="form-field">
              <label>Baños</label>
              <input
                name="bathrooms"
                type="number"
                min="0"
                value={values.bathrooms}
                onChange={(e) => handleChange('bathrooms', e.target.value)}
                placeholder="2"
                error={!!errors.bathrooms}
              />
              {errors.bathrooms && <span className="error-msg">{errors.bathrooms}</span>}
            </div>
          </div>
        </fieldset>

        <fieldset className="form-fieldset">
          <legend className="form-legend">Características</legend>
          <div className="toggle-grid">
            <label className="toggle-label">
              <input
                type="checkbox"
                checked={!!values.pool}
                onChange={() => handleToggle('pool')}
              />
              Piscina
            </label>
            <label className="toggle-label">
              <input
                type="checkbox"
                checked={!!values.garage}
                onChange={() => handleToggle('garage')}
              />
              Cochera
            </label>
            <label className="toggle-label">
              <input
                type="checkbox"
                checked={!!values.grill}
                onChange={() => handleToggle('grill')}
              />
              Parrilla
            </label>
            <label className="toggle-label">
              <input
                type="checkbox"
                checked={!!values.airConditioning}
                onChange={() => handleToggle('airConditioning')}
              />
              Aire acondicionado
            </label>
          </div>
        </fieldset>

        <fieldset className="form-fieldset">
          <legend className="form-legend">Evaluación personal</legend>
          <div className="form-grid">
            <div className="form-field">
              <label>Mi puntuación (1 a 10)</label>
              <input
                name="myRating"
                type="number"
                min="1"
                max="10"
                value={values.myRating}
                onChange={(e) => handleChange('myRating', e.target.value)}
                placeholder="8"
                error={!!errors.myRating}
              />
              {errors.myRating && <span className="error-msg">{errors.myRating}</span>}
            </div>
            <div className="form-field">
              <label>Calificación de Airbnb (opcional, 1 a 5)</label>
              <input
                name="airbnbRating"
                type="number"
                min="1"
                max="5"
                step="0.1"
                value={values.airbnbRating}
                onChange={(e) => handleChange('airbnbRating', e.target.value)}
                placeholder="4.5"
                error={!!errors.airbnbRating}
              />
              {errors.airbnbRating && <span className="error-msg">{errors.airbnbRating}</span>}
            </div>
            <div className="form-field" style={{ gridColumn: '1 / -1' }}>
              <label>Observaciones</label>
              <textarea
                name="notes"
                value={values.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                rows={3}
                placeholder="Lo que te gustó y aspectos negativos…"
              />
            </div>
          </div>
        </fieldset>

        <ImageInput
          value={{ coverImage: values.coverImage, images: values.images || [] }}
          onChange={(next) => {
            handleChange('coverImage', next.coverImage)
            handleChange('images', next.images)
          }}
        />
        {errors.coverImage && <span className="error-msg">{errors.coverImage}</span>}

        {message && (
          <div className={`message ${message.startsWith('Error') ? 'error' : 'success'}`}>
            {message}
          </div>
        )}

        <div className="form-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => navigate(isEdit ? `/ciudades/${values.cityId}` : '/ciudades')}
          >
            Cancelar
          </button>
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? 'Guardando…' : isEdit ? 'Actualizar alojamiento' : 'Crear alojamiento'}
          </button>
        </div>
      </form>
    </div>
  )
}
