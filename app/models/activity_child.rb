# typed: strict

class ActivityChild < ApplicationRecord
  extend T::Sig

  belongs_to :activity
  belongs_to :child

  validates :child_id, uniqueness: { scope: :activity_id, message: "is already enrolled in this activity" }
end
