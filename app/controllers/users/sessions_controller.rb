# typed: strict

module Users
  class SessionsController < Devise::SessionsController
    extend T::Sig

    skip_before_action :authenticate_user!, only: [:new]

    def new
      render inertia: "Auth/SignIn"
    end
  end
end
