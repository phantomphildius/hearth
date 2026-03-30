# typed: strict

module HouseholdProps
  extend T::Sig
  extend ActiveSupport::Concern

  HouseholdPropShape = T.type_alias { { id: Integer, name: String } }
  UserPropShape = T.type_alias { { id: Integer, name: String, email: String, avatar_url: T.nilable(String) } }
  ChildPropShape = T.type_alias { { id: Integer, first_name: String, date_of_birth: T.nilable(String), age: Integer } }

  private

  sig { params(household: Household).returns(HouseholdPropShape) }
  def household_props(household)
    { id: household.id, name: household.name }
  end

  sig { params(user: User).returns(UserPropShape) }
  def user_props(user)
    { id: user.id, name: user.name, email: user.email, avatar_url: user.avatar_url }
  end

  sig { params(child: Child).returns(ChildPropShape) }
  def child_props(child)
    { id: child.id, first_name: child.first_name, date_of_birth: child.date_of_birth&.iso8601, age: child.age }
  end
end
