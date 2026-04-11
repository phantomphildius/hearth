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
    user_result = find_or_create_user
    return user_result unless user_result.success?

    user = T.cast(user_result.record, User)
    member = @household.household_members.build(user: user)

    if member.save
      InvitationMailer.invite(user, @household).deliver_later
      ServiceResult.ok(record: member)
    else
      ServiceResult.fail(errors: member.errors.full_messages)
    end
  end

  private

  sig { returns(ServiceResult) }
  def find_or_create_user
    user = User.find_by(email: @email)
    return ServiceResult.ok(record: user) if user

    stub = User.new(email: @email)
    if stub.save
      ServiceResult.ok(record: stub)
    else
      ServiceResult.fail(errors: stub.errors.full_messages)
    end
  end
end
