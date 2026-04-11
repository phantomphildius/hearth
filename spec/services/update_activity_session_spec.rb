require "rails_helper"

RSpec.describe(UpdateActivitySession) do
  let(:activity) { create(:activity) }
  let(:session) { create(:activity_session, activity: activity, scheduled_date: Date.new(2024, 1, 1)) }

  def call(**overrides)
    described_class.call(session: session, scheduled_date: Date.new(2024, 1, 3), **overrides)
  end

  it "updates the scheduled_date" do
    result = call
    expect(result).to(be_success)
    expect(session.reload.scheduled_date).to(eq(Date.new(2024, 1, 3)))
  end

  it "updates start_time and end_time overrides" do
    result = call(start_time: "11:00", end_time: "12:00")
    expect(result).to(be_success)
    expect(session.reload.start_time.strftime("%H:%M")).to(eq("11:00"))
    expect(session.reload.end_time.strftime("%H:%M")).to(eq("12:00"))
  end

  it "clears time overrides when passed nil" do
    session.update!(start_time: "11:00", end_time: "12:00")
    result = call(start_time: nil, end_time: nil)
    expect(result).to(be_success)
    expect(session.reload.start_time).to(be_nil)
    expect(session.reload.end_time).to(be_nil)
  end

  it "returns failure when moving to a date already taken by another session" do
    create(:activity_session, activity: activity, scheduled_date: Date.new(2024, 1, 3))
    result = call
    expect(result).not_to(be_success)
    expect(result.errors).not_to(be_empty)
  end
end
