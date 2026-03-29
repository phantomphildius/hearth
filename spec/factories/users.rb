FactoryBot.define do
  factory :user do
    sequence(:email) { |n| "user#{n}@example.com" }
    sequence(:name) { |n| "User #{n}" }
    provider { "google_oauth2" }
    sequence(:uid) { |n| "google_uid_#{n}" }
    avatar_url { nil }
  end
end
