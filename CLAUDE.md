# Hearth — Claude Code Guidelines

## Security Principles

These rules apply to **all** code written in this project. They are non-negotiable and must be followed without exception.

### 1. Trust Root Chaining — Always Scope Through the Full Chain

Every data access must traverse the full ownership chain: `current_user` → `household` → `resource`. Never skip a level or fetch a resource without anchoring it to the authenticated user's household.

**Wrong:**
```ruby
Child.where(id: ids)
Activity.find(params[:id])
```

**Right:**
```ruby
@household.children.where(id: ids)
@household.activities.find(params[:id])
```

This applies everywhere — controller actions, background jobs, API responses, and helper methods.

### 2. Never Use Unscoped Queries When a Scoped Association Exists

If a scoped association is available (e.g., `@household.children`), use it. Do not extract IDs from a scoped query and then re-fetch with an unscoped query — this breaks the trust chain even if the IDs appear safe.

### 3. All Controllers Must Establish Household Scope Before Accessing Resources

Every controller that deals with household-owned resources must call `set_household` (or equivalent) as a `before_action`. Accessing `params[:household_id]` directly in an action is a red flag.

### 4. No Plain-Text Secrets, Tokens, or Sensitive Data

- All secrets (API keys, OAuth credentials, encryption keys) belong in `config/credentials.yml.enc`, never in source code, comments, or `.env` files committed to the repo
- Session state must never store OAuth access tokens or full auth provider responses — store only uid + provider
- Passwords are always hashed (bcrypt via Devise); never log, display, or store plain-text passwords

### 5. Least Privilege — Only Expose What's Needed

- API responses and Inertia props must include only the fields the frontend actually needs. Do not pass full ActiveRecord objects or `.to_json` without explicit field selection.
- When in doubt, omit the field and add it explicitly when a real need arises.

### 6. Production Security Config Must Stay Enabled

Do not comment out these settings:
- `config.force_ssl = true` in `config/environments/production.rb`
- `Content-Security-Policy` in `config/initializers/content_security_policy.rb`
- `config.clean_up_csrf_token_on_authentication = true` in Devise initializer

If you need to disable one temporarily for debugging, leave a comment explaining why and create a follow-up task to re-enable it.

---

## Architecture Principles (Sandi Metz)

These rules govern where logic lives in this codebase. Follow them for all new code and when modifying existing code.

### Controllers are skinny

Controllers handle exactly four things: **routing, persistence, auth, and error handling**. Nothing else.

| Allowed in controllers | Not allowed in controllers |
|---|---|
| `before_action` auth/scoping | Business rules or conditionals on domain state |
| `params` strong parameters | Multi-step operations across models |
| `render` / `redirect_to` | Looking up records by arbitrary criteria |
| Calling `.save`, `.update`, `.destroy` | Transactions that touch more than one model |
| Calling a service object | Inline data transformations beyond simple prop hashes |

### Models hold record-specific logic

If logic is intrinsic to a single ActiveRecord model (validations, scopes, computed attributes, simple class methods), it belongs on the model.

```ruby
# Good — belongs on Activity
def self.defaults = { recurrence: "weekly", ... }

# Good — belongs on HouseholdMember
def self.last_in?(household) = household.household_members.count <= 1
```

### Service objects for everything else

Use a service object when:
- The operation spans more than one model
- There is a multi-step process (find → validate → create → associate)
- The logic is specific to a user interaction but not reusable enough for the model

**Conventions:**
- Live in `app/services/`
- Named with a **verb phrase**: `CreateHousehold`, `AddHouseholdMember`, `SyncActivityChildren`
- Single public entry point: `.call(**kwargs)` delegating to `#call`
- Explicit keyword arguments — no positional args, no passing hashes
- Return a `ServiceResult` (`ServiceResult.ok(record:)` or `ServiceResult.fail(errors:)`)
- No Rails controller concerns (no `params`, no `redirect_to`, no `render`)

```ruby
# Example service object
class CreateHousehold
  def self.call(user:, name:) = new(user: user, name: name).call

  def initialize(user:, name:)
    @user = user
    @name = name
  end

  def call
    # ... business logic ...
    ServiceResult.ok(record: household)
  end
end

# In the controller
result = CreateHousehold.call(user: current_user, name: household_params[:name])
if result.success?
  redirect_to household_path(result.record), notice: "Created."
else
  render inertia: "Households/New", props: { errors: result.errors }
end
```

### Where does it go? — Decision table

| Type of logic | Where it lives |
|---|---|
| Validations, scopes, computed attrs | Model |
| Simple class factory / defaults | Model class method |
| Cross-model transaction or multi-step op | Service object |
| Auth / scoping | Controller `before_action` |
| Inertia/API prop shaping | Controller private method or shared concern |
| Shared prop helpers across controllers | `app/controllers/concerns/` |

---

## New Features Checklist

Before completing any feature that touches user data or access control:
- [ ] Data access goes through the full `current_user → household → resource` chain
- [ ] No raw SQL or string-interpolated queries
- [ ] No new secrets in source code
- [ ] Inertia/API props are explicit field lists, not whole records
- [ ] If a new controller is added, it inherits `ApplicationController` and has `authenticate_user!` coverage
