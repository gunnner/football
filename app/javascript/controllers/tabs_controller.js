import { Controller } from '@hotwired/stimulus'

export default class extends Controller {
  static targets = ['tab', 'panel']

  connect() {
    this.showTab(0)
  }

  switch(event) {
    const index = this.tabTargets.indexOf(event.currentTarget)
    this.showTab(index)
  }

  showTab(index) {
    this.tabTargets.forEach((tab, i) => {
      if (i === index) {
        tab.classList.add('bg-gray-700', 'text-white')
        tab.classList.remove('text-gray-400')
      } else {
        tab.classList.remove('bg-gray-700', 'text-white')
        tab.classList.add('text-gray-400')
      }
    })

    this.panelTargets.forEach((panel, i) => {
      panel.classList.toggle('hidden', i !== index)
    })
  }
}
