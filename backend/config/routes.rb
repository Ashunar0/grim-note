Rails.application.routes.draw do
  get "up" => "rails/health#show", as: :rails_health_check

  namespace :api do
    namespace :v1 do
      resources :users, only: [:create]
      resources :posts, only: [:index, :show]
      post "login", to: "sessions#create"
      delete "logout", to: "sessions#destroy"
      get "me", to: "current_users#show"
    end
  end
end
