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

  describe "#occurrences_between" do
    # Week of 2024-01-01 (Monday) through 2024-01-07 (Sunday)
    let(:week_start) { Date.new(2024, 1, 1) }
    let(:week_end) { Date.new(2024, 1, 7) }

    describe "weekly recurrence" do
      it "returns the matching weekday within the range" do
        activity = build(:activity, recurrence: "weekly", day_of_week: 1) # Monday
        expect(activity.occurrences_between(week_start, week_end)).to(eq([Date.new(2024, 1, 1)]))
      end

      it "returns Wednesday when day_of_week is 3" do
        activity = build(:activity, recurrence: "weekly", day_of_week: 3)
        expect(activity.occurrences_between(week_start, week_end)).to(eq([Date.new(2024, 1, 3)]))
      end

      it "returns Sunday (day 0) correctly" do
        activity = build(:activity, recurrence: "weekly", day_of_week: 0)
        expect(activity.occurrences_between(week_start, week_end)).to(eq([Date.new(2024, 1, 7)]))
      end

      it "returns empty when no matching day in range" do
        activity = build(:activity, recurrence: "weekly", day_of_week: 1)
        # A single-day range that is a Tuesday
        expect(activity.occurrences_between(Date.new(2024, 1, 2), Date.new(2024, 1, 2))).to(eq([]))
      end

      it "returns multiple occurrences across a two-week range" do
        activity = build(:activity, recurrence: "weekly", day_of_week: 1)
        dates = activity.occurrences_between(Date.new(2024, 1, 1), Date.new(2024, 1, 15))
        expect(dates).to(eq([Date.new(2024, 1, 1), Date.new(2024, 1, 8), Date.new(2024, 1, 15)]))
      end
    end

    describe "biweekly recurrence" do
      let(:anchor) { Date.new(2024, 1, 1) } # Monday

      it "includes the anchor week" do
        activity = build(:activity, recurrence: "biweekly", day_of_week: 1, biweekly_anchor_date: anchor)
        expect(activity.occurrences_between(week_start, week_end)).to(eq([Date.new(2024, 1, 1)]))
      end

      it "skips the off week" do
        activity = build(:activity, recurrence: "biweekly", day_of_week: 1, biweekly_anchor_date: anchor)
        off_week = Date.new(2024, 1, 8)
        expect(activity.occurrences_between(off_week, off_week + 6)).to(eq([]))
      end

      it "includes every other week across a four-week range" do
        activity = build(:activity, recurrence: "biweekly", day_of_week: 1, biweekly_anchor_date: anchor)
        dates = activity.occurrences_between(Date.new(2024, 1, 1), Date.new(2024, 1, 29))
        expect(dates).to(eq([Date.new(2024, 1, 1), Date.new(2024, 1, 15), Date.new(2024, 1, 29)]))
      end

      it "returns empty when biweekly_anchor_date is nil" do
        activity = build(:activity, recurrence: "biweekly", day_of_week: 1, biweekly_anchor_date: nil)
        expect(activity.occurrences_between(week_start, week_end)).to(eq([]))
      end
    end

    describe "one_time recurrence" do
      it "returns the date when starts_on is within range" do
        activity = build(:activity, :one_time, starts_on: Date.new(2024, 1, 3))
        expect(activity.occurrences_between(week_start, week_end)).to(eq([Date.new(2024, 1, 3)]))
      end

      it "returns empty when starts_on is outside the range" do
        activity = build(:activity, :one_time, starts_on: Date.new(2024, 1, 10))
        expect(activity.occurrences_between(week_start, week_end)).to(eq([]))
      end

      it "returns empty when starts_on is nil" do
        activity = build(:activity, recurrence: "one_time", day_of_week: nil, starts_on: nil)
        activity.valid? # skip validation for this test
        expect(activity.occurrences_between(week_start, week_end)).to(eq([]))
      end

      it "includes the boundary dates" do
        activity = build(:activity, :one_time, starts_on: week_start)
        expect(activity.occurrences_between(week_start, week_end)).to(eq([week_start]))

        activity2 = build(:activity, :one_time, starts_on: week_end)
        expect(activity2.occurrences_between(week_start, week_end)).to(eq([week_end]))
      end
    end

    describe "monthly recurrence" do
      # starts_on: 2024-01-02 = 1st Tuesday of January 2024
      let(:anchor) { Date.new(2024, 1, 2) }

      it "returns the 1st Tuesday of the month when in range" do
        activity = build(:activity, recurrence: "monthly", starts_on: anchor, day_of_week: 2)
        # week of Jan 1–7 contains Jan 2
        expect(activity.occurrences_between(week_start, week_end)).to(eq([Date.new(2024, 1, 2)]))
      end

      it "returns empty when the occurrence falls outside the range" do
        activity = build(:activity, recurrence: "monthly", starts_on: anchor, day_of_week: 2)
        # week of Jan 8–14: 1st Tuesday is Jan 2, not in range
        expect(activity.occurrences_between(Date.new(2024, 1, 8), Date.new(2024, 1, 14))).to(eq([]))
      end

      it "returns occurrences across multiple months" do
        activity = build(:activity, recurrence: "monthly", starts_on: anchor, day_of_week: 2)
        # 1st Tuesdays: Jan 2, Feb 6, Mar 5
        dates = activity.occurrences_between(Date.new(2024, 1, 1), Date.new(2024, 3, 31))
        expect(dates).to(eq([Date.new(2024, 1, 2), Date.new(2024, 2, 6), Date.new(2024, 3, 5)]))
      end

      it "handles the 4th weekday correctly" do
        # 2024-01-22 = 4th Monday of January
        fourth_monday_anchor = Date.new(2024, 1, 22)
        activity = build(:activity, recurrence: "monthly", starts_on: fourth_monday_anchor, day_of_week: 1)
        dates = activity.occurrences_between(Date.new(2024, 1, 1), Date.new(2024, 3, 31))
        # 4th Monday: Jan 22, Feb 26, Mar 25
        expect(dates).to(eq([Date.new(2024, 1, 22), Date.new(2024, 2, 26), Date.new(2024, 3, 25)]))
      end

      it "returns empty when starts_on is nil" do
        activity = build(:activity, recurrence: "monthly", starts_on: nil, day_of_week: nil)
        activity.valid?
        expect(activity.occurrences_between(week_start, week_end)).to(eq([]))
      end

      it "computes day_of_week from starts_on before validation" do
        activity = build(:activity, recurrence: "monthly", starts_on: anchor, day_of_week: nil)
        activity.valid?
        expect(activity.day_of_week).to(eq(2)) # Tuesday
      end
    end
  end

  describe ".active scope" do
    it "excludes archived activities" do
      active = create(:activity)
      archived = create(:activity, archived_at: 1.day.ago)
      expect(Activity.active).to(include(active))
      expect(Activity.active).not_to(include(archived))
    end
  end
end
