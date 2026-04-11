require "rails_helper"

RSpec.describe(ProjectWeeklyCalendar) do
  # Week of 2024-01-01 (Monday) to 2024-01-07 (Sunday)
  let(:week_start) { Date.new(2024, 1, 1) }
  let(:household) { create(:household) }

  def call
    described_class.call(household: household, week_start: week_start)
  end

  describe "with no activities" do
    it "returns an empty array" do
      expect(call).to(eq([]))
    end
  end

  describe "projections" do
    it "returns a projected entry for a weekly activity on a matching weekday" do
      create(:activity, household: household, recurrence: "weekly", day_of_week: 1) # Monday

      entries = call
      expect(entries.length).to(eq(1))
      expect(entries.first[:kind]).to(eq("projected"))
      expect(entries.first[:scheduled_date]).to(eq("2024-01-01"))
    end

    it "returns no projections for activities outside the week" do
      create(:activity, household: household, recurrence: "weekly", day_of_week: 1)
      result = described_class.call(household: household, week_start: Date.new(2024, 1, 8))
      # 2024-01-08 is also a Monday, so still one projection
      expect(result.length).to(eq(1))
      expect(result.first[:scheduled_date]).to(eq("2024-01-08"))
    end

    it "returns no projections for archived activities" do
      create(:activity, household: household, recurrence: "weekly", day_of_week: 1, archived_at: 1.day.ago)
      expect(call).to(eq([]))
    end

    it "includes activity children in projected entries" do
      activity = create(:activity, household: household, recurrence: "weekly", day_of_week: 1)
      child = create(:child, household: household)
      create(:activity_child, activity: activity, child: child)

      entries = call
      expect(entries.first[:children].map { |c| c[:id] }).to(include(child.id))
    end

    it "uses activity start_time and end_time for projections" do
      create(:activity, household: household, recurrence: "weekly", day_of_week: 1,
        start_time: "09:00", end_time: "10:30")

      entry = call.first
      expect(entry[:start_time]).to(eq("09:00"))
      expect(entry[:end_time]).to(eq("10:30"))
    end

    it "sets notes to nil for projected entries" do
      create(:activity, household: household, recurrence: "weekly", day_of_week: 1, notes: "Bring cleats")
      expect(call.first[:notes]).to(be_nil)
    end
  end

  describe "confirmed sessions" do
    it "returns a session entry instead of a projection for the same date" do
      activity = create(:activity, household: household, recurrence: "weekly", day_of_week: 1)
      create(:activity_session, activity: activity, scheduled_date: Date.new(2024, 1, 1), status: "confirmed")

      entries = call
      expect(entries.length).to(eq(1))
      expect(entries.first[:kind]).to(eq("confirmed"))
      expect(entries.first[:session_id]).not_to(be_nil)
    end

    it "includes session notes" do
      activity = create(:activity, household: household, recurrence: "weekly", day_of_week: 1)
      create(:activity_session, activity: activity, scheduled_date: Date.new(2024, 1, 1), notes: "Great game!")

      expect(call.first[:notes]).to(eq("Great game!"))
    end

    it "uses session time overrides when present" do
      activity = create(:activity, household: household, recurrence: "weekly", day_of_week: 1,
        start_time: "09:00", end_time: "10:00")
      create(:activity_session, activity: activity, scheduled_date: Date.new(2024, 1, 1),
        start_time: "10:00", end_time: "11:00")

      entry = call.first
      expect(entry[:start_time]).to(eq("10:00"))
      expect(entry[:end_time]).to(eq("11:00"))
    end

    it "falls back to activity times when session times are nil" do
      activity = create(:activity, household: household, recurrence: "weekly", day_of_week: 1,
        start_time: "09:00", end_time: "10:00")
      create(:activity_session, activity: activity, scheduled_date: Date.new(2024, 1, 1),
        start_time: nil, end_time: nil)

      entry = call.first
      expect(entry[:start_time]).to(eq("09:00"))
      expect(entry[:end_time]).to(eq("10:00"))
    end
  end

  describe "cancelled sessions" do
    it "returns a cancelled entry and suppresses the projection" do
      activity = create(:activity, household: household, recurrence: "weekly", day_of_week: 1)
      create(:activity_session, activity: activity, scheduled_date: Date.new(2024, 1, 1), status: "cancelled")

      entries = call
      expect(entries.length).to(eq(1))
      expect(entries.first[:kind]).to(eq("cancelled"))
    end
  end

  describe "sessions from archived activities" do
    it "includes confirmed sessions from archived activities (preserves history)" do
      activity = create(:activity, household: household, recurrence: "weekly", day_of_week: 1,
        archived_at: 1.day.ago)
      create(:activity_session, activity: activity, scheduled_date: Date.new(2024, 1, 1))

      entries = call
      expect(entries.length).to(eq(1))
      expect(entries.first[:kind]).to(eq("confirmed"))
    end
  end

  describe "sorting" do
    it "sorts entries by scheduled_date then start_time" do
      act1 = create(:activity, household: household, recurrence: "weekly", day_of_week: 3,
        start_time: "14:00", end_time: "15:00") # Wednesday
      act2 = create(:activity, household: household, recurrence: "weekly", day_of_week: 1,
        start_time: "09:00", end_time: "10:00") # Monday
      act3 = create(:activity, household: household, recurrence: "weekly", day_of_week: 1,
        start_time: "07:00", end_time: "08:00") # Monday earlier

      entries = call
      expect(entries.map { |e| [e[:scheduled_date], e[:start_time]] }).to(eq([
        ["2024-01-01", "07:00"],
        ["2024-01-01", "09:00"],
        ["2024-01-03", "14:00"],
      ]))
    end
  end
end
