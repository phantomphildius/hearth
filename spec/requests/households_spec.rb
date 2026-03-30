require "rails_helper"

RSpec.describe("Households", type: :request) do
  let(:user) { create(:user) }
  let(:household) { create(:household) }

  before do
    create(:household_member, user: user, household: household)
    sign_in user
  end

  describe "GET /households/:id" do
    it "renders the household show page" do
      get household_path(household)
      expect(response).to(have_http_status(:ok))
    end

    it "resolves 'current' to the user's first household" do
      get root_path
      expect(response).to(have_http_status(:ok))
    end

    it "redirects to new household if user has no households" do
      other_user = create(:user)
      sign_in other_user

      get root_path
      expect(response).to(redirect_to(new_household_path))
    end

    it "redirects to root for households the user doesn't belong to" do
      other_household = create(:household)

      get household_path(other_household)
      expect(response).to(redirect_to(root_path))
    end
  end

  describe "GET /households/new" do
    it "renders the new household page" do
      get new_household_path
      expect(response).to(have_http_status(:ok))
    end
  end

  describe "POST /households" do
    it "creates a household and adds the user as a member" do
      expect do
        post(households_path, params: { household: { name: "New Household" } })
      end.to(change(Household, :count).by(1)
        .and(change(HouseholdMember, :count).by(1)))

      new_household = Household.last
      expect(new_household.name).to(eq("New Household"))
      expect(new_household.users).to(include(user))
      expect(response).to(redirect_to(household_path(new_household)))
    end

    it "re-renders on validation failure" do
      post households_path, params: { household: { name: "" } }
      expect(response).to(have_http_status(:ok)) # Inertia re-renders
    end
  end

  describe "PATCH /households/:id" do
    it "updates the household name" do
      patch household_path(household), params: { household: { name: "Updated Name" } }

      expect(household.reload.name).to(eq("Updated Name"))
      expect(response).to(redirect_to(household_path(household)))
    end
  end

  describe "GET /households/:id/settings" do
    it "renders the settings page" do
      get settings_household_path(household)
      expect(response).to(have_http_status(:ok))
    end
  end
end
