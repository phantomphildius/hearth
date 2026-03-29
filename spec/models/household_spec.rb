require "rails_helper"

RSpec.describe(Household, type: :model) do
  describe "validations" do
    it "is valid with a name" do
      expect(build(:household)).to(be_valid)
    end

    it "requires a name" do
      household = build(:household, name: nil)
      expect(household).not_to(be_valid)
    end
  end

  describe "associations" do
    let(:household) { create(:household) }

    it "has many users through household_members" do
      user = create(:user)
      create(:household_member, household: household, user: user)

      expect(household.users).to(include(user))
    end

    it "has many children" do
      child = create(:child, household: household)
      expect(household.children).to(include(child))
    end

    it "has many activities" do
      activity = create(:activity, household: household)
      expect(household.activities).to(include(activity))
    end

    it "destroys children when destroyed" do
      create(:child, household: household)
      expect { household.destroy }.to(change(Child, :count).by(-1))
    end

    it "destroys activities when destroyed" do
      create(:activity, household: household)
      expect { household.destroy }.to(change(Activity, :count).by(-1))
    end

    it "destroys household_members when destroyed" do
      create(:household_member, household: household)
      expect { household.destroy }.to(change(HouseholdMember, :count).by(-1))
    end
  end
end
