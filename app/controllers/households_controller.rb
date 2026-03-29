# typed: strict

class HouseholdsController < ApplicationController
  extend T::Sig

  before_action :set_household, only: [:show, :update, :settings]

  sig { void }
  def show
    render(inertia: "Households/Show", props: {
      household: household_props(@household),
      members: @household.users.map { |u| user_props(u) },
      children: @household.children.map { |c| child_props(c) },
    })
  end

  sig { void }
  def new
    render(inertia: "Households/New", props: {
      errors: {},
    })
  end

  sig { void }
  def create
    @household = Household.new(household_params)

    if @household.save
      @household.household_members.create!(user: current_user)
      redirect_to(household_path(@household), notice: "Household created.")
    else
      render(inertia: "Households/New", props: {
        errors: @household.errors.as_json,
      })
    end
  end

  sig { void }
  def update
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

  sig { params(household: Household).returns(T::Hash[Symbol, T.untyped]) }
  def household_props(household)
    { id: household.id, name: household.name }
  end

  sig { params(user: User).returns(T::Hash[Symbol, T.untyped]) }
  def user_props(user)
    { id: user.id, name: user.name, email: user.email, avatar_url: user.avatar_url }
  end

  sig { params(child: Child).returns(T::Hash[Symbol, T.untyped]) }
  def child_props(child)
    { id: child.id, first_name: child.first_name, date_of_birth: child.date_of_birth, age: child.age }
  end
end
