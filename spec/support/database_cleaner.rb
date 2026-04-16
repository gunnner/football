RSpec.configure do |config|
  config.before(:suite) do
    unless Rails.env.test?
      abort "FATAL: DatabaseCleaner is configured to truncate on suite start, " \
            "but Rails.env='#{Rails.env}'. Set RAILS_ENV=test to proceed."
    end

    DatabaseCleaner.allow_remote_database_url = true
    DatabaseCleaner.strategy = :transaction
    DatabaseCleaner.clean_with(:truncation)
  end

  config.around(:each) do |example|
    DatabaseCleaner.cleaning { example.run }
  end
end
