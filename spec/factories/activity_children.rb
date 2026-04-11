FactoryBot.define do
  factory :activity_child do
    transient do
      household { create(:household) }
    end

    activity { create(:activity, household: household) }
    child { create(:child, household: household) }
  end
end
