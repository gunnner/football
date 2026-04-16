import Tooltip from '../../ui/Tooltip'
import { FORECAST_ICONS, FORECAST_LABELS } from '../../../constants/weather'

export default function MatchMeta({ venueName, venueCity, venueCapacity, refereeName, refereeNationality, refereeCountryLogo, forecastStatus, forecastTemperature }) {
  const forecastIcon  = FORECAST_ICONS[forecastStatus] ?? '🌡️'
  const forecastLabel = FORECAST_LABELS[forecastStatus]
    ?? (forecastStatus ? forecastStatus.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : null)
  const temp = forecastTemperature ? forecastTemperature.replace('°C', '') + '°C' : null

  return (
    <div className="flex items-center justify-center gap-4 flex-wrap">
      {venueName && (
        <Tooltip text={venueCapacity ? `Capacity: ${Number(venueCapacity).toLocaleString()}` : null}>
          <span className="flex items-center gap-1 text-xs text-gray-500 cursor-default">
            <span>📍</span>
            <span>{venueName}{venueCity ? `, ${venueCity}` : ''}</span>
          </span>
        </Tooltip>
      )}
      {refereeName && (
        <Tooltip text={refereeNationality} logo={refereeCountryLogo}>
          <span className="flex items-center gap-1 text-xs text-gray-500 cursor-default">
            <span>👤</span>
            <span>{refereeName}</span>
          </span>
        </Tooltip>
      )}
      {temp && (
        <Tooltip text={forecastLabel}>
          <span className="flex items-center gap-1 text-xs text-gray-500 cursor-default">
            <span>{forecastIcon}</span>
            <span>{temp}</span>
          </span>
        </Tooltip>
      )}
    </div>
  )
}
