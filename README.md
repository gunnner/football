# Football App

A football application built with Ruby on Rails.

## Tech Stack

- Ruby 4.0.2 / Rails 8.1
- PostgreSQL, Redis, Sidekiq
- Elasticsearch
- Hotwire (Turbo + Stimulus) + React
- Vite
- Docker

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

## API Endpoints

All endpoints are prefixed with `/api/v1`.

### Leagues
```
GET /api/v1/leagues                          # list with pagination
GET /api/v1/leagues/:id                      # league details
GET /api/v1/leagues/:id/standings?season=    # league standings
GET /api/v1/leagues/:id/top_scorers?season=  # top scorers
```

### Matches
```
GET /api/v1/matches                          # list with filters (date, league_id, status)
GET /api/v1/matches/live                     # live matches
GET /api/v1/matches/h2h?team1_id=&team2_id=  # head to head
GET /api/v1/matches/:id                      # match details
GET /api/v1/matches/:id/events               # match events
GET /api/v1/matches/:id/statistics           # match statistics
GET /api/v1/matches/:id/lineups              # match lineups
GET /api/v1/matches/:id/highlights           # match highlights
```

### Teams
```
GET /api/v1/teams                            # list with pagination
GET /api/v1/teams/:id                        # team details
GET /api/v1/teams/:id/statistics?season=     # team statistics
GET /api/v1/teams/:id/matches?status=        # team matches
GET /api/v1/teams/:id/players                # team players
GET /api/v1/teams/:id/transfers              # team transfers
```

### Players
```
GET /api/v1/players                          # list with pagination
GET /api/v1/players/:id                      # player details
GET /api/v1/players/:id/statistics           # player statistics
GET /api/v1/players/:id/transfers            # player transfers
```

### Search
```
GET /api/v1/search?q=&type=                  # full-text search (type: team|player|league)
```

## Data Synchronization

Data is synced automatically via Sidekiq Cron:

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

Full-text search powered by Elasticsearch across Teams, Players and Leagues with fuzzy matching:
```bash
# Reindex all data
docker compose exec app bundle exec rails elasticsearch:reindex
```
```ruby
# In Rails console
SearchService.new('lyon').call
SearchService.new('premier league').call
SearchService.new('jose').call
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

# Run specific file
docker compose exec -e RAILS_ENV=test app bundle exec rspec spec/models/match_spec.rb
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

## Project Structure
```
app/
  controllers/
    api/v1/             # JSON API controllers
      base_controller.rb
      leagues_controller.rb
      matches_controller.rb
      teams_controller.rb
      players_controller.rb
      search_controller.rb
  models/               # 18 ActiveRecord models
    concerns/
      searchable.rb     # Elasticsearch integration
  serializers/          # jsonapi-serializer
  services/
    highlightly/        # API client and importers
      client.rb
      endpoints.rb
      error.rb
      importers/        # Country, League, Match, Standing, Highlight
    interactors/        # Business logic (interactor gem)
      match_data/       # Fetch, UpdateState, SyncEvents, SyncStatistics, SyncLineup
      cache_warmup/     # Leagues, TodayMatches
    organizers/         # SyncMatchData
    cache_service/      # Redis caching layer
      keys.rb
      ttl.rb
      store.rb
  workers/              # Sidekiq background jobs
config/
  sidekiq.yml           # Queue configuration
  schedule.yml          # Cron schedule
  initializers/         # Sentry, Lograge, Elasticsearch, FootballConfig
lib/
  redis_service.rb      # ConnectionPool Redis wrapper
  tasks/
    elasticsearch.rake
spec/
  models/
  services/
  workers/
  requests/             # API request specs
  factories/
  support/              # RSpec helpers, VCR, WebMock
```
