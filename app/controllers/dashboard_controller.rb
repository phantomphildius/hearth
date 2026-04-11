# typed: strict

class DashboardController < ApplicationController
  extend T::Sig

  before_action :set_household

  sig { void }
  def index
    authorize :dashboard
    render(inertia: "Dashboard/Index", props: {
      household: { id: @household.id, name: @household.name },
    })
  end

  private

  sig { void }
  def set_household
    @household = current_user.households.first
    redirect_to(new_household_path) and return if @household.nil?
  end
end
