# typed: strict

class HouseholdMembersController < ApplicationController
  extend T::Sig

  before_action :set_household

  sig { void }
  def create
    result = AddHouseholdMember.call(household: @household, email: params[:email])

    if result.success?
      redirect_to(household_path(@household), notice: "#{result.record.user.name} added to household.")
    else
      redirect_to(household_path(@household), alert: result.errors.join(", "))
    end
  end

  sig { void }
  def destroy
    result = RemoveHouseholdMember.call(household: @household, user_id: params[:id].to_i)

    if result.success?
      redirect_to(household_path(@household), notice: "Member removed.")
    else
      redirect_to(household_path(@household), alert: result.errors.join(", "))
    end
  end

  private

  sig { void }
  def set_household
    @household = current_user.households.find(params[:household_id])
  end
end
