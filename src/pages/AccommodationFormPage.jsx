/* Crear o editar un alojamiento (solo desde /admin/alojamientos). */
import { useEffect, useState, useCallback } from 'react'
import { useNavigate, useParams, useLocation, Link } from 'react-router-dom'
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
import { formatRange } from '../utils/dates'
import ImageInput from '../components/ImageInput'
import '../styles/forms.css'

const ACCOM_SCHEMA = {
  cityId: [required],
  name: [required, minLength(2), maxLength(150)],
  neighborhood: [required, minLength(2), maxLength(100)],
  description: [minLength(5), maxLength(1000)],
  airbnbUrl: [url],
  priceTotal: [required, minValue(1)],
  guestsForPrice: [required, minValue(1)],
  distanceToBeach: [minValue(0)],
  capacity: [minValue(1)],
  bedrooms: [minValue(0)],
  bathrooms: [minValue(0)],
  myRating: [required, minValue(1), maxValue(10)],
  airbnbRating: [minValue(1), maxValue(5)],
  coverImage: [required, url],
}

// Interpretación del puntaje personal (1 a 10).
function ratingLabel(value) {
  const n = Number(value)
  if (!value || !Number.isFinite(n)) return 'Elegí un puntaje del 1 al 10.'
  if (n <= 3) return `${n}/10 · Poco interesante`
  if (n <= 5) return `${n}/10 · Regular`
  if (n <= 7) return `${n}/10 · Buena opción`
  if (n <= 9) return `${n}/10 · Muy buena opción`
  return '10/10 · Excelente opción'
}

