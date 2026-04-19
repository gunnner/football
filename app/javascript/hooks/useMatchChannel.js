import { useEffect, useRef } from 'react'
import { createConsumer }    from '@rails/actioncable'

// Single shared consumer for the whole app
let _consumer = null
function getConsumer() {
  if (!_consumer) _consumer = createConsumer('/cable')
  return _consumer
}

// Per match-id: shared subscription + set of listeners
const _subs = {}

function getMatchSub(matchId) {
  if (_subs[matchId]) return _subs[matchId]
  const listeners = new Set()
  const sub = getConsumer().subscriptions.create(
    { channel: 'MatchChannel', match_id: matchId },
    { received(data) { listeners.forEach(fn => fn(data)) } }
  )
  _subs[matchId] = { sub, listeners }
  return _subs[matchId]
}

export function useMatchChannel(matchId, onReceived) {
  const cbRef = useRef(onReceived)
  useEffect(() => { cbRef.current = onReceived })

  useEffect(() => {
    if (!matchId) return
    const handler = (data) => cbRef.current(data)
    const { listeners } = getMatchSub(matchId)
    listeners.add(handler)
    return () => listeners.delete(handler)
  }, [matchId])
}
