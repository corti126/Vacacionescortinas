/* Pestañas para filtrar alojamientos por estado familiar compartido */
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ACCOMMODATION_STATUS } from '../services/firestore'
import { statusLabel } from '../utils/format'

const STATUS_TABS = [
  { value: ACCOMMODATION_STATUS.PENDING, label: 'Pendientes', icon: '⏳' },
  { value: ACCOMMODATION_STATUS.FAVORITE, label: 'Favoritas', icon: '❤️' },
  { value: ACCOMMODATION_STATUS.DISCARDED, label: 'Descartadas', icon: '❌' },
]

export default function StatusTabs({
  accommodations,
  statusesById,
  citiesById,
  onStatusChange,
}) {
  const [activeTab, setActiveTab] = useState(null)

  const countByStatus = (status) =>
    accommodations.filter(
      (a) => (statusesById[a.id]?.status || ACCOMMODATION_STATUS.PENDING) === status,
    ).length

  const filtered = activeTab
    ? accommodations.filter(
        (a) => (statusesById[a.id]?.status || ACCOMMODATION_STATUS.PENDING) === activeTab,
      )
    : accommodations

  return (
    <div className="status-tabs">
      <div className="status-tabs-list">
        <button
          type="button"
          className={`status-tab ${activeTab === null ? 'active' : ''}`}
          onClick={() => setActiveTab(null)}
        >
          <span>Todos</span>
          <span className="status-tab-count">{accommodations.length}</span>
        </button>
        {STATUS_TABS.map((s) => (
          <button
            key={s.value}
            type="button"
            className={`status-tab ${activeTab === s.value ? 'active' : ''}`}
            onClick={() => setActiveTab(s.value)}
          >
            <span className="status-tab-icon">{s.icon}</span>
            <span>{s.label}</span>
            <span className="status-tab-count">{countByStatus(s.value)}</span>
          </button>
        ))}
      </div>

      <div className="status-tabs-content">
        {filtered.length === 0 ? (
          <div className="status-tabs-empty">
            {activeTab === null
              ? 'No hay alojamientos cargados.'
              : `No hay alojamientos marcados como ${statusLabel(activeTab).toLowerCase()}.`}
          </div>
        ) : (
          <div className="accommodation-list-grid">
            {filtered.map((a) => {
              const city = citiesById[a.cityId]
              const status = statusesById[a.id]?.status || ACCOMMODATION_STATUS.PENDING
              return (
                <div key={a.id} className="status-tab-card">
                  <div className="status-tab-card-image">
                    <img
                      src={a.coverImage || 'https://images.unsplash.com/photo-1502672260266-1c1ef3d93668?q=80&w=800&auto=format&fit=crop'}
                      alt=""
                      loading="lazy"
                    />
                    <span className="status-tab-badge">{statusLabel(status)}</span>
                  </div>
                  <div className="status-tab-card-body">
                    <Link to={`/alojamientos/${a.id}`} className="status-tab-card-link">
                      <h3>{a.name}</h3>
                    </Link>
                    <div className="status-tab-card-location">
                      {city ? city.name : ''}
                      {a.neighborhood && ` · ${a.neighborhood}`}
                    </div>
                    <div className="status-tab-card-price">
                      <span className="status-tab-card-price-total">
                        {a.priceTotal != null ? a.priceTotal : '—'}
                      </span>
                    </div>
                    <div className="status-tab-card-actions">
                      <select
                        className="status-tab-status-select"
                        value={status}
                        onChange={(e) => onStatusChange && onStatusChange(a.id, e.target.value)}
                        aria-label="Estado familiar del alojamiento"
                      >
                        <option value="pending">⏳ Pendiente</option>
                        <option value="favorite">❤️ Favorita</option>
                        <option value="discarded">❌ Descartada</option>
                      </select>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
