/* Gestor de imágenes por URL: portada obligatoria + imágenes adicionales */
import { useState } from 'react'
import { url as validUrl } from '../utils/validation'

export default function ImageInput({
  value,           // { coverImage: string, images: string[] }
  onChange,        // (next) => void
  disabled = false,
}) {
  const [cover, setCover] = useState(value?.coverImage || '')
  const [images, setImages] = useState(value?.images?.filter(Boolean) || [])
  const [coverError, setCoverError] = useState(null)

  const handleCoverChange = (e) => {
    const next = e.target.value.trim()
    setCover(next)
    setCoverError(validUrl(next) || null)
    onChange && onChange({ coverImage: next, images })
  }

  const addImage = () => {
    const next = [...images, '']
    setImages(next)
    onChange && onChange({ coverImage: cover, images: next })
  }

  const updateImage = (index, e) => {
    const next = [...images]
    const val = e.target.value.trim()
    next[index] = val
    setImages(next)
    onChange && onChange({ coverImage: cover, images: next })
  }

  const removeImage = (index) => {
    const next = images.filter((_, i) => i !== index)
    setImages(next)
    onChange && onChange({ coverImage: cover, images: next })
  }

  const hasValidCover = cover !== '' && !coverError

  return (
    <div className="image-input">
      <div className="image-input-section">
        <label className="image-input-label">Imagen de portada <span className="required">*</span></label>
        <input
          className={`image-input-field ${coverError ? 'error' : ''}`}
          type="url"
          placeholder="https://ejemplo.com/imagen.jpg"
          value={cover}
          onChange={handleCoverChange}
          disabled={disabled}
        />
        {coverError && <span className="image-input-error">{coverError}</span>}
        {!cover && <span className="image-input-hint">La portada es obligatoria.</span>}
      </div>

      <div className="image-input-section">
        <label className="image-input-label">Imágenes adicionales (opcional)</label>
        <div className="image-list">
          {images.map((img, i) => {
            const imgError = validUrl(img) || null
            return (
              <div key={i} className="image-item">
                <input
                  className={`image-item-field ${imgError ? 'error' : ''}`}
                  type="url"
                  placeholder="https://ejemplo.com/imagen.jpg"
                  value={img}
                  onChange={(e) => updateImage(i, e)}
                  disabled={disabled}
                />
                <button
                  type="button"
                  className="image-item-remove"
                  onClick={() => removeImage(i)}
                  disabled={disabled}
                  aria-label="Eliminar imagen"
                >
                  ×
                </button>
                {imgError && <span className="image-item-error">URL inválida</span>}
              </div>
            )
          })}
          <button
            type="button"
            className="image-add-button"
            onClick={addImage}
            disabled={disabled}
          >
            + Agregar imagen
          </button>
          {!images.length && <span className="image-input-hint">Agregá fotos adicionales del alojamiento.</span>}
        </div>
      </div>

      {hasValidCover && (
        <div className="image-preview">
          <img src={cover} alt="Portada" className="image-preview-thumb" />
        </div>
      )}
    </div>
  )
}
