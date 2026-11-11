import { useEffect, useState, useCallback } from 'react'
import { ThemeContext } from './ThemeContext.js'
import { getStoredTheme, applyTheme, VALID_THEMES } from './themeUtils'

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getStoredTheme)

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  useEffect(() => {
    if (theme !== 'auto') return
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => applyTheme('auto')
    media.addEventListener('change', handler)
    return () => media.removeEventListener('change', handler)
  }, [theme])

  const setThemeAndPersist = useCallback((next) => {
    if (!VALID_THEMES.includes(next)) return
    localStorage.setItem('brasil-trip-theme', next)
    setTheme(next)
  }, [])

  const resolvedTheme =
    theme === 'auto' && typeof window !== 'undefined'
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
      : theme

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme: setThemeAndPersist }}>
      {children}
    </ThemeContext.Provider>
  )
}
