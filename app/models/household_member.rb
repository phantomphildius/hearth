# typed: strict

class HouseholdMember < ApplicationRecord
  extend T::Sig

  belongs_to :household
  belongs_to :user

  validates :user_id, uniqueness: { scope: :household_id }

  sig { params(household: Household).returns(T::Boolean) }
  def self.last_in?(household)
    household.household_members.count <= 1
  end
end
