/* Utilidades de validación de formularios */

export const required = (value) => {
  if (value === null || value === undefined) return 'Este campo es obligatorio.'
  if (typeof value === 'string' && value.trim() === '') return 'Este campo es obligatorio.'
  if (Array.isArray(value) && value.length === 0) return 'Este campo es obligatorio.'
  return null
}

export const minLength = (min) => (value) => {
  if (value == null || value === '') return null
  if (value.length < min) return `Mínimo ${min} caracteres.`
  return null
}

export const maxLength = (max) => (value) => {
  if (value == null || value === '') return null
  if (value.length > max) return `Máximo ${max} caracteres.`
  return null
}

export const minValue = (min) => (value) => {
  if (value == null || value === '') return null
  const n = Number(value)
  if (!Number.isFinite(n)) return 'Ingresá un número válido.'
  if (n < min) return `Debe ser al menos ${min}.`
  return null
}

export const maxValue = (max) => (value) => {
  if (value == null || value === '') return null
  const n = Number(value)
  if (!Number.isFinite(n)) return 'Ingresá un número válido.'
  if (n > max) return `Debe ser máximo ${max}.`
  return null
}

export const url = (value) => {
  if (value == null || value === '') return null
  try {
    new URL(value)
    return null
  } catch {
    return 'URL inválida.'
  }
}

export const positiveInteger = (value) => {
  if (value == null || value === '') return null
  const n = Number(value)
  if (!Number.isInteger(n) || n <= 0) return 'Ingresá un número entero positivo.'
  return null
}

/* Ejecuta un conjunto de validadores sobre un valor y devuelve el primer error */
export const runValidators = (value, validators) => {
  for (const v of validators) {
    const error = v(value)
    if (error) return error
  }
  return null
}

/* Valida todos los campos de un formulario según un esquema { campo: [validadores] }
   Devuelve { valido: true } o { valido: false, errores: { campo: mensaje } } */
export const validateForm = (values, schema) => {
  const errores = {}
  let valido = true
  for (const campo of Object.keys(schema)) {
    const error = runValidators(values[campo], schema[campo])
    if (error) {
      valido = false
      errores[campo] = error
    }
  }
  return valido ? { valido: true } : { valido: false, errores }
}
