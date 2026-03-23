# Football App

A FotMob-inspired football application built with Ruby on Rails.

## Tech Stack

- Ruby 4.0.2 / Rails 8.1
- PostgreSQL, Redis, Sidekiq
- Elasticsearch
- Hotwire (Turbo + Stimulus) + React
- Vite
- Docker

## Data Source

Powered by [Highlightly Football API](https://highlightly.net/documentation/football/)

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
# Edit .env — fill in DB_USERNAME, DB_PASSWORD, API_FOOTBALL_KEY
```

### 3. Start Docker
```bash
docker compose up
```

### 4. Create and migrate the database
```bash
docker compose exec app bundle exec rails db:create db:migrate
```

### 5. Create Elasticsearch indexes and index data
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

## Running Tests
```bash
# Run all tests
docker compose exec -e RAILS_ENV=test app bundle exec rspec

# Run by category
docker compose exec -e RAILS_ENV=test app bundle exec rspec spec/models/
docker compose exec -e RAILS_ENV=test app bundle exec rspec spec/services/
docker compose exec -e RAILS_ENV=test app bundle exec rspec spec/workers/

# Run specific file
docker compose exec -e RAILS_ENV=test app bundle exec rspec spec/models/match_spec.rb
```

## Data Synchronization

Data is synced automatically via Sidekiq Cron:

| Worker | Schedule | Description |
|---|---|---|
| `SyncStaticDataWorker` | Daily at 3:00 | Countries and leagues |
| `SyncMatchesWorker` | Daily at 6:00 | Today's matches |
| `SyncLiveMatchesWorker` | Every minute | Live match scores and events |
| `SyncHighlightsWorker` | Every 6 hours | Match highlights |
| `CacheWarmupWorker` | Every 5 minutes | Redis cache warmup |

Run manually:
```bash
docker compose exec app bundle exec rails runner "SyncStaticDataWorker.new.perform"
docker compose exec app bundle exec rails runner "SyncMatchesWorker.new.perform"
docker compose exec app bundle exec rails runner "SyncHighlightsWorker.new.perform"
```

## Search

Reindex elasticsearch
```bash
docker compose exec app bundle exec rails elasticsearch:reindex  
```

Full-text search powered by Elasticsearch across Teams, Players and Leagues:
```ruby
# In Rails console
SearchService.new('manchester').call
SearchService.new('premier league').call
SearchService.new('ronaldo').call
```

Reindex all data:
```bash
docker compose exec app bundle exec rails elasticsearch:reindex
```

## Useful Commands
```bash
# Rails console
docker compose exec app bundle exec rails console

# Run migrations
docker compose exec app bundle exec rails db:migrate
docker compose exec -e RAILS_ENV=test app bundle exec rails db:migrate

# Tail logs
docker compose logs -f app
docker compose logs -f sidekiq

# Stop all services
docker compose down

# Rebuild containers
docker compose build --no-cache

# Check API rate limit
docker compose exec app bundle exec rails runner "puts RedisService.get('requested_attempts')"
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
  controllers/        # Rails controllers
  models/             # ActiveRecord models (18 models)
    concerns/         # Searchable, etc.
  views/              # Hotwire/ERB templates
  javascript/         # React components + Stimulus
    entrypoints/      # Vite entrypoints
  services/           # Service layer
    highlightly/      # API client and importers
      importers/      # Country, League, Match, Standing, Highlight
    interactors/      # Business logic
      match_data/     # Fetch, UpdateState, SyncEvents, etc.
      cache_warmup/   # Leagues, TodayMatches
    organizers/       # SyncMatchData
    cache_service/    # Redis caching layer
  workers/            # Sidekiq background jobs
config/
  sidekiq.yml         # Queue configuration
  schedule.yml        # Cron schedule
  vite.json           # Vite configuration
  initializers/       # Sentry, Lograge, Elasticsearch
docker/
  nginx/              # Nginx configuration
lib/
  tasks/              # Rake tasks (elasticsearch)
spec/
  models/             # Model specs
  services/           # Service and interactor specs
  workers/            # Worker specs
  factories/          # FactoryBot factories
  support/            # RSpec helpers, VCR
```
