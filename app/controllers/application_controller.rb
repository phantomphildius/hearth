# typed: strict

class ApplicationController < ActionController::Base
  extend T::Sig

  include Pundit::Authorization

  before_action :authenticate_user!
  after_action :verify_authorized

  rescue_from Pundit::NotAuthorizedError, with: :render_forbidden

  def authenticate_user!
    redirect_to(new_user_session_path, alert: "Please sign in to continue.") unless user_signed_in?
  end

  private

  def render_forbidden
    render(plain: "Not authorized", status: :forbidden)
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
