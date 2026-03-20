require 'prosopite'

Rails.application.configure do
  if Rails.env.development?
    config.after_initialize do
      Prosopite.rails_logger = true
      Prosopite.raise        = false
    end
  end

  if Rails.env.test?
    config.after_initialize do
      Prosopite.rails_logger = true
      Prosopite.raise        = true
    end
  end
end
