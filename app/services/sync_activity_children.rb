# typed: strict

class SyncActivityChildren
  extend T::Sig

  sig { params(activity: Activity, child_ids: T::Array[Integer], household: Household).void }
  def self.call(activity:, child_ids:, household:)
    new(activity: activity, child_ids: child_ids, household: household).call
  end

  sig { params(activity: Activity, child_ids: T::Array[Integer], household: Household).void }
  def initialize(activity:, child_ids:, household:)
    @activity = activity
    @child_ids = child_ids
    @household = household
  end

  sig { void }
  def call
    return if @child_ids.blank?

    @activity.children = @household.children.where(id: @child_ids)
  end
end
