require 'vcr'

VCR.configure do |config|
  config.cassette_library_dir = 'spec/fixtures/vcr_cassettes'
  config.hook_into :webmock
  config.configure_rspec_metadata!
  config.filter_sensitive_data('<API_KEY>') { ENV['API_FOOTBALL_KEY'] }
  config.default_cassette_options = {
    record:            :new_episodes,
    match_requests_on: %i[method uri]
  }
end
