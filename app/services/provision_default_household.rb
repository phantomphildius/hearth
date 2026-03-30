# typed: strict

class ProvisionDefaultHousehold
  extend T::Sig

  sig { params(user: User).void }
  def self.call(user:)
    new(user: user).call
  end

  sig { params(user: User).void }
  def initialize(user:)
    @user = user
  end

  sig { void }
  def call
    return if @user.households.any?

    Household.transaction do
      household = Household.create!(name: "#{@user.name}'s Household")
      household.household_members.create!(user: @user)
    end
  rescue ActiveRecord::RecordInvalid
    # Non-fatal: user can create a household after sign-in
  end
end
