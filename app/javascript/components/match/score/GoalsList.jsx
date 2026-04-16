import PlayerLink from '../../ui/PlayerLink'
import { GoalSVG, OwnGoalSVG } from '../../ui/Icons'

function GoalEntry({ event }) {
  const isOwnGoal = event.type === 'Own Goal'
  return (
    <div className="flex items-center gap-1 text-xs">
      <span className="flex-shrink-0">{isOwnGoal ? <OwnGoalSVG /> : <GoalSVG />}</span>
      <span className="text-gray-500 flex-shrink-0">{event.time}'</span>
      <span className="text-gray-300">
        <PlayerLink
          name={event.player_name?.split(' ').pop()}
          path={event.player_path}
          className="hover:text-blue-400 transition-colors"
        />
        {event.type === 'Penalty' && <span className="text-gray-500 ml-1">(pen)</span>}
        {event.assisting_player_name && (
          <span className="text-gray-500 ml-1">
            (assist by <PlayerLink
              name={event.assisting_player_name?.split(' ').pop()}
              path={event.assisting_player_path}
              className="hover:text-blue-400 transition-colors"
            />)
          </span>
        )}
      </span>
    </div>
  )
}

export default function GoalsList({ events }) {
  if (!events?.length) return null
  return (
    <div className="mt-2 flex justify-center">
      <div className="space-y-0.5 flex flex-col items-start">
        {events.map((e, i) => <GoalEntry key={i} event={e} />)}
      </div>
    </div>
  )
}
