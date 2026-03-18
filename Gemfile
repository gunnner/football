source "https://rubygems.org"

ruby "4.0.2"

gem "bootsnap", require: false
gem "devise"
gem "elasticsearch-model"
gem "elasticsearch-rails"
gem "flipper"
gem "flipper-redis"
gem "jsonapi-serializer"
gem "kredis"
gem "lograge"
gem "pagy"
gem "pg", "~> 1.1"
gem "propshaft"
gem "puma", ">= 5.0"
gem "rack-attack"
gem "rails", "~> 8.1.2"
gem "redis", "~> 5.0"
gem "sentry-ruby"
gem "sentry-rails"
gem "sentry-sidekiq"
gem "sidekiq", "~> 7.0"
gem "sidekiq-cron"
gem "stimulus-rails"
gem "turbo-rails"
gem "tzinfo-data", platforms: %i[windows jruby]
gem "vite_rails"


group :development, :test do
  gem "brakeman", require: false
  gem "debug", platforms: %i[mri windows], require: "debug/prelude"
  gem "dotenv-rails"
  gem "factory_bot_rails"
  gem "faker"
  gem "pry-rails"
  gem "rubocop-rails-omakase", require: false
  gem "rspec-rails"
end

group :development do
  gem "prosopite"
  gem "web-console"
end

group :test do
  gem "capybara"
  gem "selenium-webdriver"
  gem "shoulda-matchers"
  gem "webmock"
  gem "vcr"
end
