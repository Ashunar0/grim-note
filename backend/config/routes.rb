Rails.application.routes.draw do
  get "up" => "rails/health#show", as: :rails_health_check

  namespace :api do
    namespace :v1 do
      resources :users, only: [:create, :show]
      resources :posts, only: [:index, :show, :create]
      post "login", to: "sessions#create"
      delete "logout", to: "sessions#destroy"
      get "me", to: "current_users#show"
      get "books/search", to: "books#search"
      patch "profile", to: "profiles#update"
    end
  end
end
