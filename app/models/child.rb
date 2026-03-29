# typed: strict

class Child < ApplicationRecord
  extend T::Sig

  belongs_to :household
  has_many :activity_children, dependent: :destroy
  has_many :activities, through: :activity_children

  validates :first_name, presence: true
  validates :date_of_birth, presence: true

  sig { returns(Integer) }
  def age
    today = Time.zone.today
    years = today.year - date_of_birth.year
    years -= 1 if today < date_of_birth + years.years
    years
  end
end
