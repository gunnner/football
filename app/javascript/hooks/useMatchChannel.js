import { useEffect, useRef } from 'react'
import { createConsumer }    from '@rails/actioncable'

export function useMatchChannel(matchId, onReceived) {
  const cbRef = useRef(onReceived)
  useEffect(() => { cbRef.current = onReceived })

  useEffect(() => {
    if (!matchId) return
    const cable = createConsumer('/cable')
    const sub = cable.subscriptions.create(
      { channel: 'MatchChannel', match_id: matchId },
      { received(data) { cbRef.current(data) } }
    )
    return () => sub.unsubscribe()
  }, [matchId])
}
