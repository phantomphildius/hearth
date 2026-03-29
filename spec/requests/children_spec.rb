require "rails_helper"

RSpec.describe("Children", type: :request) do
  let(:user) { create(:user) }
  let(:household) { create(:household) }

  before do
    create(:household_member, user: user, household: household)
    sign_in user
  end

  describe "POST /households/:household_id/children" do
    it "creates a child" do
      expect do
        post(household_children_path(household), params: {
          child: { first_name: "Emma", date_of_birth: "2018-06-15" },
        })
      end.to(change(Child, :count).by(1))

      child = Child.last
      expect(child.first_name).to(eq("Emma"))
      expect(child.household).to(eq(household))
    end

    it "handles validation errors" do
      expect do
        post(household_children_path(household), params: {
          child: { first_name: "", date_of_birth: "" },
        })
      end.not_to(change(Child, :count))
    end
  end

  describe "PATCH /households/:household_id/children/:id" do
    it "updates a child" do
      child = create(:child, household: household, first_name: "Old Name")

      patch household_child_path(household, child), params: {
        child: { first_name: "New Name", date_of_birth: child.date_of_birth },
      }

      expect(child.reload.first_name).to(eq("New Name"))
    end
  end

  describe "DELETE /households/:household_id/children/:id" do
    it "removes a child" do
      child = create(:child, household: household)

      expect do
        delete(household_child_path(household, child))
      end.to(change(Child, :count).by(-1))
    end
  end
end
