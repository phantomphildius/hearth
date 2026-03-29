# typed: strict

module HouseholdProps
  extend T::Sig
  extend ActiveSupport::Concern

  private

  sig { params(household: Household).returns(T::Hash[Symbol, T.untyped]) }
  def household_props(household)
    { id: household.id, name: household.name }
  end

  sig { params(user: User).returns(T::Hash[Symbol, T.untyped]) }
  def user_props(user)
    { id: user.id, name: user.name, email: user.email, avatar_url: user.avatar_url }
  end

  sig { params(child: Child).returns(T::Hash[Symbol, T.untyped]) }
  def child_props(child)
    { id: child.id, first_name: child.first_name, date_of_birth: child.date_of_birth, age: child.age }
  end
end
