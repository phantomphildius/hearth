require "rails_helper"

RSpec.describe(HouseholdMember, type: :model) do
  describe "validations" do
    it "is valid with a household and user" do
      expect(build(:household_member)).to(be_valid)
    end

    it "prevents duplicate membership" do
      user = create(:user)
      household = create(:household)
      create(:household_member, user: user, household: household)

      duplicate = build(:household_member, user: user, household: household)
      expect(duplicate).not_to(be_valid)
    end
  end

  describe "associations" do
    it "belongs to a household" do
      member = create(:household_member)
      expect(member.household).to(be_a(Household))
    end

    it "belongs to a user" do
      member = create(:household_member)
      expect(member.user).to(be_a(User))
    end
  end
end
