# typed: strict

class Activity < ApplicationRecord
  extend T::Sig

  belongs_to :household
  has_many :activity_children, dependent: :destroy
  has_many :children, through: :activity_children

  enum :recurrence, { weekly: "weekly", biweekly: "biweekly", monthly: "monthly", one_time: "one_time" }

  validates :name, presence: true, length: { maximum: 255 }
  validates :location_name, length: { maximum: 255 }, allow_blank: true
  validates :address, length: { maximum: 500 }, allow_blank: true
  validates :start_time, presence: true
  validates :end_time, presence: true
  validates :duration_minutes, presence: true, numericality: { only_integer: true, greater_than: 0, less_than_or_equal_to: 1440 }
  validates :recurrence, presence: true
  validates :notes, length: { maximum: 2000 }, allow_blank: true
  validates :day_of_week, inclusion: { in: 0..6 }, allow_nil: true
  validates :latitude, numericality: { greater_than_or_equal_to: -90, less_than_or_equal_to: 90 }, allow_nil: true
  validates :longitude, numericality: { greater_than_or_equal_to: -180, less_than_or_equal_to: 180 }, allow_nil: true

  validate :day_of_week_required_for_recurring
  validate :starts_on_required_for_one_time
  validate :end_time_after_start_time
  validate :latitude_longitude_pairing

  before_validation :compute_duration_minutes

  sig { returns(T.nilable(String)) }
  def day_of_week_name
    return if day_of_week.nil?

    Date::DAYNAMES[day_of_week]
  end

  private

  sig { void }
  def compute_duration_minutes
    if start_time.present? && end_time.present? && duration_minutes.blank?
      self.duration_minutes = ((end_time - start_time) / 60).to_i
    end
  end

  sig { void }
  def day_of_week_required_for_recurring
    if recurrence.present? && recurrence != "one_time" && day_of_week.nil?
      errors.add(:day_of_week, "is required for recurring activities")
    end
  end

  sig { void }
  def starts_on_required_for_one_time
    if recurrence == "one_time" && starts_on.blank?
      errors.add(:starts_on, "is required for one-time activities")
    end
  end

  sig { void }
  def end_time_after_start_time
    if start_time.present? && end_time.present? && end_time <= start_time
      errors.add(:end_time, "must be after start time")
    end
  end

  sig { void }
  def latitude_longitude_pairing
    if latitude.present? != longitude.present?
      errors.add(:base, "Both latitude and longitude must be provided together")
    end
  end
end
