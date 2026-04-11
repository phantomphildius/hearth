# typed: strict

class Activity < ApplicationRecord
  extend T::Sig

  ActivityDefaultsShape = T.type_alias {
    {
      name: String, day_of_week: T.nilable(Integer), start_time: String,
      end_time: String, duration_minutes: T.nilable(Integer), recurrence: String,
      starts_on: String, notes: String, child_ids: T::Array[Integer]
    }
  }

  belongs_to :household
  has_many :activity_children, dependent: :destroy
  has_many :children, through: :activity_children
  has_many :activity_sessions, dependent: :destroy

  enum :recurrence, { weekly: "weekly", biweekly: "biweekly", monthly: "monthly", one_time: "one_time" }

  # IMPORTANT: Always scope activity queries through `.active` to exclude archived records.
  # There is no default scope by design (preserves access for future admin/reporting views).
  # Any call to `@household.activities` without `.active` will include archived activities.
  scope :active, -> { where(archived_at: nil) }

  validates :name, presence: true, length: { maximum: 255 }
  validates :start_time, presence: true
  validates :end_time, presence: true
  validates :duration_minutes, presence: true, numericality: { only_integer: true, greater_than: 0, less_than_or_equal_to: 1440 }
  validates :recurrence, presence: true
  validates :notes, length: { maximum: 2000 }, allow_blank: true
  validates :day_of_week, inclusion: { in: 0..6 }, allow_nil: true
  validates :biweekly_anchor_date, presence: true, if: -> { biweekly? }

  validate :day_of_week_required_for_recurring
  validate :starts_on_required_for_one_time
  validate :starts_on_required_for_monthly
  validate :end_time_after_start_time

  before_validation :compute_duration_minutes
  before_validation :compute_day_of_week_for_monthly

  sig { returns(ActivityDefaultsShape) }
  def self.defaults
    {
      name: "",
      day_of_week: nil,
      start_time: "",
      end_time: "",
      duration_minutes: nil,
      recurrence: "weekly",
      starts_on: "",
      notes: "",
      child_ids: [],
    }
  end

  sig { returns(T.nilable(String)) }
  def day_of_week_name
    return if day_of_week.nil?

    Date::DAYNAMES[day_of_week]
  end

  sig { params(from_date: Date, to_date: Date).returns(T::Array[Date]) }
  def occurrences_between(from_date, to_date)
    case recurrence
    when "one_time"
      return [] if starts_on.nil?

      starts_on.between?(from_date, to_date) ? [starts_on] : []
    when "weekly"
      dates_in_range(from_date, to_date)
    when "biweekly"
      return [] if biweekly_anchor_date.nil?

      dates_in_range(from_date, to_date).select do |date|
        ((date - biweekly_anchor_date).to_i / 7).even?
      end
    when "monthly"
      return [] if starts_on.nil? || day_of_week.nil?

      ordinal = ((starts_on.day - 1) / 7) + 1
      months_between(from_date, to_date).filter_map do |year, month|
        nth_weekday_of_month(year, month, day_of_week, ordinal)
      end.select { |d| d.between?(from_date, to_date) }
    else
      []
    end
  end

  private

  sig { void }
  def compute_duration_minutes
    if start_time.present? && end_time.present? && duration_minutes.blank?
      self.duration_minutes = ((end_time - start_time) / 60).to_i
    end
  end

  sig { void }
  def compute_day_of_week_for_monthly
    return unless monthly? && starts_on.present?

    self.day_of_week = starts_on.wday
  end

  sig { void }
  def day_of_week_required_for_recurring
    if recurrence.present? && !one_time? && !monthly? && day_of_week.nil?
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
  def starts_on_required_for_monthly
    if monthly? && starts_on.blank?
      errors.add(:starts_on, "is required for monthly activities")
    end
  end

  sig { void }
  def end_time_after_start_time
    if start_time.present? && end_time.present? && end_time <= start_time
      errors.add(:end_time, "must be after start time")
    end
  end

  sig { params(from_date: Date, to_date: Date).returns(T::Array[Date]) }
  def dates_in_range(from_date, to_date)
    return [] if day_of_week.nil?

    (from_date..to_date).select { |date| date.wday == day_of_week }
  end

  sig { params(from_date: Date, to_date: Date).returns(T::Array[[Integer, Integer]]) }
  def months_between(from_date, to_date)
    result = T.let([], T::Array[[Integer, Integer]])
    current = Date.new(from_date.year, from_date.month, 1)
    last = Date.new(to_date.year, to_date.month, 1)
    while current <= last
      result << [current.year, current.month]
      current = current >> 1
    end
    result
  end

  sig { params(year: Integer, month: Integer, wday: Integer, n: Integer).returns(T.nilable(Date)) }
  def nth_weekday_of_month(year, month, wday, n)
    first = Date.new(year, month, 1)
    first_occurrence = first + ((wday - first.wday + 7) % 7)
    candidate = first_occurrence + ((n - 1) * 7)
    candidate.month == month ? candidate : nil
  end

end
