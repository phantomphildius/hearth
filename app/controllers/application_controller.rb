# typed: strict

class ApplicationController < ActionController::Base
  extend T::Sig

  before_action :authenticate_user!

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
