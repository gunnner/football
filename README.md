# README.md

# Football App

A football application built with Ruby on Rails.

## Tech Stack

- Ruby 4.0.2 / Rails 8.1.2
- PostgreSQL, Redis, Sidekiq
- Elasticsearch
- Hotwire (Turbo + Stimulus) + React
- Vite, Docker

## Data Source

Powered by [Highlightly Football API](https://highlightly.net/documentation/football/)
Free plan: 100 requests/day. Active league: Premier League (expandable via `ACTIVE_LEAGUE_IDS` env).

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
POST   /api/v1/auth/sign_in   # Returns JWT token
POST   /api/v1/auth/sign_up   # Register + JWT token
DELETE /api/v1/auth/sign_out  # Invalidate token
GET    /api/v1/auth/me        # Current user info
```

All `/api/v1/*` endpoints require `Authorization: Bearer <token>` header.

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

## Real-time Updates

Live match scores via ActionCable WebSocket.

**Hotwire** — authentication throw Devise session (automatically):
```javascript
// consumer.js — Devise session sends automatically
createConsumer('/cable')
```

Events: `match_update`, `goal`, `match_start`, `match_end`

## Data Synchronization

| Worker | Schedule | API Requests | Description |
|---|---|---|---|
| `SyncStaticDataWorker` | Weekly Monday 3:00 | ~9 | Countries and leagues |
| `SyncMatchesWorker` | Daily 6:00 | 1/league | Today's matches |
| `SyncLiveMatchesWorker` | Every 2 min | 1/league | Live match scores |
| `SyncMatchDetailsWorker` | Every 30 min | 4/match | Events, stats, lineups |
| `SyncAllStandingsWorker` | Daily 7:00 | 1/league | League standings |
| `SyncHighlightsWorker` | Daily 23:00 | 1/league | Match highlights |
| `CacheWarmupWorker` | Every 5 min | 0 | Redis cache warmup |

**API budget**: ~74 requests on match day (within 100/day free plan limit).

Run manually:
```bash
docker compose exec app bundle exec rails runner "SyncStaticDataWorker.new.perform"
docker compose exec app bundle exec rails runner "SyncMatchesWorker.new.perform"
docker compose exec app bundle exec rails runner "SyncAllStandingsWorker.new.perform"
docker compose exec app bundle exec rails runner "SyncHighlightsWorker.new.perform"
docker compose exec app bundle exec rails runner "CacheWarmupWorker.new.perform"

# Check API usage
docker compose exec app bundle exec rails runner "puts RedisService.get('requested_attempts')"
```

## Search

Full-text search powered by Elasticsearch across Teams, Players and Leagues:
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
| `MatchEvent` | Goals, cards, substitutions |
| `MatchStatistic` | Match stats per team |
| `MatchLineup` | Team lineups and formations |
| `BoxScore` | Per-player match statistics |
| `Highlight` | Match video highlights |
| `Standing` | League standings |
| `Player` | Player basic info |
| `PlayerProfile` | Detailed player profile |
| `PlayerStatistic` | Stats per club and competition |
| `PlayerTransfer` | Transfer history |
| `PlayerInjury` | Injury history |
| `PlayerRumour` | Transfer rumours |
| `PlayerMarketValue` | Market value history |
| `User` | Authenticated users |
| `Favorite` | User favorites (polymorphic) |
| `UserPreference` | User settings and preferences |

## Project Structure
```
app/
  channels/
    application_cable/  # ActionCable connection with JWT auth
    match_channel.rb    # Real-time match updates
  controllers/
    api/v1/             # JSON API controllers (JWT auth)
      auth/             # sessions, registrations
      base_controller.rb
      leagues_controller.rb
      matches_controller.rb
      teams_controller.rb
      players_controller.rb
      favorites_controller.rb
      preferences_controller.rb
      search_controller.rb
    users/              # Devise controllers (session auth)
    leagues_controller.rb   # Hotwire controllers
    matches_controller.rb
    teams_controller.rb
    players_controller.rb
  models/               # 21 ActiveRecord models
    concerns/
      searchable.rb
  serializers/          # jsonapi-serializer
  services/
    highlightly/        # API client and importers
    interactors/        # Business logic
      match_data/
      cache_warmup/
    organizers/         # SyncMatchData
    cache_service/      # Redis caching (Keys, TTL, Store)
    jwt_service.rb      # JWT encode/decode
    token_blacklist_service.rb
    match_broadcast_service.rb
    search_service.rb
  helpers/
  workers/              # Sidekiq background jobs
  views/
    layouts/
    matches/
    leagues/
    teams/
    players/
    users/              # Devise views
  javascript/
    channels/
      consumer.js
    controllers/
      match_controller.js  # Stimulus + ActionCable
    services/
      auth.js
config/
  sidekiq.yml
  schedule.yml
  cable.yml             # ActionCable Redis adapter
  initializers/
lib/
  redis_service.rb
  tasks/
spec/
  channels/
  models/
  services/
  workers/
  requests/
  factories/
  support/
```
