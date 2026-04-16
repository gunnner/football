import { useState }        from 'react'
import { useMatchChannel } from '../../hooks/useMatchChannel'
import { parseMinute, getHalf } from '../../utils/eventTime'
import EventTimeline       from './events/EventTimeline'
import EventRow            from './events/EventRow'

function SectionDivider({ title, isLive }) {
  return (
    <div className="flex items-center gap-2 -mx-4 px-4 py-1.5 bg-gray-800/60 border-y border-gray-800/80">
      <span className="text-xs text-gray-400 font-semibold">{title}</span>
      {isLive && (
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse inline-block" />
          <span className="text-[10px] text-red-400 font-semibold">LIVE</span>
        </span>
      )}
    </div>
  )
}

const sortEvents = evts => [...evts].sort((a, b) => parseMinute(a.time) - parseMinute(b.time))

export default function MatchEvents({
  matchId, homeTeamExternalId, homeTeam, awayTeam,
  isLive, matchStatus, initialEvents,
}) {
  const [events, setEvents]         = useState(() => sortEvents(initialEvents || []))
  const [newEventId, setNewEventId] = useState(null)

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
      setEvents(prev => sortEvents([...prev, newEvent]))
      setNewEventId(newEvent.id)
      setTimeout(() => setNewEventId(null), 3000)
    }
  })

  if (events.length === 0) {
    return (
      <div className="bg-gray-900 rounded-xl p-4">
        <p className="text-center text-gray-500 py-8">No events yet</p>
      </div>
    )
  }

  const firstHalfEvents  = events.filter(e => getHalf(e.time) === 1)
  const secondHalfEvents = events.filter(e => getHalf(e.time) === 2)
  const firstHalfLive    = isLive && ['First half', 'Half time'].includes(matchStatus)
  const secondHalfLive   = isLive && !firstHalfLive

  return (
    <div className="space-y-3">
      <div className="bg-gray-900 rounded-xl px-4 pt-3 pb-4">
        <EventTimeline
          events={events}
          homeTeamExternalId={homeTeamExternalId}
          homeTeam={homeTeam}
          awayTeam={awayTeam}
          isLive={isLive}
          matchStatus={matchStatus}
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
          {firstHalfEvents.length > 0 && (
            <>
              <SectionDivider title="First Half" isLive={firstHalfLive} />
              {firstHalfEvents.map(event => (
                <EventRow
                  key={event.id || `${event.time}-${event.player_name}`}
                  event={event}
                  isHome={event.team_external_id === homeTeamExternalId}
                  isNew={event.id === newEventId}
                />
              ))}
            </>
          )}
          {secondHalfEvents.length > 0 && (
            <>
              <SectionDivider title="Second Half" isLive={secondHalfLive} />
              {secondHalfEvents.map(event => (
                <EventRow
                  key={event.id || `${event.time}-${event.player_name}`}
                  event={event}
                  isHome={event.team_external_id === homeTeamExternalId}
                  isNew={event.id === newEventId}
                />
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
