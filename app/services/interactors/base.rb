module Interactors
  class Base
    include Interactor
    include Interactor::Contracts

    on_breach do |breaches|
      context.fail!(breaches)
    end

    def fail!(message)
      context.fail!(error: message)
    end

    def log(message)
      Rails.logger.info(full_message(message))
    end

    def log_error(message)
      Rails.logger.error(full_message(message))
    end

    def full_message(message)
      "[#{self.class.name}] #{message}"
    end
  end
end
