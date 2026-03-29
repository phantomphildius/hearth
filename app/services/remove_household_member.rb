# typed: strict

class RemoveHouseholdMember
  extend T::Sig

  sig { params(household: Household, user_id: Integer).returns(ServiceResult) }
  def self.call(household:, user_id:)
    new(household: household, user_id: user_id).call
  end

  sig { params(household: Household, user_id: Integer).void }
  def initialize(household:, user_id:)
    @household = household
    @user_id = user_id
  end

  sig { returns(ServiceResult) }
  def call
    if HouseholdMember.last_in?(@household)
      return ServiceResult.fail(errors: ["Cannot remove the last member of a household."])
    end

    member = @household.household_members.find_by(user_id: @user_id)
    return ServiceResult.fail(errors: ["Member not found."]) if member.nil?

    if member.destroy
      ServiceResult.ok
    else
      ServiceResult.fail(errors: ["Could not remove member."])
    end
  end
end
