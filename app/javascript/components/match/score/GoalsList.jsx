import PlayerLink from '../../ui/PlayerLink'
import { GoalSVG, OwnGoalSVG } from '../../ui/Icons'
import styles from './GoalsList.module.css'

function GoalEntry({ event }) {
  const isOwnGoal = event.type === 'Own Goal'
  return (
    <div className={styles.entry}>
      <span className={styles.icon}>{isOwnGoal ? <OwnGoalSVG /> : <GoalSVG />}</span>
      <span className={styles.time}>{event.time}'</span>
      <span className={styles.detail}>
        <PlayerLink
          name={event.player_name?.split(' ').pop()}
          path={event.player_path}
          className={styles.playerLink}
        />
        {event.type === 'Penalty' && <span className={styles.pen}>(pen)</span>}
        {event.assisting_player_name && (
          <span className={styles.assist}>
            (assist by <PlayerLink
              name={event.assisting_player_name?.split(' ').pop()}
              path={event.assisting_player_path}
              className={styles.playerLink}
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
    <div className={styles.wrap}>
      <div className={styles.list}>
        {events.map((e, i) => <GoalEntry key={i} event={e} />)}
      </div>
    </div>
  )
}
