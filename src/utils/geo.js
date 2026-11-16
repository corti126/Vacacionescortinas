/* Cálculos geográficos locales (sin APIs externas ni servicios pagos).
   La app aterriza en el Aeropuerto de Recife: se muestra distancia lineal
   (Haversine) hacia cada ciudad y un tiempo estimado de auto la heurística:
   factor de ruta 1.25 y velocidad media de ~80 km/h por ruta terrestre. */
export const RECIFE_AIRPORT = {
  name: 'Aeropuerto Internacional de Recife / Guararapes (REC)',
  lat: -8.1265,
  lng: -34.9203,
}

const R = 6371
const deg2rad = (d) => (d * Math.PI) / 180

/** Distancia Haversine en km entre dos puntos (lat/lng en grados). */
export function haversineKm(lat1, lng1, lat2, lng2) {
  const dLat = deg2rad(lat2 - lat1)
  const dLng = deg2rad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(a))
}

/** ¿La ciudad es Recife? (por nombre). */
export function isRecife(city) {
  return !!city && /recife/i.test(city.name || '')
}

/** Distancia en línea recta desde el aeropuerto de Recife a la ciudad, en km. null si no hay coords. */
export function distanceToRecifeKm(city) {
  if (!city || city.lat == null || city.lng == null) return null
  return haversineKm(RECIFE_AIRPORT.lat, RECIFE_AIRPORT.lng, Number(city.lat), Number(city.lng))
}

/** Minutos estimados en auto (factor ruta 1.25 · ~80 km/h). null si no hay distancia. */
export function driveTimeMinutes(km) {
  if (km == null || !Number.isFinite(km)) return null
  return Math.round(((km * 1.25) / 80) * 60)
}

/** Formato de distancia: 51.7 km o 245 km. */
export function formatDistance(km) {
  if (km == null || !Number.isFinite(km)) return '—'
  return `${km < 100 ? (Math.round(km * 10) / 10).toFixed(1) : Math.round(km)} km`
}

/** Formato de duración en auto: "45 min", "1 h 15 min", "3 h 5 min". */
export function formatDriveTime(minutes) {
  if (minutes == null || !Number.isFinite(minutes)) return '—'
  const h = Math.floor(minutes / 60)
  const m = Math.round(minutes % 60)
  if (h === 0) return `${m} min`
  return m > 0 ? `${h} h ${m} min` : `${h} h`
}

/** Badge multiuso: { kmText, timeText } para "245 km · ~3 h 5 min de Recife" */
export function recifeInfo(city) {
  const km = distanceToRecifeKm(city)
  if (km == null) return null
  return {
    km,
    kmText: formatDistance(km),
    timeText: formatDriveTime(driveTimeMinutes(km)),
  }
}
