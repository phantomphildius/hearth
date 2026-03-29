# typed: strict

class HouseholdMembersController < ApplicationController
  extend T::Sig

  before_action :set_household

  sig { void }
  def create
    user = User.find_by(email: params[:email])

    if user.nil?
      return render(inertia: "Households/Show", props: { error: "No user found with that email." })
    end

    member = @household.household_members.build(user: user)

    if member.save
      redirect_to(household_path(@household), notice: "#{user.name} added to household.")
    else
      redirect_to(household_path(@household), alert: member.errors.full_messages.join(", "))
    end
  end

  sig { void }
  def destroy
    if @household.household_members.count <= 1
      redirect_to(household_path(@household), alert: "Cannot remove the last member of a household.")
      return
    end

    member = @household.household_members.find_by(user_id: params[:id])

    if member&.destroy
      redirect_to(household_path(@household), notice: "Member removed.")
    else
      redirect_to(household_path(@household), alert: "Could not remove member.")
    end
  end

  private

  sig { void }
  def set_household
    @household = current_user.households.find(params[:household_id])
  end
end
