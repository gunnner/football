Sentry.init do |config|
  config.enabled_environments = %w[production staging]
  # config.enabled_environments << "development"
  config.breadcrumbs_logger = %i[active_support_logger http_logger]
  config.dsn                = ENV['SENTRY_DSN']
  config.traces_sample_rate = 0.05
  config.send_default_pii  = false

  config.excluded_exceptions += [
    'ActionController::RoutingError',
    'ActiveRecord::RecordNotFound',
    'ActionController::InvalidAuthenticityToken'
  ]
end
