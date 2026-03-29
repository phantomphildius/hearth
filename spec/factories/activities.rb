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
    end

    trait :with_location do
      location_name { "City Park Field #1" }
      address { "123 Park Ave, Springfield, IL" }
      latitude { 39.7817 }
      longitude { -89.6501 }
    end
  end
end
