/* Lógica compartida de filtros y ordenamiento de alojamientos.
   La usan la pestaña global de Alojamientos y el detalle de ciudad, para que
   ambos lugares filtren igual (incluido el calendario de disponibilidad). */
import { ACCOMMODATION_STATUS } from '../services/firestore'
import { rangesCoverAll } from './dates'

export function filterAccommodations(accommodations, statusesById, filters) {
  return accommodations.filter((a) => {
    const st = statusesById[a.id]?.status || ACCOMMODATION_STATUS.PENDING
    if (filters.cityId && a.cityId !== filters.cityId) return false
    if (filters.maxPrice && Number(a.priceTotal) > Number(filters.maxPrice))
      return false
    if (
      filters.maxDistance &&
      Number(a.distanceToBeach) > Number(filters.maxDistance)
    )
      return false
    if (filters.minCapacity && Number(a.capacity) < Number(filters.minCapacity))
      return false
    if (filters.minBedrooms && Number(a.bedrooms) < Number(filters.minBedrooms))
      return false
    if (filters.pool && a.pool !== true) return false
    if (filters.garage && a.garage !== true) return false
    if (filters.minRating && Number(a.myRating) < Number(filters.minRating))
      return false
    if (filters.status && st !== filters.status) return false
    // Disponibilidad: el alojamiento debe tener TODOS los días elegidos libres.
    if (
      filters.availFrom &&
      !rangesCoverAll(a.availableRanges, filters.availFrom, filters.availTo)
    )
      return false
    return true
  })
}

export function sortAccommodations(accommodations, sort) {
  const arr = [...accommodations]
  switch (sort) {
    case 'price-asc':
      return arr.sort((a, b) => Number(a.priceTotal) - Number(b.priceTotal))
    case 'price-desc':
      return arr.sort((a, b) => Number(b.priceTotal) - Number(a.priceTotal))
    case 'distance-asc':
      return arr.sort((a, b) => Number(a.distanceToBeach) - Number(b.distanceToBeach))
    case 'rating-desc':
      return arr.sort((a, b) => Number(b.myRating || -1) - Number(a.myRating || -1))
    case 'rating-asc':
      return arr.sort((a, b) => Number(a.myRating || 11) - Number(b.myRating || 11))
    default:
      return arr
  }
}
