import { useState, useCallback } from 'react'
import { ComparatorContext, MAX_COMPARED } from './ComparatorContext.js'

export function ComparatorProvider({ children }) {
  const [selected, setSelected] = useState([])

  const isSelected = useCallback((id) => selected.includes(id), [selected])

  const toggle = useCallback((id) => {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id)
      if (prev.length >= MAX_COMPARED) return prev
      return [...prev, id]
    })
  }, [])

  const remove = useCallback((id) => {
    setSelected((prev) => prev.filter((x) => x !== id))
  }, [])

  const clear = useCallback(() => setSelected([]), [])

  const canAdd = useCallback(
    (id) => isSelected(id) || selected.length < MAX_COMPARED,
    [isSelected, selected.length],
  )

  return (
    <ComparatorContext.Provider
      value={{ selected, toggle, remove, clear, isSelected, canAdd, max: MAX_COMPARED }}
    >
      {children}
    </ComparatorContext.Provider>
  )
}
