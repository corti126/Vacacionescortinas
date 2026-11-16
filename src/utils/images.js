/* Respaldo automático de imágenes: si un enlace falla (enlace roto, red
   inestable), la imagen se reemplaza por una foto genérica antes que
   quedar un hueco vacío. Marcamos data-fallback para evitar bucles. */
export const PLACEHOLDER_IMG =
  'https://images.unsplash.com/photo-1502672260266-1c1ef3d93668?q=80&w=800&auto=format&fit=crop'

export function onImgError(e) {
  const img = e.currentTarget
  if (img.dataset.fallbackApplied) return
  img.dataset.fallbackApplied = '1'
  img.src = PLACEHOLDER_IMG
}
