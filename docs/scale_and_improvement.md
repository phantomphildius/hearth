# Scale & Improvement Backlog

Items identified during code review. Lower priority — revisit when the app has real users or the relevant feature area is next touched.

---

## Rate Limiting on Household Invite

`POST /households/:id/household_members` sends an email on every call with no throttle. A bad actor (or a UI bug) could spam invites.

**Fix:** Add a Rack::Attack rule throttling this endpoint by IP and/or user.
**Files:** `config/initializers/rack_attack.rb` (new), `app/controllers/household_members_controller.rb`

---

## Week Navigation Timezone Fragility

`new Date()` in the browser uses client local time. The server works exclusively in UTC dates. A user west of UTC after midnight UTC will see the wrong week highlighted as "current."

**Fix:** Pass `Date.today.iso8601` from the server as a prop in `ActivitiesController#index` and use it as the "today" anchor in the frontend instead of `new Date()`.
**Files:** `app/controllers/activities_controller.rb`, `app/frontend/pages/Activities/Index.tsx`, `app/frontend/components/activity/WeeklyCalendar.tsx`

---

## `archived_at` Scope Enforcement

There is no default scope on `Activity` by design (preserves access for future admin/reporting views). All queries must explicitly chain `.active` or archived activities will reappear. Currently enforced by convention and a comment on the scope only.

**Options if this becomes a problem:**
- A RuboCop custom cop that flags `@household.activities` without `.active`
- A default scope (not recommended — makes admin/reporting harder later)

**Files:** `app/models/activity.rb`, any controller calling `@household.activities`

---

## Household Member Roles

All household members currently share equal privileges — any member can invite or remove any other member, including the original creator. This is intentional for now (simple model, small households).

If role distinction becomes needed:
- Add `role` or `owner` boolean to `household_members`
- Enforce in `HouseholdPolicy#manage_members?`: `record.household_members.find_by(user: user)&.owner?`

**Files:** `app/models/household_member.rb`, `app/policies/household_policy.rb`, new migration
