import { createRoot } from 'react-dom/client'

import MatchShow       from '../components/match/MatchShow'
import MatchesPage     from '../components/match/MatchesPage'
import MatchScore      from '../components/match/MatchScore'
import MatchLineup     from '../components/match/MatchLineup'
import MatchStatistics from '../components/match/MatchStatistics'
import MatchEvents     from '../components/match/MatchEvents'
import MatchStandings  from '../components/match/MatchStandings'
import LeaguesPage     from '../components/league/LeaguesPage'
import LeagueShow      from '../components/league/LeagueShow'
import TeamShow        from '../components/team/TeamShow'
import PlayerShow      from '../components/player/PlayerShow'
import PlayerTransfers from '../components/player/PlayerTransfers'
import SearchPage      from '../components/search/SearchPage'
import AuthForm        from '../components/auth/AuthForm'

const REGISTRY = {
  MatchShow,
  MatchesPage,
  MatchScore,
  MatchLineup,
  MatchStatistics,
  MatchEvents,
  MatchStandings,
  LeaguesPage,
  LeagueShow,
  TeamShow,
  PlayerShow,
  PlayerTransfers,
  SearchPage,
  AuthForm,
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-react-component]').forEach(el => {
    const Component = REGISTRY[el.dataset.reactComponent]
    if (!Component) {
      console.error(`Unknown React component: "${el.dataset.reactComponent}"`)
      return
    }
    const props = JSON.parse(el.dataset.props || '{}')
    createRoot(el).render(<Component {...props} />)
  })
})
