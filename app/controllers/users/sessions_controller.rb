# typed: strict

module Users
  class SessionsController < Devise::SessionsController
    extend T::Sig

    skip_before_action :authenticate_user!, only: [:new]
    skip_after_action :verify_authorized

    def new
      render inertia: "Auth/SignIn"
    end
  end
end
