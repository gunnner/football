import { useEffect, useRef } from 'react'
import { createConsumer }    from '@rails/actioncable'

// onReceived(matchId, data) called for each incoming message
export function useLiveMatchChannels(matchIds, onReceived) {
  const cbRef = useRef(onReceived)
  useEffect(() => { cbRef.current = onReceived })

  useEffect(() => {
    if (!matchIds?.length) return

    const cable = createConsumer('/cable')
    const subs  = matchIds.map(id =>
      cable.subscriptions.create(
        { channel: 'MatchChannel', match_id: id },
        { received(data) { cbRef.current(id, data) } }
      )
    )
    return () => subs.forEach(s => s.unsubscribe())
  }, [matchIds?.join(',')])
}
