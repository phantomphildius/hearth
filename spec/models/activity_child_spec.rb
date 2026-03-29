require "rails_helper"

RSpec.describe(ActivityChild, type: :model) do
  describe "validations" do
    it "is valid with an activity and child" do
      household = create(:household)
      activity = create(:activity, household: household)
      child = create(:child, household: household)

      expect(build(:activity_child, activity: activity, child: child)).to(be_valid)
    end

    it "prevents duplicate enrollment" do
      household = create(:household)
      activity = create(:activity, household: household)
      child = create(:child, household: household)
      create(:activity_child, activity: activity, child: child)

      duplicate = build(:activity_child, activity: activity, child: child)
      expect(duplicate).not_to(be_valid)
    end
  end

  describe "associations" do
    it "belongs to an activity" do
      ac = create(:activity_child)
      expect(ac.activity).to(be_a(Activity))
    end

    it "belongs to a child" do
      ac = create(:activity_child)
      expect(ac.child).to(be_a(Child))
    end
  end
end
