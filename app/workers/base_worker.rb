class BaseWorker
  include Sidekiq::Job

  sidekiq_options retry: 3

  private

  def log(message)
    Rails.logger.info(full_message(message))
  end

  def log_error(message)
    Rails.logger.error(full_message(message))
  end

  def full_message(message)
    "[#{self.class.name}] #{message}"
  end

  def client
    @client ||= Highlightly::Client.new
  end
end
