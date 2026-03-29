# typed: strict

class ApplicationController < ActionController::Base
  extend T::Sig

  before_action :authenticate_user!

  def authenticate_user!
    redirect_to(new_user_session_path, alert: "Please sign in to continue.") unless user_signed_in?
  end

  inertia_share do
    {
      auth: {
        user: if current_user
                {
                  id: current_user.id,
                  name: current_user.name,
                  email: current_user.email,
                  avatar_url: current_user.avatar_url,
                }
              end,
        current_household_id: current_user&.households&.first&.id,
      },
      flash: {
        notice: flash[:notice],
        alert: flash[:alert],
      },
    }
  end
end
