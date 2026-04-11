FactoryBot.define do
  factory :activity do
    household
    sequence(:name) { |n| "Activity #{n}" }
    day_of_week { 1 }
    start_time { "09:00" }
    end_time { "10:00" }
    duration_minutes { 60 }
    recurrence { "weekly" }

    trait :one_time do
      recurrence { "one_time" }
      day_of_week { nil }
      starts_on { 1.week.from_now.to_date }
    end

    trait :biweekly do
      recurrence { "biweekly" }
      biweekly_anchor_date { Date.today }
    end

    trait :monthly do
      recurrence { "monthly" }
      day_of_week { nil }
      starts_on { Date.new(2024, 1, 2) } # 1st Tuesday of January 2024
    end

  end
end
