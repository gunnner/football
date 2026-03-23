class ElasticsearchIndexWorker < BaseWorker
  sidekiq_options queue: :low, retry: 3

  def perform(model_name, id, action = 'index')
    model  = model_name.constantize
    record = model.find_by(id: id)

    case action
    when 'index'
      return if record.blank?
      record.__elasticsearch__.index_document
    when 'delete'
      model.__elasticsearch__.client.delete(
        index: model.index_name,
        id:    id
      )
    end
  rescue Elastic::Transport::Transport::Errors::NotFound
    nil
  rescue StandardError => e
    log_error "Failed to #{action} #{model_name}##{id}: #{e.message}"
    Sentry.capture_exception(e)
    raise
  end
end
