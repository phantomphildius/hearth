require "rails_helper"

RSpec.describe(Child, type: :model) do
  describe "validations" do
    it "is valid with required attributes" do
      expect(build(:child)).to(be_valid)
    end

    it "requires first_name" do
      child = build(:child, first_name: nil)
      expect(child).not_to(be_valid)
    end

    it "requires date_of_birth" do
      child = build(:child, date_of_birth: nil)
      expect(child).not_to(be_valid)
    end
  end

  describe "associations" do
    it "belongs to a household" do
      child = create(:child)
      expect(child.household).to(be_a(Household))
    end

    it "has many activities through activity_children" do
      child = create(:child)
      activity = create(:activity, household: child.household)
      create(:activity_child, activity: activity, child: child)

      expect(child.activities).to(include(activity))
    end

    it "destroys activity_children when destroyed" do
      child = create(:child)
      activity = create(:activity, household: child.household)
      create(:activity_child, activity: activity, child: child)

      expect { child.destroy }.to(change(ActivityChild, :count).by(-1))
    end
  end

  describe "#age" do
    it "calculates age from date_of_birth" do
      child = build(:child, date_of_birth: 10.years.ago.to_date)
      expect(child.age).to(eq(10))
    end

    it "accounts for birthday not yet passed this year" do
      # Use a date that is definitely in the future this year
      future_birthday = Date.new(Time.zone.today.year, 12, 31)
      dob = future_birthday - 10.years
      child = build(:child, date_of_birth: dob)

      if Time.zone.today < future_birthday
        expect(child.age).to(eq(9))
      else
        expect(child.age).to(eq(10))
      end
    end
  end
end
