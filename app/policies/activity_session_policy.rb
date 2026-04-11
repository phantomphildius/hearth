class ActivitySessionPolicy < ApplicationPolicy
  # Authorization is enforced by the controller's before_action chain:
  #   set_household → current_user.households.find(...)
  #   set_activity  → @household.activities.find(...)
  #   set_session   → @activity.activity_sessions.find(...)
  # Any cross-household access raises RecordNotFound before reaching the action.
  # These methods return true only to satisfy Pundit's verify_authorized requirement.
  def create?  = true
  def update?  = true
  def destroy? = true
end
