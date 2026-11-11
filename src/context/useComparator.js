import { useContext } from 'react'
import { ComparatorContext } from './ComparatorContext.js'

export function useComparator() {
  const context = useContext(ComparatorContext)
  if (!context) {
    throw new Error('useComparator debe usarse dentro de ComparatorProvider')
  }
  return context
}
