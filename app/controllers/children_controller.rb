# typed: strict

class ChildrenController < ApplicationController
  extend T::Sig

  before_action :set_household

  sig { void }
  def create
    child = @household.children.build(child_params)
    authorize child

    if child.save
      redirect_to(household_path(@household), notice: "#{child.first_name} added.")
    else
      redirect_to(household_path(@household), alert: child.errors.full_messages.join(", "))
    end
  end

  sig { void }
  def update
    child = @household.children.find(params[:id])
    authorize child

    if child.update(child_params)
      redirect_to(household_path(@household), notice: "Updated.")
    else
      redirect_to(household_path(@household), alert: child.errors.full_messages.join(", "))
    end
  end

  sig { void }
  def destroy
    child = @household.children.find(params[:id])
    authorize child
    child.destroy
    redirect_to(household_path(@household), notice: "#{child.first_name} removed.")
  end

  private

  sig { void }
  def set_household
    @household = current_user.households.find(params[:household_id])
  end

  sig { returns(ActionController::Parameters) }
  def child_params
    params.expect(child: [:first_name, :date_of_birth])
  end
end
