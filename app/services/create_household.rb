# typed: strict

class CreateHousehold
  extend T::Sig

  sig { params(user: User, name: String).returns(ServiceResult) }
  def self.call(user:, name:)
    new(user: user, name: name).call
  end

  sig { params(user: User, name: String).void }
  def initialize(user:, name:)
    @user = user
    @name = name
  end

  sig { returns(ServiceResult) }
  def call
    household = Household.new(name: @name)

    unless household.valid?
      return ServiceResult.fail(errors: household.errors.full_messages)
    end

    Household.transaction do
      household.save!
      household.household_members.create!(user: @user)
    end

    ServiceResult.ok(record: household)
  rescue ActiveRecord::RecordInvalid => e
    ServiceResult.fail(errors: [e.message])
  end
end
