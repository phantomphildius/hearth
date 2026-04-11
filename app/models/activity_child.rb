# typed: strict

class ActivityChild < ApplicationRecord
  extend T::Sig

  belongs_to :activity
  belongs_to :child

  validates :child_id, uniqueness: { scope: :activity_id, message: "is already enrolled in this activity" }
  validate :child_belongs_to_activity_household

  private

  sig { void }
  def child_belongs_to_activity_household
    return unless child && activity

    unless child.household_id == activity.household_id
      errors.add(:child, "does not belong to this household")
    end
  end
end
