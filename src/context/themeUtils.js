export const THEME_STORAGE_KEY = 'brasil-trip-theme'
export const VALID_THEMES = ['light', 'dark', 'auto']

export const THEME_LABELS = {
  light: 'Claro',
  dark: 'Oscuro',
  auto: 'Automático',
}

export function getStoredTheme() {
  if (typeof window === 'undefined') return 'auto'
  const stored = localStorage.getItem(THEME_STORAGE_KEY)
  if (stored && VALID_THEMES.includes(stored)) return stored
  return 'auto'
}

export function getSystemTheme() {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function resolveTheme(theme) {
  return theme === 'auto' ? getSystemTheme() : theme
}

export function applyTheme(theme) {
  const resolved = resolveTheme(theme)
  document.documentElement.setAttribute('data-theme', resolved)
  document.documentElement.classList.toggle('dark', resolved === 'dark')
}
