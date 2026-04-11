require "rails_helper"

RSpec.describe(ActivitySession, type: :model) do
  let(:activity) { create(:activity) }

  describe "validations" do
    it "is valid with required attributes" do
      expect(build(:activity_session, activity: activity)).to(be_valid)
    end

    it "requires scheduled_date" do
      expect(build(:activity_session, activity: activity, scheduled_date: nil)).not_to(be_valid)
    end

    it "enforces uniqueness of scheduled_date scoped to activity" do
      create(:activity_session, activity: activity, scheduled_date: Date.today)
      duplicate = build(:activity_session, activity: activity, scheduled_date: Date.today)
      expect(duplicate).not_to(be_valid)
      expect(duplicate.errors[:scheduled_date]).to(be_present)
    end

    it "allows same scheduled_date for different activities" do
      other_activity = create(:activity, household: activity.household)
      create(:activity_session, activity: activity, scheduled_date: Date.today)
      expect(build(:activity_session, activity: other_activity, scheduled_date: Date.today)).to(be_valid)
    end

    it "requires status to be confirmed or cancelled" do
      expect(build(:activity_session, activity: activity, status: "pending")).not_to(be_valid)
      expect(build(:activity_session, activity: activity, status: "confirmed")).to(be_valid)
      expect(build(:activity_session, activity: activity, status: "cancelled")).to(be_valid)
    end

    it "limits notes to 2000 characters" do
      expect(build(:activity_session, activity: activity, notes: "a" * 2001)).not_to(be_valid)
    end

    it "validates end_time after start_time when both are set on the session" do
      session = build(:activity_session, activity: activity, start_time: "10:00", end_time: "09:00")
      expect(session).not_to(be_valid)
      expect(session.errors[:end_time]).to(be_present)
    end

    it "skips time validation when session times are nil (inherits from activity)" do
      expect(build(:activity_session, activity: activity, start_time: nil, end_time: nil)).to(be_valid)
    end
  end

  describe "#resolved_start_time" do
    it "returns the session start_time when set" do
      session = create(:activity_session, activity: activity, start_time: "08:00")
      expect(session.resolved_start_time.strftime("%H:%M")).to(eq("08:00"))
    end

    it "falls back to the activity start_time when nil" do
      session = create(:activity_session, activity: activity, start_time: nil)
      expect(session.resolved_start_time).to(eq(activity.start_time))
    end
  end

  describe "#resolved_end_time" do
    it "returns the session end_time when set" do
      session = create(:activity_session, activity: activity, end_time: "11:00")
      expect(session.resolved_end_time.strftime("%H:%M")).to(eq("11:00"))
    end

    it "falls back to the activity end_time when nil" do
      session = create(:activity_session, activity: activity, end_time: nil)
      expect(session.resolved_end_time).to(eq(activity.end_time))
    end
  end
end
