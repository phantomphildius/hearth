# Household membership is verified upstream via set_household.
class ChildPolicy < ApplicationPolicy
  def create?  = true
  def update?  = true
  def destroy? = true
end
