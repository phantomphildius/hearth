# typed: strict

class ActivitySession < ApplicationRecord
  extend T::Sig

  belongs_to :activity

  STATUSES = T.let(%w[confirmed cancelled], T::Array[String])

  validates :scheduled_date, presence: true, uniqueness: { scope: :activity_id }
  validates :status, inclusion: { in: STATUSES }
  validates :notes, length: { maximum: 2000 }, allow_blank: true
  validate :end_time_after_start_time, if: -> { start_time.present? && end_time.present? }

  sig { returns(T.nilable(ActiveSupport::TimeWithZone)) }
  def resolved_start_time
    start_time || activity.start_time
  end

  sig { returns(T.nilable(ActiveSupport::TimeWithZone)) }
  def resolved_end_time
    end_time || activity.end_time
  end

  private

  sig { void }
  def end_time_after_start_time
    if end_time <= start_time
      errors.add(:end_time, "must be after start time")
    end
  end
end
