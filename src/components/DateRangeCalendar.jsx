/* Calendario inline para elegir un rango de fechas (llegada y salida).
   Sin dependencias: renderiza dos meses y permite clickear los días.
   El primer clic marca la llegada; el segundo, la salida (si se clickea
   una fecha anterior, vuelve a empezar). */
import { useState } from 'react'
import { parseISO, toISO, isValidISO, formatShort } from '../utils/dates'

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]
// Semana empezando en lunes (formato habitual en español).
const WEEKDAYS = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do']

function MonthGrid({ year, month, from, to, onPick }) {
  const firstDay = new Date(year, month, 1)
  const offset = (firstDay.getDay() + 6) % 7
  const totalDays = new Date(year, month + 1, 0).getDate()
  const todayISO = toISO(new Date())

  const cells = []
  for (let i = 0; i < offset; i++) cells.push(null)
  for (let d = 1; d <= totalDays; d++) cells.push(toISO(new Date(year, month, d)))

  return (
    <div className="cal-month">
      <div className="cal-month-title">
        {MONTH_NAMES[month]} <span className="cal-month-year">{year}</span>
      </div>
      <div className="cal-weekdays">
        {WEEKDAYS.map((w) => (
          <span key={w}>{w}</span>
        ))}
      </div>
      <div className="cal-days">
        {cells.map((iso, i) => {
          if (!iso) return <span key={`e${i}`} className="cal-day cal-day--empty" />
          const isStart = iso === from
          const isEnd = iso === to
          const inRange =
            isValidISO(from) && isValidISO(to) && iso > from && iso < to
          const cls = ['cal-day']
          if (isStart) cls.push('cal-day--edge', 'cal-day--start')
          if (isEnd) cls.push('cal-day--edge', 'cal-day--end')
          if (inRange) cls.push('cal-day--range')
          if (iso === todayISO) cls.push('cal-day--today')
          return (
            <button
              key={iso}
              type="button"
              className={cls.join(' ')}
              onClick={() => onPick(iso)}
              aria-label={iso}
              aria-pressed={isStart || isEnd}
            >
              {Number(iso.slice(8, 10))}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default function DateRangeCalendar({ from = '', to = '', onChange }) {
  const [cursor, setCursor] = useState(() => {
    const base = isValidISO(from) ? parseISO(from) : new Date()
    return { y: base.getFullYear(), m: base.getMonth() }
  })

  const shift = (delta) =>
    setCursor(({ y, m }) => {
      const d = new Date(y, m + delta, 1)
      return { y: d.getFullYear(), m: d.getMonth() }
    })

  const pick = (iso) => {
    if (!from || (from && to)) onChange({ from: iso, to: '' })
    else if (iso < from) onChange({ from: iso, to: '' })
    else onChange({ from, to: iso })
  }

  const second = new Date(cursor.y, cursor.m + 1, 1)

  let hint = 'Elegí la llegada y la salida'
  if (from && to) hint = `${formatShort(from)} → ${formatShort(to)}`
  else if (from) hint = `${formatShort(from)} → ¿hasta cuándo?`

  return (
    <div className="cal">
      <div className="cal-toolbar">
        <button
          type="button"
          className="cal-nav"
          onClick={() => shift(-1)}
          aria-label="Mes anterior"
        >
          ‹
        </button>
        <span className="cal-hint">{hint}</span>
        <button
          type="button"
          className="cal-nav"
          onClick={() => shift(1)}
          aria-label="Mes siguiente"
        >
          ›
        </button>
      </div>
      <div className="cal-months">
        <MonthGrid year={cursor.y} month={cursor.m} from={from} to={to} onPick={pick} />
        <MonthGrid
          year={second.getFullYear()}
          month={second.getMonth()}
          from={from}
          to={to}
          onPick={pick}
        />
      </div>
      <p className="cal-note">
        Primer clic: llegada · Segundo clic: salida. Los alojamientos que no
        tengan todos esos días libres no se muestran.
      </p>
    </div>
  )
}
