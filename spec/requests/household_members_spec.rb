require "rails_helper"

RSpec.describe("HouseholdMembers", type: :request) do
  let(:user) { create(:user) }
  let(:household) { create(:household) }

  before do
    create(:household_member, user: user, household: household)
    sign_in user
  end

  describe "POST /households/:household_id/household_members" do
    it "adds an existing user to the household" do
      other_user = create(:user, email: "other@example.com")

      expect do
        post(household_household_members_path(household), params: { email: "other@example.com" })
      end.to(change(HouseholdMember, :count).by(1))

      expect(household.users.reload).to(include(other_user))
    end

    it "handles non-existent user email by creating a stub user and redirecting to settings" do
      post household_household_members_path(household), params: { email: "nobody@example.com" }
      expect(response).to(redirect_to(settings_household_path(household)))
    end

    it "prevents adding the same user twice" do
      other_user = create(:user, email: "other@example.com")
      create(:household_member, user: other_user, household: household)

      expect do
        post(household_household_members_path(household), params: { email: "other@example.com" })
      end.not_to(change(HouseholdMember, :count))
    end
  end

  describe "DELETE /households/:household_id/household_members/:id" do
    it "removes a member from the household" do
      other_user = create(:user)
      create(:household_member, user: other_user, household: household)

      expect do
        delete(household_household_member_path(household, other_user))
      end.to(change(HouseholdMember, :count).by(-1))
    end

    it "prevents removing the last member" do
      expect do
        delete(household_household_member_path(household, user))
      end.not_to(change(HouseholdMember, :count))

      expect(response).to(redirect_to(settings_household_path(household)))
    end
  end
end
