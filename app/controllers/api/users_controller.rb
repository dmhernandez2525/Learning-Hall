class Api::UsersController < ApplicationController

    def create 
        @user = User.new(user_params)

        debugger
        if @user.save
            debugger
            login(@user)
            # render "api/users/show"
            render "api/users/show"
        else
            render json: @user.errors.full_messages, status: 422
        end    
    end


    private
    def user_params 
        params.require(:user).permit(:username,:email,:password,:user_role)
    end 
end
