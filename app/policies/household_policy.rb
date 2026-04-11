class HouseholdPolicy < ApplicationPolicy
  # Authorization is enforced by the controller's set_household before_action:
  #   current_user.households.find(params[:household_id])
  # Any cross-household access raises RecordNotFound before reaching the action.
  # These methods return true only to satisfy Pundit's verify_authorized requirement.
  #
  # All household members intentionally share equal privileges — there is no
  # owner/admin role distinction. Any member can invite or remove other members.
  def show?           = true
  def create?         = true
  def update?         = true
  def settings?       = true
  def manage_members? = true
end
