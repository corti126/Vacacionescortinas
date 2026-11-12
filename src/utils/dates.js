/* Utilidades de fechas para la disponibilidad de alojamientos.
   Formato de almacenamiento: 'YYYY-MM-DD' (compara bien como string). */

export function isValidISO(value) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)
}

export function parseISO(value) {
  const [y, m, d] = value.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function toISO(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function formatShort(value) {
  if (!isValidISO(value)) return ''
  const date = parseISO(value)
  const dd = String(date.getDate()).padStart(2, '0')
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  return `${dd}/${mm}/${date.getFullYear()}`
}

export function formatRange(range) {
  if (!range || !isValidISO(range.start)) return ''
  if (!range.end || range.end === range.start) return formatShort(range.start)
  return `${formatShort(range.start)} → ${formatShort(range.end)}`
}

/** Todos los días (inclusive) entre dos fechas ISO. */
export function eachDay(from, to) {
  const days = []
  const end = parseISO(to)
  for (const d = parseISO(from); d <= end; d.setDate(d.getDate() + 1)) {
    days.push(toISO(d))
  }
  return days
}

/**
 * ¿Los rangos disponibles cubren TODOS los días de [from..to]?
 * - Sin filtro de fechas (from inválido) → true (sin restricción).
 * - Sin rangos cargados en el alojamiento → false cuando hay filtro:
 *   no se puede afirmar que tenga esos días libres.
 */
export function rangesCoverAll(ranges, from, to) {
  if (!isValidISO(from)) return true
  const list = (ranges || []).filter(
    (r) => isValidISO(r?.start) && isValidISO(r?.end || r?.start),
  )
  if (list.length === 0) return false
  const end = isValidISO(to) && to >= from ? to : from
  return eachDay(from, end).every((day) =>
    list.some((r) => day >= r.start && day <= (r.end || r.start)),
  )
}
