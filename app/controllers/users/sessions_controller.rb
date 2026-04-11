# typed: strict

module Users
  class SessionsController < Devise::SessionsController
    extend T::Sig

    skip_before_action :authenticate_user!, only: [:new]
    skip_after_action :verify_authorized

    def new
      props = {}
      props[:dev_sign_in_path] = dev_sign_in_path if Rails.env.development?
      render inertia: "Auth/SignIn", props: props
    end
  end
end
