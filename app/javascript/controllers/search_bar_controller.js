import { Controller } from '@hotwired/stimulus'

const ICONS = {
  team:   '🛡️',
  player: '👤',
  league: '🏆',
}

export default class extends Controller {
  static targets = ['form', 'input', 'button', 'dropdown']

  #debounceTimer = null

  open() {
    this.formTarget.classList.add('is-open')
    this.buttonTarget.classList.add('is-active')
    this.inputTarget.focus()
  }

  close() {
    this.formTarget.classList.remove('is-open')
    this.buttonTarget.classList.remove('is-active')
    this.inputTarget.value = ''
    this.#hideDropdown()
    clearTimeout(this.#debounceTimer)
  }

  onInput() {
    clearTimeout(this.#debounceTimer)
    const q = this.inputTarget.value.trim()
    if (q.length < 2) { this.#hideDropdown(); return }
    this.#debounceTimer = setTimeout(() => this.#fetch(q), 300)
  }

  onKeydown(event) {
    if (event.key === 'Escape') this.close()
  }

  #fetch(q) {
    fetch(`/search.json?q=${encodeURIComponent(q)}`, {
      headers: { 'Accept': 'application/json' }
    })
      .then(r => r.json())
      .then(data => this.#render(data))
      .catch(() => {})
  }

  #render(data) {
    const all = [
      ...data.leagues.map(r => ({ ...r, type: 'league' })),
      ...data.teams.map(  r => ({ ...r, type: 'team'   })),
      ...data.players.map(r => ({ ...r, type: 'player' })),
    ]

    this.dropdownTarget.innerHTML = ''

    if (all.length === 0) {
      const msg = document.createElement('p')
      msg.className = 'search-dropdown-empty'
      msg.textContent = 'No results'
      this.dropdownTarget.appendChild(msg)
    } else {
      all.forEach(r => {
        const a = document.createElement('a')
        a.href = r.url  // validated server-side path (e.g. /teams/1)
        a.className = 'search-dropdown-item'

        if (r.logo) {
          const img = document.createElement('img')
          img.src = r.logo
          img.className = 'search-dropdown-logo'
          img.alt = ''
          a.appendChild(img)
        } else {
          const icon = document.createElement('span')
          icon.className = 'search-dropdown-icon'
          icon.textContent = ICONS[r.type]
          a.appendChild(icon)
        }

        const name = document.createElement('span')
        name.className = 'search-dropdown-name'
        name.textContent = r.name  // safe — no innerHTML
        a.appendChild(name)

        const badge = document.createElement('span')
        badge.className = 'search-dropdown-badge'
        badge.textContent = r.type
        a.appendChild(badge)

        this.dropdownTarget.appendChild(a)
      })
    }

    this.dropdownTarget.classList.add('is-open')
  }

  #hideDropdown() {
    this.dropdownTarget.classList.remove('is-open')
    this.dropdownTarget.innerHTML = ''
  }
}
