# typed: strict

class Child < ApplicationRecord
  extend T::Sig

  belongs_to :household
  has_many :activity_children, dependent: :destroy
  has_many :activities, through: :activity_children

  validates :first_name, presence: true, length: { maximum: 100 }
  validates :date_of_birth, presence: true

  validate :date_of_birth_not_in_future

  sig { returns(Integer) }
  def age
    today = Time.zone.today
    years = today.year - date_of_birth.year
    years -= 1 if today < date_of_birth + years.years
    years
  end

  private

  sig { void }
  def date_of_birth_not_in_future
    return unless date_of_birth.present?

    errors.add(:date_of_birth, "must be in the past") if date_of_birth > Date.today
  end
end
