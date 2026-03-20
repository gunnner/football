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

### 5. Open in browser
```
http://localhost:3000
```

## Running Tests
```bash
# Run all tests
docker compose exec -e RAILS_ENV=test app bundle exec rspec

# Run specific model tests
docker compose exec -e RAILS_ENV=test app bundle exec rspec spec/models/

# Run specific file
docker compose exec -e RAILS_ENV=test app bundle exec rspec spec/models/match_spec.rb
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
  controllers/    # Rails controllers
  models/         # ActiveRecord models (18 models)
  views/          # Hotwire/ERB templates
  javascript/     # React components + Stimulus
    entrypoints/  # Vite entrypoints
  services/       # Service layer
    api_football/ # API client and importers
config/
  sidekiq.yml     # Queue configuration
  vite.json       # Vite configuration
  initializers/   # Sentry, Lograge, Prosopite
docker/
  nginx/          # Nginx configuration
spec/
  models/         # Model specs
  factories/      # FactoryBot factories
  support/        # RSpec helpers
```
