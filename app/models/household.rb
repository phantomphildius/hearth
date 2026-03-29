# typed: strict

class Household < ApplicationRecord
  extend T::Sig

  has_many :household_members, dependent: :destroy
  has_many :users, through: :household_members
  has_many :children, dependent: :destroy
  has_many :activities, dependent: :destroy

  validates :name, presence: true
end
