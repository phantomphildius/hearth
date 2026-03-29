require "rails_helper"

RSpec.describe("Activities", type: :request) do
  let(:user) { create(:user) }
  let(:household) { create(:household) }
  let!(:child) { create(:child, household: household) }

  before do
    create(:household_member, user: user, household: household)
    sign_in user
  end

  describe "GET /households/:household_id/activities" do
    it "renders the activities index" do
      create(:activity, household: household)
      get household_activities_path(household)
      expect(response).to(have_http_status(:ok))
    end
  end

  describe "GET /households/:household_id/activities/new" do
    it "renders the new activity form" do
      get new_household_activity_path(household)
      expect(response).to(have_http_status(:ok))
    end
  end

  describe "POST /households/:household_id/activities" do
    let(:valid_params) do
      {
        activity: {
          name: "Soccer Practice",
          day_of_week: 1,
          start_time: "09:00",
          end_time: "10:00",
          duration_minutes: 60,
          recurrence: "weekly",
          child_ids: [child.id],
        },
      }
    end

    it "creates an activity" do
      expect do
        post(household_activities_path(household), params: valid_params)
      end.to(change(Activity, :count).by(1))

      activity = Activity.last
      expect(activity.name).to(eq("Soccer Practice"))
      expect(activity.household).to(eq(household))
    end

    it "enrolls children in the activity" do
      post household_activities_path(household), params: valid_params

      activity = Activity.last
      expect(activity.children).to(include(child))
    end

    it "prevents enrolling children from other households" do
      other_household = create(:household)
      other_child = create(:child, household: other_household)

      post household_activities_path(household), params: {
        activity: valid_params[:activity].merge(child_ids: [other_child.id]),
      }

      activity = Activity.last
      expect(activity.children).not_to(include(other_child))
    end

    it "handles validation errors" do
      expect do
        post(household_activities_path(household), params: {
          activity: { name: "", start_time: "", end_time: "", duration_minutes: 0, recurrence: "weekly" },
        })
      end.not_to(change(Activity, :count))
    end
  end

  describe "GET /households/:household_id/activities/:id" do
    it "renders the activity show page" do
      activity = create(:activity, household: household)
      get household_activity_path(household, activity)
      expect(response).to(have_http_status(:ok))
    end
  end

  describe "GET /households/:household_id/activities/:id/edit" do
    it "renders the edit form" do
      activity = create(:activity, household: household)
      get edit_household_activity_path(household, activity)
      expect(response).to(have_http_status(:ok))
    end
  end

  describe "PATCH /households/:household_id/activities/:id" do
    it "updates an activity" do
      activity = create(:activity, household: household, name: "Old Name")

      patch household_activity_path(household, activity), params: {
        activity: { name: "New Name" },
      }

      expect(activity.reload.name).to(eq("New Name"))
    end
  end

  describe "DELETE /households/:household_id/activities/:id" do
    it "deletes an activity" do
      activity = create(:activity, household: household)

      expect do
        delete(household_activity_path(household, activity))
      end.to(change(Activity, :count).by(-1))

      expect(response).to(redirect_to(household_activities_path(household)))
    end
  end

  describe "authorization" do
    it "prevents access to activities in other households" do
      other_household = create(:household)
      other_activity = create(:activity, household: other_household)

      get household_activity_path(other_household, other_activity)
      expect(response).to(have_http_status(:not_found))
    end
  end
end
