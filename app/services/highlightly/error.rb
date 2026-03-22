module Highlightly
  class Error             < StandardError; end
  class RateLimitError    < Error; end
  class NotFoundError     < Error; end
  class ServerError       < Error; end
  class UnauthorizedError < Error; end
end
