# require ''
Elasticsearch::Model.client = Elasticsearch::Client.new(
  url:              ENV.fetch('ELASTICSEARCH_URL', 'http://localhost:9200'),
  log:              Rails.env.development?,
  retry_on_failure: 3,
  request_timeout:  30
)
