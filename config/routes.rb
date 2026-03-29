Rails.application.routes.draw do
  devise_for :users, controllers: {
    omniauth_callbacks: "users/omniauth_callbacks",
    sessions: "users/sessions",
  }

  resources :households, only: [:show, :new, :create, :update] do
    member do
      get :settings
    end
    resources :household_members, only: [:create, :destroy]
    resources :children, only: [:create, :update, :destroy]
    resources :activities
  end

  get "up" => "rails/health#show", as: :rails_health_check

  root "households#show", id: "current"
end
