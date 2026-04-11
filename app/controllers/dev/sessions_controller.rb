# typed: strict

module Dev
  class SessionsController < ApplicationController
    skip_before_action :authenticate_user!
    skip_after_action :verify_authorized

    DEV_USER_ATTRS = {
      provider: "developer",
      uid: "dev-user-001",
      email: "dev@example.com",
      name: "Dev User",
    }.freeze

    def create
      user = User.find_or_create_by(provider: DEV_USER_ATTRS[:provider], uid: DEV_USER_ATTRS[:uid]) do |u|
        u.email = DEV_USER_ATTRS[:email]
        u.name = DEV_USER_ATTRS[:name]
      end

      ProvisionDefaultHousehold.call(user: user)
      sign_in(user)
      redirect_to root_path, notice: "Signed in as dev user."
    end
  end
end
