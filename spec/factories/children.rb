FactoryBot.define do
  factory :child do
    household
    sequence(:first_name) { |n| "Child #{n}" }
    date_of_birth { 8.years.ago.to_date }
  end
end
