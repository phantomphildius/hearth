FactoryBot.define do
  factory :activity_session do
    activity
    scheduled_date { Date.today }
    status { "confirmed" }

    trait :cancelled do
      status { "cancelled" }
    end
  end
end
