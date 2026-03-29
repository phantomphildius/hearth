# typed: strict

class HouseholdsController < ApplicationController
  extend T::Sig
  include HouseholdProps

  before_action :set_household, only: [:show, :update, :settings]

  sig { void }
  def show
    authorize @household
    render(inertia: "Households/Show", props: {
      household: household_props(@household),
      members: @household.users.map { |u| user_props(u) },
      children: @household.children.map { |c| child_props(c) },
    })
  end

  sig { void }
  def new
    authorize Household
    render(inertia: "Households/New", props: {
      errors: {},
    })
  end

  sig { void }
  def create
    authorize Household
    result = CreateHousehold.call(user: current_user, name: household_params[:name])

    if result.success?
      redirect_to(household_path(result.record), notice: "Household created.")
    else
      render(inertia: "Households/New", props: {
        errors: result.errors,
      })
    end
  end

  sig { void }
  def update
    authorize @household
    if @household.update(household_params)
      redirect_to(household_path(@household), notice: "Household updated.")
    else
      render(inertia: "Households/Show", props: {
        household: household_props(@household),
        members: @household.users.map { |u| user_props(u) },
        children: @household.children.map { |c| child_props(c) },
        errors: @household.errors.as_json,
      })
    end
  end

  sig { void }
  def settings
    authorize @household
    render(inertia: "Households/Settings", props: {
      household: household_props(@household),
      members: @household.users.map { |u| user_props(u) },
      children: @household.children.map { |c| child_props(c) },
    })
  end

  private

  sig { void }
  def set_household
    if params[:id] == "current"
      @household = current_user.households.first
      if @household.nil?
        redirect_to(new_household_path) and return
      end
    else
      @household = current_user.households.find(params[:id])
    end
  end

  sig { returns(ActionController::Parameters) }
  def household_params
    params.expect(household: [:name])
  end
end
