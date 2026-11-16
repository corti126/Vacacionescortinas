/* Utilidades de formateo */

export function formatPrice(value) {
  const n = Number(value)
  if (!Number.isFinite(n)) return '-'
  // Siempre con el símbolo $ (USD) explícito, sin depender del locale.
  return '$' + n.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
}

export function pricePerPerson(total, guests) {
  const t = Number(total)
  const g = Number(guests)
  if (!Number.isFinite(t) || !Number.isFinite(g) || g <= 0) return null
  return t / g
}

export function statusLabel(status) {
  const labels = {
    pending: 'Pendiente',
    favorite: 'Favorita',
    discarded: 'Descartada',
  }
  return labels[status] || 'Pendiente'
}

// Formatea timestamps de Firestore / Date / strings a "12 de Noviembre de 2026"
export function formatDate(value, style = 'long') {
  if (!value) return null
  let date = null
  // Timestamp de Firestore (tiene método toDate())
  if (typeof value.toDate === 'function') {
    date = value.toDate()
  } else if (value instanceof Date) {
    date = value
  } else {
    const d = new Date(value)
    if (!Number.isNaN(d.getTime())) date = d
  }
  if (!date) return null
  return new Intl.DateTimeFormat('es-AR', {
    day: 'numeric',
    month: style === 'short' ? 'short' : 'long',
    year: 'numeric',
  }).format(date)
}

export function ratingInterpretation(rating) {
  const n = Number(rating)
  if (!Number.isFinite(n)) return ''
  if (n <= 3) return 'Poco interesante'
  if (n <= 5) return 'Regular'
  if (n <= 7) return 'Buena opción'
  if (n <= 9) return 'Muy buena opción'
  return 'Excelente opción'
}
