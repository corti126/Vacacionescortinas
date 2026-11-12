/* Constantes compartidas del panel de filtros (separadas del componente
   para cumplir la regla de React Fast Refresh). */
export const SORT_OPTIONS = [
  { value: 'price-asc', label: 'Menor precio' },
  { value: 'price-desc', label: 'Mayor precio' },
  { value: 'distance-asc', label: 'Menor distancia a la playa' },
  { value: 'rating-desc', label: 'Mayor puntuación personal' },
  { value: 'rating-asc', label: 'Menor puntuación personal' },
]

export const STATUS_OPTIONS = [
  { value: '', label: 'Cualquier estado' },
  { value: 'pending', label: 'Pendiente' },
  { value: 'favorite', label: 'Favorita' },
  { value: 'discarded', label: 'Descartada' },
]

export const EMPTY_FILTERS = {
  cityId: '',
  maxPrice: '',
  maxDistance: '',
  minCapacity: '',
  minBedrooms: '',
  pool: false,
  garage: false,
  minRating: '',
  status: '',
  // Filtro de disponibilidad (calendario): rango [availFrom .. availTo].
  availFrom: '',
  availTo: '',
}
