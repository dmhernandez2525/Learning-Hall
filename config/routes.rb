Rails.application.routes.draw do    


    root "static_pages#root"
    
    namespace :api, defaults: {format: :json} do
      resource :sessions, only: [:create, :destroy]
      resources :users, only: [:create, :update,:destroy ]
      resources :courses, only: [:index, :update, :create, :destroy, :show]
      resources :subjects, only: [:index, :update, :create, :destroy, :show]
      resources :tasks, only: [:index, :update, :create, :destroy, :show]
    end

 
  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html
end




















