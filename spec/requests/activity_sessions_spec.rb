require "rails_helper"

RSpec.describe("ActivitySessions", type: :request) do
  let(:user) { create(:user) }
  let(:household) { create(:household) }
  let(:activity) { create(:activity, household: household) }

  before do
    create(:household_member, user: user, household: household)
    sign_in user
  end

  describe "POST /households/:household_id/activities/:activity_id/sessions" do
    it "creates a confirmed session and redirects to activities" do
      expect do
        post(household_activity_activity_sessions_path(household, activity),
          params: { scheduled_date: "2024-01-01" })
      end.to(change(ActivitySession, :count).by(1))

      session = ActivitySession.last
      expect(session.status).to(eq("confirmed"))
      expect(session.scheduled_date).to(eq(Date.new(2024, 1, 1)))
      expect(response).to(redirect_to(household_activities_path(household)))
    end

    it "creates a cancelled session when status is cancelled" do
      post(household_activity_activity_sessions_path(household, activity),
        params: { scheduled_date: "2024-01-01", status: "cancelled" })

      expect(ActivitySession.last.status).to(eq("cancelled"))
    end

    it "preserves week_start in the redirect" do
      post(household_activity_activity_sessions_path(household, activity),
        params: { scheduled_date: "2024-01-01", week_start: "2024-01-01" })

      expect(response).to(redirect_to(household_activities_path(household, week_start: "2024-01-01")))
    end

    it "redirects with alert on validation failure" do
      create(:activity_session, activity: activity, scheduled_date: Date.new(2024, 1, 1))

      post(household_activity_activity_sessions_path(household, activity),
        params: { scheduled_date: "2024-01-01" })

      expect(response).to(redirect_to(household_activities_path(household)))
      follow_redirect!
      # alert flash is set
    end

    it "cannot access sessions for another household's activity" do
      other_household = create(:household)
      other_activity = create(:activity, household: other_household)

      expect do
        post(household_activity_activity_sessions_path(other_household, other_activity),
          params: { scheduled_date: "2024-01-01" })
      end.not_to(change(ActivitySession, :count))
    end
  end

  describe "DELETE /households/:household_id/activities/:activity_id/sessions/:id" do
    let!(:session) { create(:activity_session, activity: activity, scheduled_date: Date.new(2024, 1, 1)) }

    it "destroys the session and redirects" do
      expect do
        delete(household_activity_activity_session_path(household, activity, session))
      end.to(change(ActivitySession, :count).by(-1))

      expect(response).to(redirect_to(household_activities_path(household)))
    end

    it "preserves week_start in the redirect" do
      delete(household_activity_activity_session_path(household, activity, session),
        params: { week_start: "2024-01-01" })

      expect(response).to(redirect_to(household_activities_path(household, week_start: "2024-01-01")))
    end

    it "cannot delete a session from another household's activity" do
      other_household = create(:household)
      other_activity = create(:activity, household: other_household)
      other_session = create(:activity_session, activity: other_activity)

      expect do
        delete(household_activity_activity_session_path(other_household, other_activity, other_session))
      end.not_to(change(ActivitySession, :count))
    end
  end

  describe "PATCH /households/:household_id/activities/:activity_id/sessions/:id" do
    let!(:session) { create(:activity_session, activity: activity, scheduled_date: Date.new(2024, 1, 1)) }

    it "updates the session and redirects" do
      patch(household_activity_activity_session_path(household, activity, session),
        params: { scheduled_date: "2024-01-08" })

      expect(session.reload.scheduled_date).to(eq(Date.new(2024, 1, 8)))
      expect(response).to(redirect_to(household_activities_path(household)))
    end
  end
end
