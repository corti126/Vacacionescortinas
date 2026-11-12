import AccommodationCard from './AccommodationCard'

export default function AccommodationList({
  accommodations = [],
  statusesById = {},
  onStatusChange,
  citiesById = {},
}) {
  if (accommodations.length === 0) return null

  return (
    <div className="accommodation-list-grid">
      {accommodations.map((a) => {
        const status = statusesById[a.id]?.status || 'pending'
        const city = citiesById[a.cityId]
        return (
          <AccommodationCard
            key={a.id}
            accommodation={{ ...a, cityName: city ? city.name : '' }}
            status={status}
            onStatusChange={(nextStatus) => onStatusChange && onStatusChange(a.id, nextStatus)}
          />
        )
      })}
    </div>
  )
}