export default function AccommodationFormPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { id, cityId: routeCityId } = useParams()
  const isEdit = !!id
  // La creación/edición vive en el panel de admin: según desde dónde se
  // entró, el "Volver" y el guardado devuelven a /admin/alojamientos.
  const fromAdmin = location.pathname.startsWith('/admin')
  const [cities, setCities] = useState([])
  const [acc, setAcc] = useState(null)
  const [values, setValues] = useState({
    cityId: routeCityId || '',
    name: '',
    neighborhood: '',
    description: '',
    airbnbUrl: '',
    priceTotal: '',
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
    availableRanges: [],
  })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null)
  // Borrador del rango de días disponibles (desde / hasta).
  const [rangeDraft, setRangeDraft] = useState({ start: '', end: '' })
  const [rangeError, setRangeError] = useState(null)

  useEffect(() => {
    const unsub = observeCities(setCities)
    return unsub
  }, [])

  useEffect(() => {
    if (!isEdit) return
    // Cargar el alojamiento una vez (el listado de ciudades ya está suscripto
    // por el efecto anterior: no hace falta abrir otra conexión).
    const load = async () => {
      try {
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
            availableRanges: Array.isArray(a.availableRanges)
              ? a.availableRanges.filter((r) => r && r.start && r.end)
              : [],
          })
        } else {
          setMessage('No se encontró el alojamiento.')
        }
      } catch (err) {
        console.error(err)
        setMessage('No se pudo cargar el alojamiento. Revisá la conexión y recargá.')
      }
    }
    load()
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

  /* --- Días disponibles (rangos de fechas manuales) --- */
  const addRange = () => {
    const { start, end } = rangeDraft
    if (!start || !end) {
      setRangeError('Elegí las dos fechas: desde y hasta.')
      return
    }
    if (end < start) {
      setRangeError('La fecha "hasta" no puede ser anterior a la fecha "desde".')
      return
    }
    const duplicated = (values.availableRanges || []).some(
      (r) => r.start === start && r.end === end,
    )
    if (duplicated) {
      setRangeError('Ese rango ya está cargado.')
      return
    }
    setRangeError(null)
    setValues((prev) => ({
      ...prev,
      availableRanges: [...(prev.availableRanges || []), { start, end }],
    }))
    setRangeDraft({ start: '', end: '' })
  }

  const removeRange = (index) => {
    setValues((prev) => ({
      ...prev,
      availableRanges: prev.availableRanges.filter((_, i) => i !== index),
    }))
  }

  const ppp = pricePerPerson(values.priceTotal, values.guestsForPrice)

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault()
    // Si hay un borrador completo de fechas (Desde y Hasta elegidos pero sin
    // tocar "+ Agregar rango"), se agrega automáticamente al guardar. Así
    // no se pierden las fechas cargadas.
    const draftValid =
      rangeDraft.start &&
      rangeDraft.end &&
      rangeDraft.end >= rangeDraft.start
    const draftPartial =
      (rangeDraft.start && !rangeDraft.end) ||
      (!rangeDraft.start && rangeDraft.end)
    if (draftPartial) {
      setRangeError('Elegí también la fecha "hasta" o tocá "+ Agregar rango" para guardarla.')
      setMessage(null)
      return
    }
    const mergedRanges = [
      ...(values.availableRanges || []),
      ...(draftValid ? [{ start: rangeDraft.start, end: rangeDraft.end }] : []),
    ]
    const result = validateForm({ ...values, availableRanges: mergedRanges }, ACCOM_SCHEMA)
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
        guestsForPrice: Number(values.guestsForPrice),
        distanceToBeach: values.distanceToBeach ? Number(values.distanceToBeach) : 0,
        capacity: values.capacity ? Number(values.capacity) : undefined,
        bedrooms: values.bedrooms ? Number(values.bedrooms) : undefined,
        bathrooms: values.bathrooms ? Number(values.bathrooms) : undefined,
        pool: !!values.pool,
        garage: !!values.garage,
        grill: !!values.grill,
        airConditioning: !!values.airConditioning,
        myRating: Number(values.myRating),
        airbnbRating: values.airbnbRating ? Number(values.airbnbRating) : undefined,
        notes: values.notes.trim(),
        coverImage: values.coverImage.trim(),
        images: (values.images || []).filter(Boolean),
        availableRanges: mergedRanges.filter((r) => r && r.start && r.end),
      }
      if (draftValid) {
        // Deja el borrador en la lista visible también al usuario.
        setValues((prev) => ({ ...prev, availableRanges: mergedRanges }))
        setRangeDraft({ start: '', end: '' })
      }
      if (isEdit) {
        await updateAccommodation(id, payload)
        // El guardado vuelve al panel de administración de alojamientos.
        navigate(fromAdmin ? '/admin/alojamientos' : `/alojamientos/${id}`)
      } else {
        await createAccommodation(payload)
        navigate(fromAdmin ? '/admin/alojamientos' : `/ciudades/${values.cityId}`)
      }
    } catch (err) {
      setMessage('Error al guardar el alojamiento. Revisá la conexión e intentá de nuevo.')
      console.error(err)
    } finally {
      setSaving(false)
    }
  }, [values, isEdit, id, navigate, fromAdmin, rangeDraft])

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

  // Dónde volver: a la ficha del alojamiento (edición), a la ciudad desde la
  // que se entró, o al listado global si se entró desde /alojamientos.
  const backTo = isEdit
    ? `/alojamientos/${id}`
    : routeCityId
      ? `/ciudades/${routeCityId}`
      : '/alojamientos'

  return (
    <div className="form-page">
      <div className="form-header">
        <Link to={backTo} className="back-link">
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
            className={errors.cityId ? 'has-error' : undefined}
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
          {!isEdit && cities.length === 0 && (
            <span className="form-notice">
              Todavía no hay ciudades creadas.{' '}
              <Link to="/ciudades/nuevo">Creá una ciudad</Link> para poder
              asignarle este alojamiento.
            </span>
          )}
        </div>

        <div className="form-field">
          <label>Nombre <span className="required">*</span></label>
          <input
            name="name"
            value={values.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="Casa frente al mar"
            className={errors.name ? 'has-error' : undefined}
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
            className={errors.neighborhood ? 'has-error' : undefined}
          />
          {errors.neighborhood && <span className="error-msg">{errors.neighborhood}</span>}
        </div>

        <div className="form-field">
          <label>Descripción (opcional)</label>
          <textarea
            name="description"
            value={values.description}
            onChange={(e) => handleChange('description', e.target.value)}
            rows={4}
            placeholder="Qué te gustó, qué observar…"
            className={errors.description ? 'has-error' : undefined}
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
            className={errors.airbnbUrl ? 'has-error' : undefined}
          />
          {errors.airbnbUrl && <span className="error-msg">{errors.airbnbUrl}</span>}
        </div>

        <fieldset className="form-fieldset">
          <legend className="form-legend">Precio (todo en USD)</legend>
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
                className={errors.priceTotal ? 'has-error' : undefined}
              />
              {errors.priceTotal && <span className="error-msg">{errors.priceTotal}</span>}
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
                className={errors.guestsForPrice ? 'has-error' : undefined}
              />
              {errors.guestsForPrice && <span className="error-msg">{errors.guestsForPrice}</span>}
            </div>
            <div className="form-field">
              <label>Precio por persona</label>
              <div className="price-per-display">
                {ppp != null ? formatPrice(ppp) : '—'}
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
                className={errors.distanceToBeach ? 'has-error' : undefined}
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
                className={errors.capacity ? 'has-error' : undefined}
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
                className={errors.bedrooms ? 'has-error' : undefined}
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
                className={errors.bathrooms ? 'has-error' : undefined}
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
          <legend className="form-legend">Días disponibles</legend>
          <p className="form-hint">
            Elegí <strong>Desde</strong> y <strong>Hasta</strong> y tocá
            “+ Agregar rango” para agregarlos a la lista. Si al final te
            olvidás y guardás el alojamiento, el rango que hayas escrito
            también se incorpora automáticamente. La familia podrá filtrar
            por fechas y solo verá opciones libres en <strong>todos</strong>
            los días elegidos.
          </p>
          <div className="availability-ranges">
            <div className="availability-ranges-list">
              {(values.availableRanges || []).map((r, i) => (
                <div key={i} className="availability-range-row">
                  <span className="availability-range-text">
                    📅 {formatRange(r)}
                  </span>
                  <button
                    type="button"
                    className="availability-range-remove"
                    onClick={() => removeRange(i)}
                    aria-label={`Eliminar rango ${formatRange(r)}`}
                  >
                    ✕
                  </button>
                </div>
              ))}
              {(values.availableRanges || []).length === 0 && (
                <p className="availability-empty">Sin rangos cargados.</p>
              )}
            </div>
            <div className="availability-ranges-add">
              <input
                type="date"
                value={rangeDraft.start}
                onChange={(e) =>
                  setRangeDraft((prev) => ({ ...prev, start: e.target.value }))
                }
                className="availability-date-input"
                aria-label="Fecha desde"
              />
              <span className="availability-separator">hasta</span>
              <input
                type="date"
                value={rangeDraft.end}
                onChange={(e) =>
                  setRangeDraft((prev) => ({ ...prev, end: e.target.value }))
                }
                className="availability-date-input"
                aria-label="Fecha hasta"
              />
              {rangeError && (
                <span className="availability-error">{rangeError}</span>
              )}
              <button
                type="button"
                className="btn-secondary"
                onClick={addRange}
              >
                + Agregar rango
              </button>
            </div>
          </div>
        </fieldset>

        <fieldset className="form-fieldset">
          <legend className="form-legend">Evaluación personal</legend>
          <div className="form-grid">
            <div className="form-field" style={{ gridColumn: '1 / -1' }}>
              <label>
                Mi puntuación (1 a 10) <span className="required">*</span>
              </label>
              <div className="rating-scale" role="radiogroup" aria-label="Mi puntuación">
                {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => {
                  const active = Number(values.myRating) === n
                  return (
                    <button
                      key={n}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      aria-label={`Puntuación ${n} de 10`}
                      className={`rating-scale-btn ${active ? 'active' : ''}`}
                      onClick={() => handleChange('myRating', String(n))}
                    >
                      {n}
                    </button>
                  )
                })}
              </div>
              <span className={`rating-hint ${values.myRating ? 'selected' : ''}`}>
                {ratingLabel(values.myRating)}
              </span>
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
                className={errors.airbnbRating ? 'has-error' : undefined}
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
            onClick={() => navigate(backTo)}
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
