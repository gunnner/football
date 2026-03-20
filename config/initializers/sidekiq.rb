require 'sidekiq/web'

Sidekiq.configure_server do |config|
  config.redis = { url: ENV.fetch('REDIS_URL', 'redis://localhost:6379/0') }
end

Sidekiq.configure_client do |config|
  config.redis = { url: ENV.fetch('REDIS_URL', 'redis://localhost:6379/0') }
end

Sidekiq::Web.use(Rack::Auth::Basic) do |username, password|
  ActiveSupport::SecurityUtils.secure_compare(
    username, ENV.fetch('SIDEKIQ_WEB_USERNAME', 'admin')
  ) &
  ActiveSupport::SecurityUtils.secure_compare(
    password, ENV.fetch('SIDEKIQ_WEB_PASSWORD', 'password')
  )
end if Rails.env.production? || Rails.env.staging?
