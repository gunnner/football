require 'sidekiq/web'

Rails.application.routes.draw do
  devise_for :users, controllers: {
                       sessions:      'users/sessions',
                       registrations: 'users/registrations'
                     }

  mount ActionCable.server => '/cable'

  if Rails.env.development?
    mount Sidekiq::Web => '/admin/sidekiq'
  else
    authenticate :user, ->(u) { u.admin? } do
      mount Sidekiq::Web => '/admin/sidekiq'
    end
  end

  namespace :api do
    namespace :v1 do
      namespace :auth do
        post   :sign_in,  to: 'sessions#create'
        post   :sign_up,  to: 'registrations#create'
        delete :sign_out, to: 'sessions#destroy'
        get    :me,       to: 'sessions#me'
      end

      resources :favorites, only: %i[index create destroy] do
        collection do
          get :leagues
          get :teams
          get :players
        end
      end

      resource :preference, only: %w[show update], controller: 'preferences'

      resources :leagues, only: %w[index show] do
        member do
          get :standings
          get :top_scorers
        end
      end

      resources :matches, only: %w[index show] do
        member do
          get :lineups
          get :events
          get :statistics
          get :highlights
          get :box_scores
          get :predictions
          get :shots
          get :news
          get :last_five
          get :injuries
          get :bookmakers
        end

        collection do
          get :live
          get :h2h
        end
      end

      resources :teams, only: %w[index show] do
        member do
          get :statistics
          get :players
          get :matches
          get :transfers
        end
      end

      resources :players, only: %w[index show] do
        member do
          get :statistics
          get :transfers
        end
      end

      get 'search', to: 'search#index'
    end
  end

  resources :leagues, only: %w[index show]
  resources :matches, only: %w[index show]
  resources :players, only: %w[show]
  resources :teams,   only: %w[show]

  get 'search', to: 'search#index'

  get 'up' => 'rails/health#show', as: :rails_health_check

  root 'matches#index'
end
