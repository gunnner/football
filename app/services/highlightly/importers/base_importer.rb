module Highlightly
  module Importers
    class BaseImporter
      def initialize
        @client = Highlightly::Client.new
      end

      def call
        raise NotImplementedError, "#{class_name} must implement #call"
      end

      private

      def log(message)
        Rails.logger.info("[#{class_name}] #{message}")
      end

      def log_error(message)
        Rails.logger.error("[#{class_name}] #{message}")
      end

      def class_name
        self.class.name
      end
    end
  end
end
