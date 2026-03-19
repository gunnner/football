# Football App

A FotMob-inspired football application built with Ruby on Rails.

## Tech Stack

- Ruby 4.0.2 / Rails 8.1
- PostgreSQL, Redis, Sidekiq
- Elasticsearch
- Hotwire (Turbo + Stimulus) + React
- Docker

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

## Useful Commands
```bash
# Rails console
docker compose exec app bundle exec rails console

# Run tests
docker compose exec app bundle exec rspec

# Tail logs
docker compose logs -f app
docker compose logs -f sidekiq

# Stop all services
docker compose down
```

## CI/CD

- Push to `main` → runs CI (RSpec, Rubocop, Brakeman) + builds Docker image
- Push tag `v*` → deploys to production

## Project Structure
```
app/
  controllers/    # Rails controllers
  models/         # ActiveRecord models
  views/          # Hotwire/ERB templates
  javascript/     # React components + Stimulus
  services/       # Service layer
    api_football/ # API client and importers
config/
  sidekiq.yml     # Queue configuration
  initializers/   # Sentry, Lograge
docker/
  nginx/          # Nginx configuration
```
