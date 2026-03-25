import { Controller } from '@hotwired/stimulus'
import consumer from '../channels/consumer'

export default class extends Controller {
  static values = { id: Number }

  connect() {
    this.subscription = consumer.subscriptions.create(
      { channel: 'MatchChannel', match_id: this.idValue },
      {
        connected:    () => {},
        disconnected: () => {},
        received:     (data) => this.handleData(data)
      }
    )
  }

  disconnect() {
    this.subscription?.unsubscribe()
  }

  handleData(data) {
    switch (data.type) {
      case 'match_update':
        this.updateScore(data.match)
        break
      case 'goal':
        this.showGoal(data.match, data.event)
        break
      case 'match_start':
        this.showNotification('Match started!')
        break
      case 'match_end':
        this.showNotification('Match finished!')
        break
    }
  }

  updateScore(match) {
    const el = document.getElementById(`match_score_${match.id}`)

    if (!el) return
    el.innerHTML = `
      <p>Score: ${match.score_current || 'Not started'}</p>
      <p>Status: ${match.status}</p>
      <p>Clock: ${match.clock || ''}'</p>
    `
  }

  showGoal(match, event) {
    this.updateScore(match)
    this.showNotification(`GOAL! ${event.player_name} (${event.team_name}) ${event.time}'`)
  }

  showNotification(message) {
    const el = document.createElement('div')
    el.textContent = message
    el.style.cssText = 'position:fixed;top:20px;right:20px;background:#333;color:#fff;padding:10px;border-radius:4px;z-index:9999'
    document.body.appendChild(el)
    setTimeout(() => el.remove(), 5000)
  }
}
