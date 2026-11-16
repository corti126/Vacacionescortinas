/* Esqueleto de carga para listados: tarjetas shimmer en lugar de texto
   "Cargando…" sin forma. */
export default function ListSkeleton({ cards = 6 }) {
  return (
    <div className="list-skeleton" role="status" aria-label="Cargando contenido">
      {Array.from({ length: cards }, (_, i) => (
        <div key={i} className="list-skeleton-card">
          <div className="list-skeleton-image" />
          <div className="list-skeleton-body">
            <div className="list-skeleton-line list-skeleton-line--lg" />
            <div className="list-skeleton-line list-skeleton-line--sm" />
            <div className="list-skeleton-line list-skeleton-line--md" />
          </div>
        </div>
      ))}
      <span className="route-loading-sronly">Cargando…</span>
    </div>
  )
}
