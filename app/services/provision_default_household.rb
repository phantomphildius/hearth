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

    household = Household.create!(name: "#{@user.name}'s Household")
    household.household_members.create!(user: @user)
  end
end
