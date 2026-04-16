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
    this.formTarget.classList.remove('w-0')
    this.formTarget.classList.add('w-72')
    this.buttonTarget.classList.add('text-white')
    this.buttonTarget.classList.remove('text-gray-400')
    this.inputTarget.focus()
  }

  close() {
    this.formTarget.classList.add('w-0')
    this.formTarget.classList.remove('w-72')
    this.buttonTarget.classList.remove('text-white')
    this.buttonTarget.classList.add('text-gray-400')
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
      msg.className = 'px-4 py-3 text-sm text-gray-500'
      msg.textContent = 'No results'
      this.dropdownTarget.appendChild(msg)
    } else {
      all.forEach(r => {
        const a = document.createElement('a')
        a.href = r.url  // validated server-side path (e.g. /teams/1)
        a.className = 'flex items-center gap-3 px-4 py-2.5 hover:bg-gray-700 transition-colors'

        if (r.logo) {
          const img = document.createElement('img')
          img.src = r.logo
          img.className = 'w-6 h-6 object-contain flex-shrink-0'
          img.alt = ''
          a.appendChild(img)
        } else {
          const icon = document.createElement('span')
          icon.className = 'w-6 h-6 flex items-center justify-center text-sm flex-shrink-0'
          icon.textContent = ICONS[r.type]
          a.appendChild(icon)
        }

        const name = document.createElement('span')
        name.className = 'text-sm text-gray-100 truncate'
        name.textContent = r.name  // safe — no innerHTML
        a.appendChild(name)

        const badge = document.createElement('span')
        badge.className = 'ml-auto text-xs text-gray-600 capitalize flex-shrink-0'
        badge.textContent = r.type
        a.appendChild(badge)

        this.dropdownTarget.appendChild(a)
      })
    }

    this.dropdownTarget.classList.remove('hidden')
  }

  #hideDropdown() {
    this.dropdownTarget.classList.add('hidden')
    this.dropdownTarget.innerHTML = ''
  }
}
