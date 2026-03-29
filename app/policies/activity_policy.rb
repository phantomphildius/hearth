# Household membership is verified upstream via set_household.
class ActivityPolicy < ApplicationPolicy
  def index?   = true
  def show?    = true
  def create?  = true
  def update?  = true
  def destroy? = true
end
