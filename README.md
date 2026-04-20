# Football App

A football application built with Ruby on Rails and React.

## Tech Stack

- Ruby 4.0.2 / Rails 8.1.3
- PostgreSQL, Redis, Sidekiq 8.x
- Elasticsearch 8.13
- React (primary frontend) + Hotwire (server-rendered pages)
- ActionCable (WebSocket)
- Vite (`vite_rails`), Propshaft, Docker, Nginx
- Devise (session auth) + JWT (API auth)

## Data Source

Powered by [Highlightly Football API](https://highlightly.net/documentation/football/)
Plan: 7500 requests/day — threshold set to 7000 (safety buffer). Active league: Premier League (expandable via `ACTIVE_LEAGUE_IDS` env).

## Requirements

- Docker + Docker Compose
- Ruby 4.0.2 (via RVM)

## Getting Started

### 1. Clone the repository
```bash
git clone git@github.com:your-username/football.git
cd football
```

### 2. Set up environment variables
```bash
cp .env.example .env
# Edit .env — fill in DB_USERNAME, DB_PASSWORD, API_FOOTBALL_KEY, ACTIVE_LEAGUE_IDS
```

### 3. Start Docker
```bash
docker compose up
```

### 4. Create and migrate the database
```bash
docker compose exec app bundle exec rails db:create db:migrate
```

### 5. Create Elasticsearch indexes
```bash
docker compose exec app bundle exec rails elasticsearch:reindex
```

### 6. Seed initial data from API
```bash
docker compose exec app bundle exec rails db:seed
```

### 7. Open in browser
```
http://localhost:3000
Sidekiq UI: http://localhost:3000/admin/sidekiq
```

## Authentication

### Session-based (Hotwire)
```
POST /users/sign_in     # Sign in
POST /users/sign_up     # Register
DELETE /users/sign_out  # Sign out
```

### JWT (JSON API)
```
POST   /api/v1/auth/sign_in   # Returns JWT token (set as httpOnly cookie)
POST   /api/v1/auth/sign_up   # Register + JWT token
DELETE /api/v1/auth/sign_out  # Invalidate token
GET    /api/v1/auth/me        # Current user info
```

All `/api/v1/*` endpoints require `Authorization: Bearer <token>` header.
JWT is stored as an httpOnly cookie — never in localStorage or HTML source.

## API Endpoints

All endpoints are prefixed with `/api/v1`.

### Auth
```
POST   /api/v1/auth/sign_in
POST   /api/v1/auth/sign_up
DELETE /api/v1/auth/sign_out
GET    /api/v1/auth/me
```

### Leagues
```
GET /api/v1/leagues
GET /api/v1/leagues/:id
GET /api/v1/leagues/:id/standings?season=
GET /api/v1/leagues/:id/top_scorers?season=
```

### Matches
```
GET /api/v1/matches
GET /api/v1/matches/live
GET /api/v1/matches/h2h?team1_id=&team2_id=
GET /api/v1/matches/:id
GET /api/v1/matches/:id/events
GET /api/v1/matches/:id/statistics
GET /api/v1/matches/:id/lineups
GET /api/v1/matches/:id/highlights
GET /api/v1/matches/:id/box_scores
GET /api/v1/matches/:id/predictions
GET /api/v1/matches/:id/shots
GET /api/v1/matches/:id/news
GET /api/v1/matches/:id/last_five
GET /api/v1/matches/:id/injuries
GET /api/v1/matches/:id/bookmakers
```

### Teams
```
GET /api/v1/teams
GET /api/v1/teams/:id
GET /api/v1/teams/:id/statistics?season=
GET /api/v1/teams/:id/matches?status=
GET /api/v1/teams/:id/players
GET /api/v1/teams/:id/transfers
```

### Players
```
GET /api/v1/players
GET /api/v1/players/:id
GET /api/v1/players/:id/statistics
GET /api/v1/players/:id/transfers
```

### Favorites
```
GET    /api/v1/favorites
GET    /api/v1/favorites/leagues
GET    /api/v1/favorites/teams
GET    /api/v1/favorites/players
POST   /api/v1/favorites
DELETE /api/v1/favorites/:id
```

### Preferences
```
GET   /api/v1/preference
PATCH /api/v1/preference
```

### Search
```
GET /api/v1/search?q=&type=
```

## Frontend

### Pages
```
/              → Today's matches (root)
/matches       → Match list with date navigation
/matches/:id   → Match details (Events, Lineups, Statistics, Shots, Standings, Highlights, Overview, Odds)
/leagues       → League list grouped by country
/leagues/:id   → League standings with season selector
/teams/:id     → Team profile with stats and recent matches
/players/:id   → Player profile with statistics and transfers
/search        → Full-text search (teams, players, leagues)
```

### React Components
React components are mounted server-side via `data-react-component` + `data-props` attributes:
```html
<div data-react-component="MatchShow" data-props='{"matchId": 123}'></div>
```

Key components:
- `MatchShow` — full match page with tabs (Events, Lineups, Statistics, Shots, Standings, Highlights, Overview, Odds)
- `MatchScore` — live score header with clock ticker, weather, referee, venue, Player of the Match
- `MatchEvents` — event list with SVG timeline, live dot, ticking clock
- `MatchLineup` — pitch visualization, substitutes, box score ratings
- `MatchStatistics` — match stats + per-player stats table
- `ShotMap` — 3×3 goal face grid, shot list with player photos, win probability bars
- `MatchesPage` — today/date match list with date navigation and calendar
- `TeamShow`, `PlayerShow`, `LeagueShow`, `SearchPage`, `AuthForm`

Custom hooks: `useMatchData` (all match data + WebSocket), `useMatchChannel` (singleton ActionCable), `usePlayerData`, `useTeamData`.

Tab state is persisted in URL (`?tab=Shots`) so the browser back button restores the active tab.

### Hotwire (server-rendered)
- ERB templates with Tailwind CSS v4
- Stimulus: `search_bar_controller.js`
- Layout partials: `_head`, `_navbar`, `_flash`

### View Caching
- Match list grouped by league — outer cache per league, inner cache per match
- League standings — outer cache per league+season, inner cache per standing row
- Auto-invalidated when `updated_at` changes via `touch: true` associations
- Redis namespace: `rails_cache:`

## Real-time Updates

Live match data via ActionCable WebSocket. Authentication uses Devise session (httpOnly cookie) — no token in HTML or URL.

WebSocket events: `match_update`, `goal`, `match_event`, `match_start`, `match_end`, `lineups_updated`, `statistics_updated`

## Data Synchronization

| Worker | Schedule | API Requests | Description |
|---|---|---|---|
| `SyncStaticDataWorker` | Mon 3:00 | ~2 | Countries + active leagues |
| `SyncWeeklyFixturesWorker` | Mon 4:00 | 7/league | Fixtures for next 7 days |
| `SyncH2hWorker` | Mon 5:00 | varies | H2H history for upcoming fixtures |
| `SyncMatchesWorker` | Daily 6:00 | 1/league | Today's match statuses |
| `SyncAllStandingsWorker` | Daily 7:00 | 1/league | League standings |
| `SyncTeamStatisticsWorker` | Mon 8:00 | ~20 | Team season statistics |
| `SyncPlayerStatisticsWorker` | Tue 3:00 | ~50 | Player stats in batches |
| `SyncPlayerProfilesWorker` | Wed 4:00 | varies | Profiles, transfers, injuries, rumours, market values |
| `SyncLiveMatchesWorker` | Every min | 1/league | Live scores — skips when no live/imminent matches |
| `SyncLiveEventsWorker` | Every min | 1/match | Events + stats for live matches, broadcasts via ActionCable |
| `SyncMatchDetailsWorker` | Every hour | 5/match | Full details for live matches |
| `SyncPreMatchLineupsWorker` | Every 15 min | 1/match | Lineups for matches starting within 90 min |
| `SyncHighlightsWorker` | Daily 23:00 | 1/league | Match highlights |
| `CacheWarmupWorker` | Every 5 min | 0 | Redis cache warmup |

**API budget**: ~3 calls/day on non-match days; ~100+ calls/day on busy match days. Threshold 7000/7500 stops calls automatically.

Run manually:
```bash
docker compose exec app bundle exec rails runner "SyncStaticDataWorker.new.perform"
docker compose exec app bundle exec rails runner "SyncWeeklyFixturesWorker.new.perform"
docker compose exec app bundle exec rails runner "SyncMatchesWorker.new.perform"
docker compose exec app bundle exec rails runner "SyncAllStandingsWorker.new.perform"
docker compose exec app bundle exec rails runner "CacheWarmupWorker.new.perform"

# Check API usage
docker compose exec app bundle exec rails runner "puts RedisService.get('requested_attempts')"
```

### Historical data seeding (APL)
```bash
# Import standings for all seasons
docker compose exec app bundle exec rails highlightly:seed_standings

# Import match results for a date range (resumable — progress saved in Redis)
docker compose exec app bundle exec rails 'highlightly:seed_matches[2023-08-01,2025-05-31]'

# Reset progress and start from scratch
docker compose exec app bundle exec rails highlightly:seed_matches_reset
```

## Search

Full-text search powered by Elasticsearch across Teams, Players and Leagues.
Supports exact match, fuzzy matching, and prefix search — e.g. `"arse"` returns Arsenal.
Filtered to active leagues only.

```bash
docker compose exec app bundle exec rails elasticsearch:reindex
```

## Running Tests
```bash
# Run all tests
docker compose exec -e RAILS_ENV=test app bundle exec rspec

# Run by category
docker compose exec -e RAILS_ENV=test app bundle exec rspec spec/models/
docker compose exec -e RAILS_ENV=test app bundle exec rspec spec/services/
docker compose exec -e RAILS_ENV=test app bundle exec rspec spec/workers/
docker compose exec -e RAILS_ENV=test app bundle exec rspec spec/requests/
docker compose exec -e RAILS_ENV=test app bundle exec rspec spec/channels/
```

## Useful Commands
```bash
# Rails console
docker compose exec app bundle exec rails console

# Migrations
docker compose exec app bundle exec rails db:migrate
docker compose exec -e RAILS_ENV=test app bundle exec rails db:migrate

# Logs
docker compose logs -f app
docker compose logs -f sidekiq

# Stop all services
docker compose down

# Rebuild containers
docker compose build --no-cache

# Rebuild Vite
docker compose exec app bin/vite build --clear --mode=development
```

## CI/CD

- Push to `main` → runs CI (RSpec, Rubocop, Brakeman) + builds Docker image
- Push tag `v*` → deploys to production

## Database Models

| Model | Description |
|---|---|
| `Country` | Countries supported by the API |
| `League` | Football leagues with seasons |
| `Team` | Football teams |
| `TeamStatistic` | Team stats per league and season |
| `Match` | Matches with live scores and status |
| `MatchEvent` | Goals, cards, substitutions (`event_type` not `type`) |
| `MatchStatistic` | Match stats per team (EAV) |
| `MatchLineup` | Team lineups and formations (jsonb) |
| `MatchShot` | Shot data per match (goal_target, outcome) |
| `MatchPrediction` | Win probability (home/draw/away %, prematch + live) |
| `MatchNewsItem` | News items linked to a match |
| `BoxScore` | Per-player match stats; `link_players!` retroactively links `player_id` |
| `Highlight` | Match video highlights (`highlight_type` not `type`) |
| `Standing` | League standings |
| `Player` | Player basic info |
| `PlayerProfile` | Detailed player profile |
| `PlayerStatistic` | Stats per competition |
| `PlayerClubStatistic` | Stats per club |
| `PlayerTransfer` | Transfer history |
| `PlayerInjury` | Injury history |
| `PlayerRumour` | Transfer rumours |
| `PlayerMarketValue` | Market value history |
| `User` | Authenticated users (Devise + roles) |
| `Favorite` | User favorites — polymorphic (League/Team/Player) |
| `UserPreference` | User settings (timezone, notifications) |

## Project Structure
```
app/
  channels/
    application_cable/
      channel.rb
      connection.rb         # Devise session auth for WebSocket (warden)
    match_channel.rb        # Streams match_:id for live updates
  controllers/
    api/v1/                 # JSON API (JWT auth)
      auth/                 # sign_in, sign_up, sign_out, me
      base_controller.rb
      leagues_controller.rb
      matches_controller.rb
      teams_controller.rb
      players_controller.rb
      favorites_controller.rb
      preferences_controller.rb
      search_controller.rb
    users/                  # Devise session controllers
    leagues_controller.rb   # Hotwire HTML controllers
    matches_controller.rb
    teams_controller.rb
    players_controller.rb
    search_controller.rb
  models/                   # 26 ActiveRecord models
    concerns/
      searchable.rb
      match_constants.rb
  serializers/              # jsonapi-serializer
  queries/
    match_queries/          # box_scores, h2h, highlights, injuries, last_five,
                            # lineups, shots, standings, suspensions, ...
    league_queries/         # leagues_list, top_scores
    player_queries/         # transfers
  services/
    highlightly/
      client.rb
      importers/            # country, highlight, league, match, player,
                            # player_profile, player_statistics,
                            # standing, team_detail, team_statistics
    interactors/
      match_data/           # Fetch, UpdateState, SyncEvents, SyncStatistics,
                            # SyncLineup, SyncBoxScore, SyncMatchDetails
      cache_warmup/         # Leagues, TodayMatches, TodayMatchDetails
    organizers/sync_match_data.rb
    cache_service/          # Keys, TTL, Store
    jwt_service.rb
    token_blacklist_service.rb
    match_broadcast_service.rb
    search_service.rb
  workers/                  # 15 workers — see Data Synchronization table
  views/
    layouts/
      application.html.erb
      _head.html.erb / _navbar.html.erb / _flash.html.erb
    matches/ leagues/ teams/ players/
    users/sessions/ users/registrations/
  javascript/
    entrypoints/
      application.js        # Stimulus + Hotwire
      react.jsx             # React component registry
      application.css       # TailwindCSS v4
    channels/consumer.js
    controllers/
      search_bar_controller.js
    components/
      match/
        MatchShow.jsx / MatchScore.jsx / MatchEvents.jsx
        MatchLineup.jsx / MatchStatistics.jsx / MatchStandings.jsx
        MatchOverview.jsx / MatchHighlights.jsx / MatchOdds.jsx
        MatchH2H.jsx / MatchLastFive.jsx / MatchInjuries.jsx
        MatchesPage.jsx / MatchGroup.jsx / MatchesSidebars.jsx
        events/   # EventTimeline, EventTimelineItems, eventTimelineUtils, EventDividers, EventRow
        lineup/   # PitchSVG, SubstitutesList, badges
        score/    # CountdownStrip, GoalsList, MatchMeta
        shots/    # GoalFace, ShotList
        statistics/ # PlayerTable
      league/ team/ player/ search/ auth/ ui/
    hooks/
      useMatchData.js         # All match fetching + WebSocket + derived state
      useMatchChannel.js      # Singleton ActionCable subscription
      useLiveMatchChannels.js / usePlayerData.js / useTeamData.js
      useCountdown.js / useFetch.js
    services/ utils/ constants/
config/
  schedule.yml              # sidekiq-cron job definitions
  cable.yml
  initializers/
lib/
  redis_service.rb
spec/
  channels/ models/ services/ workers/ requests/ factories/ support/
```
