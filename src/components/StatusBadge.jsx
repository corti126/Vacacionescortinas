/* Insignia del estado familiar compartido de un alojamiento.
   Los colores viven en index.css (--status-*) para que sigan el tema. */
const STATUS_CONFIG = {
  pending: { label: 'Pendiente', icon: '⏳' },
  favorite: { label: 'Favorita', icon: '❤️' },
  discarded: { label: 'Descartada', icon: '❌' },
}

const SIZES = {
  sm: { fontSize: 12, padding: '2px 8px', gap: 4 },
  md: { fontSize: 13, padding: '4px 10px', gap: 6 },
  lg: { fontSize: 15, padding: '6px 12px', gap: 8 },
}

export default function StatusBadge({ status = 'pending', size = 'md' }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending
  const s = SIZES[size] || SIZES.md

  return (
    <span
      className={`status-badge status-badge--${status}`}
      style={{ fontSize: s.fontSize, padding: s.padding, gap: s.gap }}
      title={`Estado familiar: ${cfg.label}`}
    >
      <span className="status-badge-icon">{cfg.icon}</span>
      <span>{cfg.label}</span>
    </span>
  )
}
