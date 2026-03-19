require "sidekiq/web"

Rails.application.routes.draw do
  if Rails.env.development?
    mount Sidekiq::Web => "/admin/sidekiq"
  else
    authenticate :user, ->(u) { u.admin? } do
      mount Sidekiq::Web => "/admin/sidekiq"
    end
  end

  get "up" => "rails/health#show", as: :rails_health_check
end
