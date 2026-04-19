import { useState }                  from 'react'
import { useMatchChannel }           from '../../hooks/useMatchChannel'
import { parseMinute, getHalf }      from '../../utils/eventTime'
import EventTimeline                 from './events/EventTimeline'
import EventRow                      from './events/EventRow'
import { SystemRow, SectionDivider } from './events/EventDividers'

const SYSTEM_STATUSES = new Set(['Half time', 'Break time', 'Full time', 'Finished', 'Finished AET', 'Finished AP'])

const sortEvents = evts => [...evts].sort((a, b) => parseMinute(a.time) - parseMinute(b.time))

export default function MatchEvents({
  matchId, homeTeamExternalId, homeTeam, awayTeam,
  isLive, matchStatus, initialEvents, clock,
}) {
  const [events, setEvents]         = useState(() => sortEvents(initialEvents || []))
  const [newEventId, setNewEventId] = useState(null)
  const [liveStatus, setLiveStatus] = useState(matchStatus)
  const [liveClock,  setLiveClock]  = useState(clock)

  useMatchChannel(matchId, (data) => {
    if ((data.type === 'match_event' || data.type === 'goal') && data.event) {
      const newEvent = {
        id:                    Date.now(),
        time:                  data.event.time,
        event_type:            data.event.event_type,
        player_name:           data.event.player_name,
        player_path:           null,
        team_name:             data.event.team_name,
        team_external_id:      data.event.team_external_id,
        assisting_player_name: data.event.assisting_player_name,
        assisting_player_path: null,
        substituted_player:    data.event.substituted_player,
      }
      setEvents(prev => {
        const isDup = prev.some(e =>
          e.time === newEvent.time &&
          e.event_type === newEvent.event_type &&
          e.player_name === newEvent.player_name
        )
        return isDup ? prev : sortEvents([...prev, newEvent])
      })
      setNewEventId(newEvent.id)
      setTimeout(() => setNewEventId(null), 3000)
    }
    if (data.match?.status) setLiveStatus(data.match.status)
    if (data.match?.clock)  setLiveClock(data.match.clock)
  })

  const rawStatus    = liveStatus || matchStatus
  const clockStr     = String(liveClock || clock || '')
  const clockMin     = parseInt(clockStr) || 0
  const isOvertime   = clockStr.includes('+')
  const currentStatus = (!isOvertime && rawStatus === 'First half' && clockMin >= 45) ? 'Half time'
                      : rawStatus

  const firstHalfEvents  = events.filter(e => getHalf(e.time) === 1)
  const secondHalfEvents = events.filter(e => getHalf(e.time) === 2)
  const hasFirstHalf     = firstHalfEvents.length > 0
  const hasSecondHalf    = secondHalfEvents.length > 0

  const firstHalfLive    = isLive && currentStatus === 'First half'
  const secondHalfLive   = isLive && ['Second half', 'Extra time'].includes(currentStatus)
  const isHalfTime       = ['Half time', 'Break time'].includes(currentStatus)
  const isFinished       = SYSTEM_STATUSES.has(currentStatus) && !isHalfTime

  const matchStarted = events.length > 0 || isLive || SYSTEM_STATUSES.has(currentStatus)

  if (events.length === 0 && !matchStarted) {
    return (
      <div className="bg-gray-900 rounded-xl p-4">
        <p className="text-center text-gray-500 py-8">No events yet</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="bg-gray-900 rounded-xl px-4 pt-3 pb-4">
        <EventTimeline
          events={events}
          homeTeamExternalId={homeTeamExternalId}
          homeTeam={homeTeam}
          awayTeam={awayTeam}
          isLive={isLive}
          matchStatus={currentStatus}
          clock={liveClock || clock}
        />
      </div>

      <div className="bg-gray-900 rounded-xl overflow-hidden">
        <div className="grid grid-cols-3 px-4 py-2 border-b border-gray-800 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          <a href={homeTeam?.path} className="flex items-center gap-1.5 hover:text-gray-300 transition-colors">
            {homeTeam?.logo && <img src={homeTeam.logo} className="w-4 h-4 object-contain" alt="" />}
            <span>{homeTeam?.name ?? 'Home'}</span>
          </a>
          <span className="text-center">Time</span>
          <a href={awayTeam?.path} className="flex items-center gap-1.5 justify-end hover:text-gray-300 transition-colors">
            <span>{awayTeam?.name ?? 'Away'}</span>
            {awayTeam?.logo && <img src={awayTeam.logo} className="w-4 h-4 object-contain" alt="" />}
          </a>
        </div>

        <div className="px-4">
          {isLive ? (
            <>
              {(secondHalfLive || hasSecondHalf) && (
                <>
                  <SectionDivider title="Second Half" isLive={secondHalfLive} />
                  {[...secondHalfEvents].reverse().map(event => (
                    <EventRow
                      key={event.id || `${event.time}-${event.player_name}`}
                      event={event}
                      isHome={event.team_external_id === homeTeamExternalId}
                      isNew={event.id === newEventId}
                    />
                  ))}
                </>
              )}

              {(isHalfTime || hasSecondHalf || secondHalfLive) && <SystemRow label="Half Time" />}

              {(firstHalfLive || hasFirstHalf) && (
                <>
                  <SectionDivider title="First Half" isLive={firstHalfLive} />
                  {[...firstHalfEvents].reverse().map(event => (
                    <EventRow
                      key={event.id || `${event.time}-${event.player_name}`}
                      event={event}
                      isHome={event.team_external_id === homeTeamExternalId}
                      isNew={event.id === newEventId}
                    />
                  ))}
                </>
              )}

              {matchStarted && <SystemRow label="Kick Off" />}
            </>
          ) : (
            <>
              {matchStarted && <SystemRow label="Kick Off" />}

              {hasFirstHalf && (
                <>
                  <SectionDivider title="First Half" isLive={false} />
                  {firstHalfEvents.map(event => (
                    <EventRow
                      key={event.id || `${event.time}-${event.player_name}`}
                      event={event}
                      isHome={event.team_external_id === homeTeamExternalId}
                      isNew={false}
                    />
                  ))}
                </>
              )}

              {(hasSecondHalf || isHalfTime) && <SystemRow label="Half Time" />}

              {hasSecondHalf && (
                <>
                  <SectionDivider title="Second Half" isLive={false} />
                  {secondHalfEvents.map(event => (
                    <EventRow
                      key={event.id || `${event.time}-${event.player_name}`}
                      event={event}
                      isHome={event.team_external_id === homeTeamExternalId}
                      isNew={false}
                    />
                  ))}
                </>
              )}

              {isFinished && <SystemRow label="Full Time" />}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
