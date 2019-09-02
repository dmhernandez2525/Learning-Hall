class ApplicationController < ActionController::Base


  private#????

  def current_user
    @current_user ||= User.find_by(session_token: session[:session_token])
  end

  def logged_in?
    !!current_user
  end

  def login(user)
    user.reset_session_token!
    session[:session_token] = user.session_token
    @current_user = user
  end

  def logout
    current_user.reset_session_token!
    session[:session_token] = nil
    render json: {}
    # @current_user = nil
  end

  def require_logged_in
    unless current_user
      render json: ['invalid credentials'] , status: 401
    end
  end
end
