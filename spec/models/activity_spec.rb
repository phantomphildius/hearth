require "rails_helper"

RSpec.describe(Activity, type: :model) do
  describe "validations" do
    it "is valid with required attributes" do
      expect(build(:activity)).to(be_valid)
    end

    it "requires name" do
      expect(build(:activity, name: nil)).not_to(be_valid)
    end

    it "limits name to 255 characters" do
      expect(build(:activity, name: "a" * 256)).not_to(be_valid)
    end

    it "limits location_name to 255 characters" do
      expect(build(:activity, location_name: "a" * 256)).not_to(be_valid)
    end

    it "limits address to 500 characters" do
      expect(build(:activity, address: "a" * 501)).not_to(be_valid)
    end

    it "limits notes to 2000 characters" do
      expect(build(:activity, notes: "a" * 2001)).not_to(be_valid)
    end

    it "requires start_time" do
      expect(build(:activity, start_time: nil)).not_to(be_valid)
    end

    it "requires end_time" do
      expect(build(:activity, end_time: nil)).not_to(be_valid)
    end

    it "requires duration_minutes to be positive" do
      expect(build(:activity, duration_minutes: 0)).not_to(be_valid)
      expect(build(:activity, duration_minutes: -1)).not_to(be_valid)
    end

    it "limits duration_minutes to 1440" do
      expect(build(:activity, duration_minutes: 1441)).not_to(be_valid)
    end

    it "requires recurrence" do
      expect(build(:activity, recurrence: nil)).not_to(be_valid)
    end

    it "validates day_of_week is 0-6" do
      expect(build(:activity, day_of_week: 7)).not_to(be_valid)
      expect(build(:activity, day_of_week: -1)).not_to(be_valid)
      expect(build(:activity, day_of_week: 0)).to(be_valid)
      expect(build(:activity, day_of_week: 6)).to(be_valid)
    end

    it "validates latitude range" do
      expect(build(:activity, latitude: 91, longitude: 0)).not_to(be_valid)
      expect(build(:activity, latitude: -91, longitude: 0)).not_to(be_valid)
    end

    it "validates longitude range" do
      expect(build(:activity, latitude: 0, longitude: 181)).not_to(be_valid)
      expect(build(:activity, latitude: 0, longitude: -181)).not_to(be_valid)
    end
  end

  describe "custom validations" do
    it "requires day_of_week for recurring activities" do
      activity = build(:activity, recurrence: "weekly", day_of_week: nil)
      expect(activity).not_to(be_valid)
      expect(activity.errors[:day_of_week]).to(be_present)
    end

    it "does not require day_of_week for one-time activities" do
      activity = build(:activity, :one_time)
      expect(activity).to(be_valid)
    end

    it "requires starts_on for one-time activities" do
      activity = build(:activity, recurrence: "one_time", day_of_week: nil, starts_on: nil)
      expect(activity).not_to(be_valid)
      expect(activity.errors[:starts_on]).to(be_present)
    end

    it "requires end_time after start_time" do
      activity = build(:activity, start_time: "10:00", end_time: "09:00", duration_minutes: 60)
      expect(activity).not_to(be_valid)
      expect(activity.errors[:end_time]).to(be_present)
    end

    it "requires both latitude and longitude if either is present" do
      activity = build(:activity, latitude: 40.0, longitude: nil)
      expect(activity).not_to(be_valid)
      expect(activity.errors[:base]).to(be_present)
    end
  end

  describe "before_validation callbacks" do
    it "computes duration_minutes from start_time and end_time" do
      activity = build(:activity, start_time: "09:00", end_time: "10:30", duration_minutes: nil)
      activity.valid?
      expect(activity.duration_minutes).to(eq(90))
    end

    it "does not overwrite explicit duration_minutes" do
      activity = build(:activity, start_time: "09:00", end_time: "10:30", duration_minutes: 60)
      activity.valid?
      expect(activity.duration_minutes).to(eq(60))
    end
  end

  describe "#day_of_week_name" do
    it "returns the day name" do
      expect(build(:activity, day_of_week: 0).day_of_week_name).to(eq("Sunday"))
      expect(build(:activity, day_of_week: 1).day_of_week_name).to(eq("Monday"))
      expect(build(:activity, day_of_week: 6).day_of_week_name).to(eq("Saturday"))
    end

    it "returns nil when day_of_week is nil" do
      expect(build(:activity, :one_time).day_of_week_name).to(be_nil)
    end
  end

  describe "associations" do
    it "belongs to a household" do
      expect(create(:activity).household).to(be_a(Household))
    end

    it "has many children through activity_children" do
      activity = create(:activity)
      child = create(:child, household: activity.household)
      create(:activity_child, activity: activity, child: child)

      expect(activity.children).to(include(child))
    end

    it "destroys activity_children when destroyed" do
      activity = create(:activity)
      child = create(:child, household: activity.household)
      create(:activity_child, activity: activity, child: child)

      expect { activity.destroy }.to(change(ActivityChild, :count).by(-1))
    end
  end

  describe "enum" do
    it "defines recurrence values" do
      expect(described_class.recurrences).to(eq({
        "weekly" => "weekly",
        "biweekly" => "biweekly",
        "monthly" => "monthly",
        "one_time" => "one_time",
      }))
    end
  end
end
