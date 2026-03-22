module Organizers
  class Base
    include Interactor
    include Interactor::Contracts
    include Interactor::Organizer

    on_breach do |breaches|
      context.fail!(breaches)
    end
  end
end
