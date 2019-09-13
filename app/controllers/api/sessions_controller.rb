class Api::SessionsController < ApplicationController
    def create 

        @user = User.find_by_credentials(params[:user][:username],params[:user][:password])
        if @user
            # debugger
            login(@user)
            render "/api/users/show"
        else
            render json: ["Invalid username or password"], status: 404
        end

    end

    def destroy
        logout
    end
end