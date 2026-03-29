# set_household already verifies membership via current_user.households,
# so any action reaching here is authorized for the authenticated member.
class HouseholdPolicy < ApplicationPolicy
  def show?           = true
  def create?         = true
  def update?         = true
  def settings?       = true
  def manage_members? = true
end
