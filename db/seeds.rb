# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).

puts "Seeding database..."

# ---------------------------------------------------------------------------
# User + Household
#
# Uses the same attrs as Dev::SessionsController so that clicking "Dev Sign In"
# lands on this seeded household and data.
# ---------------------------------------------------------------------------

user = User.find_or_create_by!(provider: "developer", uid: "dev-user-001") do |u|
  u.email = "dev@example.com"
  u.name  = "Alex Freeman"
end

household = user.households.first || Household.create!(name: "The Freeman Family")
HouseholdMember.find_or_create_by!(user: user, household: household)

# ---------------------------------------------------------------------------
# Children
# ---------------------------------------------------------------------------

emma = Child.find_or_create_by!(household: household, first_name: "Emma") do |c|
  c.date_of_birth = Date.new(2015, 3, 15)
end

liam = Child.find_or_create_by!(household: household, first_name: "Liam") do |c|
  c.date_of_birth = Date.new(2018, 7, 22)
end

sofia = Child.find_or_create_by!(household: household, first_name: "Sofia") do |c|
  c.date_of_birth = Date.new(2020, 1, 10)
end

puts "  Children: #{[emma, liam, sofia].map(&:first_name).join(', ')}"

# ---------------------------------------------------------------------------
# Helper: ensure activity_children join records exist
# ---------------------------------------------------------------------------

def assign_children(activity, children)
  children.each do |child|
    ActivityChild.find_or_create_by!(activity: activity, child: child)
  end
end

# ---------------------------------------------------------------------------
# Recurring activities
# ---------------------------------------------------------------------------

# Weekly — Soccer Practice (Tuesday = 1)
soccer = Activity.find_or_create_by!(household: household, name: "Soccer Practice") do |a|
  a.recurrence   = "weekly"
  a.day_of_week  = 2  # Tuesday
  a.start_time   = "16:00"
  a.end_time     = "17:30"
end
assign_children(soccer, [emma, liam])

# Weekly — Piano Lessons (Thursday = 4)
piano = Activity.find_or_create_by!(household: household, name: "Piano Lessons") do |a|
  a.recurrence   = "weekly"
  a.day_of_week  = 4  # Thursday
  a.start_time   = "15:00"
  a.end_time     = "15:45"
end
assign_children(piano, [emma])

# Biweekly — Swimming (Wednesday = 3)
swimming = Activity.find_or_create_by!(household: household, name: "Swimming") do |a|
  a.recurrence           = "biweekly"
  a.day_of_week          = 3  # Wednesday
  a.biweekly_anchor_date = Date.new(2026, 4, 8)  # a known Wednesday anchor
  a.start_time           = "17:00"
  a.end_time             = "18:00"
end
assign_children(swimming, [emma, liam, sofia])

# Monthly — Art Class (first Saturday of each month)
# starts_on drives day_of_week computation for monthly; pick the first Saturday in April 2026
art = Activity.find_or_create_by!(household: household, name: "Art Class") do |a|
  a.recurrence = "monthly"
  a.starts_on  = Date.new(2026, 4, 4)  # first Saturday of April 2026
  a.start_time = "10:00"
  a.end_time   = "11:30"
end
assign_children(art, [liam, sofia])

puts "  Recurring activities: #{[soccer, piano, swimming, art].map(&:name).join(', ')}"

# ---------------------------------------------------------------------------
# Ad-hoc (one_time) activities
# ---------------------------------------------------------------------------

science_fair = Activity.find_or_create_by!(household: household, name: "School Science Fair") do |a|
  a.recurrence = "one_time"
  a.starts_on  = Date.new(2026, 4, 24)
  a.start_time = "09:00"
  a.end_time   = "12:00"
  a.notes      = "Emma presenting her volcano project. Bring extra poster board."
end
assign_children(science_fair, [emma])

birthday_party = Activity.find_or_create_by!(household: household, name: "Jake's Birthday Party") do |a|
  a.recurrence = "one_time"
  a.starts_on  = Date.new(2026, 4, 18)
  a.start_time = "14:00"
  a.end_time   = "16:00"
  a.notes      = "At the community center. Bring a gift."
end
assign_children(birthday_party, [liam])

dentist = Activity.find_or_create_by!(household: household, name: "Dentist Checkup") do |a|
  a.recurrence = "one_time"
  a.starts_on  = Date.new(2026, 4, 15)
  a.start_time = "11:00"
  a.end_time   = "11:30"
end
assign_children(dentist, [sofia])

puts "  Ad-hoc activities: #{[science_fair, birthday_party, dentist].map(&:name).join(', ')}"

# ---------------------------------------------------------------------------
# Activity sessions — a few overrides / cancellations for recurring activities
# ---------------------------------------------------------------------------

# Soccer: last week was cancelled
ActivitySession.find_or_create_by!(activity: soccer, scheduled_date: Date.new(2026, 4, 7)) do |s|
  s.status = "cancelled"
  s.notes  = "Field closed for maintenance."
end

# Soccer: this week is confirmed, slightly different time
ActivitySession.find_or_create_by!(activity: soccer, scheduled_date: Date.new(2026, 4, 14)) do |s|
  s.status     = "confirmed"
  s.start_time = "16:30"
  s.end_time   = "18:00"
  s.notes      = "Makeup session — extra 30 min."
end

# Piano: upcoming session confirmed (no override needed for defaults, but record it)
ActivitySession.find_or_create_by!(activity: piano, scheduled_date: Date.new(2026, 4, 16)) do |s|
  s.status = "confirmed"
end

# Swimming: last biweekly session cancelled
ActivitySession.find_or_create_by!(activity: swimming, scheduled_date: Date.new(2026, 4, 8)) do |s|
  s.status = "cancelled"
  s.notes  = "Pool maintenance."
end

puts "  Activity sessions created."
puts "Done! Use the Dev Sign In button (or GET /dev/sign_in) to log in."
