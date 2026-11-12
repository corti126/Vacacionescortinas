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

export function ratingInterpretation(rating) {
  const n = Number(rating)
  if (!Number.isFinite(n)) return ''
  if (n <= 3) return 'Poco interesante'
  if (n <= 5) return 'Regular'
  if (n <= 7) return 'Buena opción'
  if (n <= 9) return 'Muy buena opción'
  return 'Excelente opción'
}
