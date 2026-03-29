# typed: strict

class AddHouseholdMember
  extend T::Sig

  sig { params(household: Household, email: String).returns(ServiceResult) }
  def self.call(household:, email:)
    new(household: household, email: email).call
  end

  sig { params(household: Household, email: String).void }
  def initialize(household:, email:)
    @household = household
    @email = email
  end

  sig { returns(ServiceResult) }
  def call
    user = User.find_by(email: @email)
    return ServiceResult.fail(errors: ["No user found with that email."]) if user.nil?

    member = @household.household_members.build(user: user)

    if member.save
      ServiceResult.ok(record: member)
    else
      ServiceResult.fail(errors: member.errors.full_messages)
    end
  end
end
