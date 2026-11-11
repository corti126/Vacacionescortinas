/* Insignia del estado familiar compartido de un alojamiento */
const STATUS_CONFIG = {
  pending: { label: 'Pendiente', color: '#6b7280', dot: '#9ca3af', icon: '⏳' },
  favorite: { label: 'Favorita', color: '#2e7d32', dot: '#2e7d32', icon: '❤️' },
  discarded: { label: 'Descartada', color: '#c62828', dot: '#c62828', icon: '❌' },
}

export default function StatusBadge({ status = 'pending', size = 'md' }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending
  const sizes = {
    sm: { fontSize: 12, padding: '2px 8px', gap: 4 },
    md: { fontSize: 13, padding: '4px 10px', gap: 6 },
    lg: { fontSize: 15, padding: '6px 12px', gap: 8 },
  }
  const s = sizes[size]

  return (
    <span
      className="status-badge"
      style={{
        fontSize: s.fontSize,
        padding: s.padding,
        gap: s.gap,
        background: `rgba(${cfg.color === '#2e7d32' ? '46,125,50' : cfg.color === '#c62828' ? '198,40,40' : '107,114,128'},0.10)`,
        color: cfg.color,
        border: `1px solid ${cfg.color}`,
      }}
      title={`Estado familiar: ${cfg.label}`}
    >
      <span style={{ fontSize: s.fontSize, lineHeight: 1 }}>{cfg.icon}</span>
      <span style={{ fontWeight: 600 }}>{cfg.label}</span>
    </span>
  )
}
