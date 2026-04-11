require "rails_helper"

RSpec.describe(CreateActivitySession) do
  let(:activity) { create(:activity) }
  let(:date) { Date.new(2024, 1, 1) }

  def call(**overrides)
    described_class.call(activity: activity, scheduled_date: date, **overrides)
  end

  it "creates a confirmed session with default status" do
    result = call
    expect(result).to(be_success)
    expect(result.record).to(be_a(ActivitySession))
    expect(result.record.status).to(eq("confirmed"))
    expect(result.record.scheduled_date).to(eq(date))
  end

  it "creates a cancelled session when status is cancelled" do
    result = call(status: "cancelled")
    expect(result).to(be_success)
    expect(result.record.status).to(eq("cancelled"))
  end

  it "persists optional start_time and end_time overrides" do
    result = call(start_time: "10:00", end_time: "11:00")
    expect(result.record.start_time.strftime("%H:%M")).to(eq("10:00"))
    expect(result.record.end_time.strftime("%H:%M")).to(eq("11:00"))
  end

  it "persists optional notes" do
    result = call(notes: "Great session")
    expect(result.record.notes).to(eq("Great session"))
  end

  it "returns failure when scheduled_date is already taken for this activity" do
    create(:activity_session, activity: activity, scheduled_date: date)
    result = call
    expect(result).not_to(be_success)
    expect(result.errors).not_to(be_empty)
  end

  it "allows the same date for a different activity" do
    other = create(:activity, household: activity.household)
    create(:activity_session, activity: other, scheduled_date: date)
    expect(call).to(be_success)
  end

  it "returns failure for an invalid status" do
    result = call(status: "pending")
    expect(result).not_to(be_success)
  end
end
