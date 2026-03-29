# Hearth Backend Architecture Contract

**Version:** 1.0
**Date:** 2026-03-28
**Status:** Draft - Pending Frontend Review

---

## Table of Contents

1. [Data Models](#1-data-models)
2. [API Contracts (Inertia Props)](#2-api-contracts-inertia-props)
3. [Auth Flow](#3-auth-flow)
4. [Authorization](#4-authorization)
5. [Validation Rules](#5-validation-rules)
6. [Missing Migrations](#6-missing-migrations)

---

## 1. Data Models

### 1.1 `users`

| Column                   | Type       | Constraints                    | Notes                       |
| ------------------------ | ---------- | ------------------------------ | --------------------------- |
| `id`                     | `bigint`   | PK, auto-increment            |                             |
| `email`                  | `string`   | NOT NULL, default `""`, UNIQUE | Devise authenticatable      |
| `encrypted_password`     | `string`   | NOT NULL, default `""`         | Devise authenticatable      |
| `reset_password_token`   | `string`   | UNIQUE                         | Devise recoverable          |
| `reset_password_sent_at` | `datetime` |                                | Devise recoverable          |
| `remember_created_at`    | `datetime` |                                | Devise rememberable         |
| `provider`               | `string`   |                                | OmniAuth provider (`google_oauth2`) |
| `uid`                    | `string`   |                                | OmniAuth unique ID          |
| `name`                   | `string`   |                                | Display name from Google    |
| `avatar_url`             | `string`   |                                | Google profile image URL    |
| `created_at`             | `datetime` | NOT NULL                       |                             |
| `updated_at`             | `datetime` | NOT NULL                       |                             |

**Indexes:**
- `index_users_on_email` (unique)
- `index_users_on_reset_password_token` (unique)
- `index_users_on_provider_and_uid` (unique, composite) -- **NEW: needs migration**

**Associations:**
- `has_many :household_members, dependent: :destroy`
- `has_many :households, through: :household_members`

---

### 1.2 `households`

| Column       | Type       | Constraints         | Notes |
| ------------ | ---------- | ------------------- | ----- |
| `id`         | `bigint`   | PK, auto-increment  |       |
| `name`       | `string`   | NOT NULL             |       |
| `created_at` | `datetime` | NOT NULL             |       |
| `updated_at` | `datetime` | NOT NULL             |       |

**Indexes:** None beyond PK.

**Associations:**
- `has_many :household_members, dependent: :destroy`
- `has_many :users, through: :household_members`
- `has_many :children, dependent: :destroy`
- `has_many :activities, dependent: :destroy` -- **NEW**

---

### 1.3 `household_members`

| Column         | Type       | Constraints                          | Notes |
| -------------- | ---------- | ------------------------------------ | ----- |
| `id`           | `bigint`   | PK, auto-increment                   |       |
| `household_id` | `bigint`   | NOT NULL, FK -> `households`         |       |
| `user_id`      | `bigint`   | NOT NULL, FK -> `users`              |       |
| `role`         | `string`   |                                      | **DEPRECATED. Will be removed. All members have equal access.** |
| `created_at`   | `datetime` | NOT NULL                             |       |
| `updated_at`   | `datetime` | NOT NULL                             |       |

**Indexes:**
- `index_household_members_on_household_id`
- `index_household_members_on_user_id`
- `index_household_members_on_user_id_and_household_id` (unique, composite) -- **NEW: needs migration**

**Associations:**
- `belongs_to :household`
- `belongs_to :user`

> **Note:** The `role` column exists in the current schema but is unused. A future migration will remove it. No code should read or write this column.

---

### 1.4 `children`

| Column         | Type       | Constraints                  | Notes |
| -------------- | ---------- | ---------------------------- | ----- |
| `id`           | `bigint`   | PK, auto-increment           |       |
| `household_id` | `bigint`   | NOT NULL, FK -> `households` |       |
| `first_name`   | `string`   | NOT NULL                     |       |
| `date_of_birth`| `date`     | NOT NULL                     |       |
| `created_at`   | `datetime` | NOT NULL                     |       |
| `updated_at`   | `datetime` | NOT NULL                     |       |

**Indexes:**
- `index_children_on_household_id`

**Associations:**
- `belongs_to :household`
- `has_many :activity_children, dependent: :destroy` -- **NEW**
- `has_many :activities, through: :activity_children` -- **NEW**

---

### 1.5 `activities` -- **NEW TABLE**

| Column             | Type       | Constraints                  | Notes |
| ------------------ | ---------- | ---------------------------- | ----- |
| `id`               | `bigint`   | PK, auto-increment           |       |
| `household_id`     | `bigint`   | NOT NULL, FK -> `households` |       |
| `name`             | `string`   | NOT NULL                     | e.g. "Soccer Practice"       |
| `location_name`    | `string`   |                              | e.g. "Lincoln Park Field #3" |
| `address`          | `string`   |                              | Full street address           |
| `latitude`         | `decimal`  | precision: 10, scale: 7      | Geolocation lat              |
| `longitude`        | `decimal`  | precision: 10, scale: 7      | Geolocation lng              |
| `day_of_week`      | `integer`  |                              | 0=Sunday, 6=Saturday. NULL for one-time events. |
| `start_time`       | `time`     | NOT NULL                     | Time of day the activity starts |
| `end_time`         | `time`     | NOT NULL                     | Time of day the activity ends   |
| `duration_minutes` | `integer`  | NOT NULL                     | Stored explicitly for easy querying |
| `recurrence`       | `string`   | NOT NULL, default `"weekly"` | Enum: `weekly`, `biweekly`, `monthly`, `one_time` |
| `starts_on`        | `date`     |                              | When the recurrence begins. Required for `one_time`. |
| `notes`            | `text`     |                              | Optional freeform notes        |
| `created_at`       | `datetime` | NOT NULL                     |       |
| `updated_at`       | `datetime` | NOT NULL                     |       |

**Indexes:**
- `index_activities_on_household_id`
- `index_activities_on_day_of_week`
- `index_activities_on_household_id_and_day_of_week` (composite, for schedule queries)

**Associations:**
- `belongs_to :household`
- `has_many :activity_children, dependent: :destroy`
- `has_many :children, through: :activity_children`

**Enum mapping (Rails):**
```ruby
enum :recurrence, { weekly: "weekly", biweekly: "biweekly", monthly: "monthly", one_time: "one_time" }
```

---

### 1.6 `activity_children` -- **NEW TABLE (Join)**

| Column        | Type       | Constraints                   | Notes |
| ------------- | ---------- | ----------------------------- | ----- |
| `id`          | `bigint`   | PK, auto-increment            |       |
| `activity_id` | `bigint`   | NOT NULL, FK -> `activities`  |       |
| `child_id`    | `bigint`   | NOT NULL, FK -> `children`    |       |
| `created_at`  | `datetime` | NOT NULL                      |       |
| `updated_at`  | `datetime` | NOT NULL                      |       |

**Indexes:**
- `index_activity_children_on_activity_id`
- `index_activity_children_on_child_id`
- `index_activity_children_on_activity_id_and_child_id` (unique, composite) -- prevent duplicate enrollment

**Associations:**
- `belongs_to :activity`
- `belongs_to :child`

---

### Entity Relationship Diagram (Text)

```
User *--* Household         (through HouseholdMember)
Household 1--* Child
Household 1--* Activity
Activity *--* Child          (through ActivityChild)
```

---

## 2. API Contracts (Inertia Props)

All responses are Inertia responses. Every page receives the shared props defined in `ApplicationController`:

```typescript
// Shared props injected into EVERY page via inertia_share
interface SharedProps {
  auth: {
    user: AuthUser | null;
  };
  flash: {
    notice: string | null;
    alert: string | null;
  };
}

interface AuthUser {
  id: number;
  name: string;
  email: string;
  avatar_url: string | null;
}
```

---

### 2.1 Auth Pages

#### Sign In (Devise-managed)

No Inertia page. The sign-in flow uses standard Devise routes that redirect to Google OAuth. See [Section 3: Auth Flow](#3-auth-flow).

---

### 2.2 Households

#### `GET /households/:id` -- Households/Show

**Controller:** `HouseholdsController#show`
**Route:** `household_path(household)`
**Component:** `Households/Show`

```typescript
interface HouseholdsShowProps extends SharedProps {
  household: Household;
  members: HouseholdMember[];
  children: Child[];
  errors?: Record<string, string[]>;
}

interface Household {
  id: number;
  name: string;
}

interface HouseholdMember {
  id: number;
  name: string;
  email: string;
  avatar_url: string | null;
}

interface Child {
  id: number;
  first_name: string;
  date_of_birth: string; // ISO 8601 date "YYYY-MM-DD"
  age: number;
}
```

---

#### `POST /households` -- Create Household

**Controller:** `HouseholdsController#create`
**Route:** `households_path`
**On success:** Redirect to `Households/Show`
**On failure:** Renders `Households/New`

**Request body:**
```typescript
interface CreateHouseholdRequest {
  household: {
    name: string;
  };
}
```

**Error props (Households/New):**
```typescript
interface HouseholdsNewProps extends SharedProps {
  errors: Record<string, string[]>;
}
```

---

#### `PATCH /households/:id` -- Update Household

**Controller:** `HouseholdsController#update`
**Route:** `household_path(household)`
**On success:** Redirect to `Households/Show` (with flash notice)
**On failure:** Renders `Households/Show` with errors

**Request body:**
```typescript
interface UpdateHouseholdRequest {
  household: {
    name: string;
  };
}
```

---

### 2.3 Household Members

#### `POST /households/:household_id/household_members` -- Add Member

**Controller:** `HouseholdMembersController#create`
**Route:** `household_household_members_path(household)`
**On success:** Redirect to `Households/Show` (with flash notice)
**On failure:** Redirect to `Households/Show` (with flash alert) or render with error prop

**Request body:**
```typescript
interface AddMemberRequest {
  email: string; // Email of existing user to invite
}
```

---

#### `DELETE /households/:household_id/household_members/:id` -- Remove Member

**Controller:** `HouseholdMembersController#destroy`
**Route:** `household_household_member_path(household, user)`
**On success:** Redirect to `Households/Show`
**On failure:** Redirect to `Households/Show` (with flash alert)

> **Note:** The `:id` param is the `user_id`, not the `household_member.id`. This matches the current controller implementation which uses `find_by(user_id: params[:id])`.

---

### 2.4 Children

#### `POST /households/:household_id/children` -- Add Child

**Controller:** `ChildrenController#create`
**Route:** `household_children_path(household)`
**On success:** Redirect to `Households/Show`
**On failure:** Redirect to `Households/Show` (with flash alert)

**Request body:**
```typescript
interface CreateChildRequest {
  child: {
    first_name: string;
    date_of_birth: string; // "YYYY-MM-DD"
  };
}
```

---

#### `PATCH /households/:household_id/children/:id` -- Update Child

**Controller:** `ChildrenController#update`
**Route:** `household_child_path(household, child)`
**On success:** Redirect to `Households/Show`
**On failure:** Redirect to `Households/Show` (with flash alert)

**Request body:** Same as `CreateChildRequest`.

---

#### `DELETE /households/:household_id/children/:id` -- Remove Child

**Controller:** `ChildrenController#destroy`
**Route:** `household_child_path(household, child)`
**On success:** Redirect to `Households/Show`

---

### 2.5 Activities -- **NEW**

#### `GET /households/:household_id/activities` -- Activities/Index

**Controller:** `ActivitiesController#index`
**Route:** `household_activities_path(household)`
**Component:** `Activities/Index`

```typescript
interface ActivitiesIndexProps extends SharedProps {
  household: Household;
  activities: Activity[];
  children: Child[]; // All children in the household (for filter/display)
}

interface Activity {
  id: number;
  name: string;
  location_name: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  day_of_week: number | null;       // 0-6, null for one-time
  day_of_week_name: string | null;  // "Monday", "Tuesday", etc.
  start_time: string;               // "HH:MM" (24h format)
  end_time: string;                 // "HH:MM" (24h format)
  duration_minutes: number;
  recurrence: "weekly" | "biweekly" | "monthly" | "one_time";
  starts_on: string | null;         // "YYYY-MM-DD"
  notes: string | null;
  children: ActivityChild[];
  created_at: string;               // ISO 8601 datetime
  updated_at: string;               // ISO 8601 datetime
}

interface ActivityChild {
  id: number;
  first_name: string;
  age: number;
}
```

---

#### `GET /households/:household_id/activities/:id` -- Activities/Show

**Controller:** `ActivitiesController#show`
**Route:** `household_activity_path(household, activity)`
**Component:** `Activities/Show`

```typescript
interface ActivitiesShowProps extends SharedProps {
  household: Household;
  activity: Activity;
  children: Child[]; // All household children (for editing enrollment)
}
```

---

#### `GET /households/:household_id/activities/new` -- Activities/New

**Controller:** `ActivitiesController#new`
**Route:** `new_household_activity_path(household)`
**Component:** `Activities/New`

```typescript
interface ActivitiesNewProps extends SharedProps {
  household: Household;
  children: Child[];  // All household children (for selection)
  activity: ActivityFormDefaults;
  errors?: Record<string, string[]>;
}

// Defaults provided for form pre-population
interface ActivityFormDefaults {
  name: string;             // ""
  location_name: string;    // ""
  address: string;          // ""
  latitude: number | null;  // null
  longitude: number | null; // null
  day_of_week: number | null;
  start_time: string;       // ""
  end_time: string;         // ""
  duration_minutes: number | null;
  recurrence: string;       // "weekly"
  starts_on: string;        // ""
  notes: string;            // ""
  child_ids: number[];      // []
}
```

---

#### `POST /households/:household_id/activities` -- Create Activity

**Controller:** `ActivitiesController#create`
**Route:** `household_activities_path(household)`
**On success:** Redirect to `Activities/Show`
**On failure:** Renders `Activities/New` with errors

**Request body:**
```typescript
interface CreateActivityRequest {
  activity: {
    name: string;
    location_name?: string;
    address?: string;
    latitude?: number;
    longitude?: number;
    day_of_week?: number;
    start_time: string;        // "HH:MM"
    end_time: string;          // "HH:MM"
    duration_minutes: number;
    recurrence: "weekly" | "biweekly" | "monthly" | "one_time";
    starts_on?: string;        // "YYYY-MM-DD"
    notes?: string;
    child_ids: number[];       // Array of child IDs to enroll
  };
}
```

---

#### `GET /households/:household_id/activities/:id/edit` -- Activities/Edit

**Controller:** `ActivitiesController#edit`
**Route:** `edit_household_activity_path(household, activity)`
**Component:** `Activities/Edit`

```typescript
interface ActivitiesEditProps extends SharedProps {
  household: Household;
  children: Child[];
  activity: Activity & { child_ids: number[] };
  errors?: Record<string, string[]>;
}
```

---

#### `PATCH /households/:household_id/activities/:id` -- Update Activity

**Controller:** `ActivitiesController#update`
**Route:** `household_activity_path(household, activity)`
**On success:** Redirect to `Activities/Show`
**On failure:** Renders `Activities/Edit` with errors

**Request body:** Same as `CreateActivityRequest`.

---

#### `DELETE /households/:household_id/activities/:id` -- Delete Activity

**Controller:** `ActivitiesController#destroy`
**Route:** `household_activity_path(household, activity)`
**On success:** Redirect to `Activities/Index`

---

### 2.6 Route Summary

```
# Existing
devise_for :users, controllers: { omniauth_callbacks: "users/omniauth_callbacks" }

resources :households, only: [:show, :create, :update] do
  resources :household_members, only: [:create, :destroy]
  resources :children, only: [:create, :update, :destroy]
  resources :activities                                       # <-- NEW
end

root "households#show", id: "current"
```

| Method   | Path                                                  | Controller#Action               | Inertia Component    |
| -------- | ----------------------------------------------------- | ------------------------------- | -------------------- |
| GET      | `/households/:id`                                     | `households#show`               | `Households/Show`    |
| POST     | `/households`                                         | `households#create`             | redirect or `Households/New` |
| PATCH    | `/households/:id`                                     | `households#update`             | redirect or `Households/Show` |
| POST     | `/households/:hid/household_members`                  | `household_members#create`      | redirect             |
| DELETE   | `/households/:hid/household_members/:id`              | `household_members#destroy`     | redirect             |
| POST     | `/households/:hid/children`                           | `children#create`               | redirect             |
| PATCH    | `/households/:hid/children/:id`                       | `children#update`               | redirect             |
| DELETE   | `/households/:hid/children/:id`                       | `children#destroy`              | redirect             |
| **GET**  | **`/households/:hid/activities`**                     | **`activities#index`**          | **`Activities/Index`** |
| **GET**  | **`/households/:hid/activities/new`**                 | **`activities#new`**            | **`Activities/New`** |
| **POST** | **`/households/:hid/activities`**                     | **`activities#create`**         | redirect or `Activities/New` |
| **GET**  | **`/households/:hid/activities/:id`**                 | **`activities#show`**           | **`Activities/Show`** |
| **GET**  | **`/households/:hid/activities/:id/edit`**            | **`activities#edit`**           | **`Activities/Edit`** |
| **PATCH**| **`/households/:hid/activities/:id`**                 | **`activities#update`**         | redirect or `Activities/Edit` |
| **DELETE**| **`/households/:hid/activities/:id`**                | **`activities#destroy`**        | redirect             |

---

## 3. Auth Flow

### 3.1 Google OAuth Sign-In Flow

```
1. User visits the app (any authenticated route)
2. authenticate_user! (Devise) redirects unauthenticated user to sign-in
3. Sign-in page shows "Sign in with Google" button
4. Button links to: /users/auth/google_oauth2  (Devise OmniAuth route)
5. Devise redirects to Google consent screen
6. User grants consent; Google redirects to callback URL:
     /users/auth/google_oauth2/callback
7. Users::OmniauthCallbacksController#google_oauth2 fires:
     a. User.from_omniauth(auth) -- find_or_create_by(provider, uid)
     b. If user is persisted:
        - sign_in_and_redirect(user)
        - Devise stores session in cookie
     c. If user is NOT persisted (validation failure):
        - Redirect to root with error flash
8. After sign-in redirect, the user lands on root_path -> households#show
```

### 3.2 First-Time User: Automatic Household Creation

Currently, `User.from_omniauth` creates the user but does **not** create a household. The `households#show` root action calls `current_user.households.find(params[:id])` which will fail for a new user with no household.

**Contract for implementation:**

The `Users::OmniauthCallbacksController#google_oauth2` method must be extended with an after-sign-in hook:

```
After successful sign-in:
  1. If user.households.empty?
     a. Create a default household: Household.create!(name: "#{user.name}'s Household")
     b. Create the membership: household.household_members.create!(user: user)
  2. Redirect to household_path(user.households.first)
```

This logic should live in a `SetupDefaultHousehold` concern or be called from `after_sign_in_path_for(resource)` in the OmniAuth callbacks controller.

### 3.3 Current Household Resolution

The root path (`/`) maps to `households#show` with `id: "current"`. The controller must resolve "current" to an actual household.

**Resolution logic in `HouseholdsController#set_household`:**

```
1. If params[:id] == "current":
     a. Return current_user.households.first
     b. If no households exist, redirect to a household creation flow
2. Otherwise:
     a. Return current_user.households.find(params[:id])
     b. Raises ActiveRecord::RecordNotFound (404) if user is not a member
```

> **Future consideration:** If a user belongs to multiple households, we may store `current_household_id` in the session or on the user record. For Milestone 1, we use `households.first` (the oldest household the user belongs to).

### 3.4 Sign Out

```
DELETE /users/sign_out
```

Standard Devise session destruction. Redirects to root (which will then redirect to sign-in).

### 3.5 Session Storage

- Devise cookie-based session (Rails default)
- No JWT, no API tokens
- `remember_me` supported via Devise rememberable module

---

## 4. Authorization

### 4.1 Core Principle: Equal Access

All household members have **equal access**. There are no roles, no admin/owner distinction, no hierarchy. Any member of a household can:

- Edit the household name
- Add or remove other members (including themselves)
- Add, edit, or remove children
- Add, edit, or remove activities

### 4.2 Household Scoping Pattern

Every controller that operates on household data **must** scope queries through the current user's household membership. This is the single authorization gate.

**Pattern:**

```ruby
# In any controller that nests under a household:
def set_household
  @household = current_user.households.find(params[:household_id])
  # OR for HouseholdsController:
  @household = current_user.households.find(params[:id])
end
```

This ensures:
- `ActiveRecord::RecordNotFound` (404) is raised if the user is not a member of the requested household
- No explicit "authorize!" call is needed -- the scoped query IS the authorization
- A user can never access another household's data

### 4.3 Resource Scoping

All child resources must be loaded through the household:

```ruby
# Children
@household.children.find(params[:id])

# Activities
@household.activities.find(params[:id])

# Members
@household.household_members.find_by!(user_id: params[:id])
```

**Never** use unscoped `Activity.find(params[:id])` or `Child.find(params[:id])`.

### 4.4 Self-Removal Guard

A household member can remove themselves. However, **the last member of a household cannot be removed**. The controller must enforce:

```
if @household.household_members.count <= 1
  redirect_to household_path(@household), alert: "Cannot remove the last member of a household."
end
```

### 4.5 Child Enrollment Authorization

When creating or updating an activity, the `child_ids` array must be validated to ensure all IDs belong to children in the same household:

```
Reject any child_id where Child.find(child_id).household_id != @household.id
```

In practice, load children through the household: `@household.children.where(id: child_ids)`.

---

## 5. Validation Rules

### 5.1 User

| Field     | Rule                                    |
| --------- | --------------------------------------- |
| `email`   | Required, unique (case-insensitive)     |
| `name`    | Required                                |
| `provider`| No validation (set by OmniAuth)         |
| `uid`     | No validation (set by OmniAuth)         |

---

### 5.2 Household

| Field  | Rule     |
| ------ | -------- |
| `name` | Required |

---

### 5.3 HouseholdMember

| Field          | Rule                                          |
| -------------- | --------------------------------------------- |
| `household_id` | Required (FK)                                 |
| `user_id`      | Required (FK), unique within household scope  |

**Business rules:**
- Cannot remove the last member of a household (enforced at controller level)
- A user cannot be added to the same household twice (DB unique index + model validation)

---

### 5.4 Child

| Field           | Rule                                      |
| --------------- | ----------------------------------------- |
| `first_name`    | Required                                  |
| `date_of_birth` | Required, must be in the past             |
| `household_id`  | Required (FK)                             |

**Business rules:**
- No hard cap on number of children per household (practical soft limit: display handles up to ~20 gracefully)
- `date_of_birth` must be a valid date that is not in the future

---

### 5.5 Activity -- **NEW**

| Field              | Rule                                                                 |
| ------------------ | -------------------------------------------------------------------- |
| `name`             | Required, max 255 characters                                         |
| `location_name`    | Optional, max 255 characters                                         |
| `address`          | Optional, max 500 characters                                         |
| `latitude`         | Optional, must be between -90 and 90 (if provided)                   |
| `longitude`        | Optional, must be between -180 and 180 (if provided)                 |
| `day_of_week`      | Optional (NULL for one-time), must be 0-6 when present               |
| `start_time`       | Required                                                             |
| `end_time`         | Required, must be after `start_time`                                 |
| `duration_minutes` | Required, must be a positive integer, max 1440                       |
| `recurrence`       | Required, must be one of: `weekly`, `biweekly`, `monthly`, `one_time`|
| `starts_on`        | Required when recurrence is `one_time`, optional otherwise            |
| `household_id`     | Required (FK)                                                        |
| `notes`            | Optional, max 2000 characters                                        |

**Business rules:**

1. **Duration consistency:** `duration_minutes` should match `end_time - start_time`. The backend will compute `duration_minutes` from start/end times on save if not explicitly provided. If explicitly provided, the backend will validate consistency (tolerance of 1 minute for rounding).

2. **Day of week required for recurring:** If `recurrence` is `weekly`, `biweekly`, or `monthly`, then `day_of_week` is required. If `recurrence` is `one_time`, `day_of_week` should be NULL.

3. **Starts_on required for one-time:** If `recurrence` is `one_time`, then `starts_on` is required and must not be in the past.

4. **Latitude/longitude pairing:** If either `latitude` or `longitude` is provided, both must be provided.

5. **Child enrollment:** At least one child must be enrolled (via `child_ids`). All child IDs must belong to the same household as the activity.

6. **No time conflict validation for Milestone 1:** We will NOT enforce that a child cannot have overlapping activities. This is deferred to a future milestone where we add a schedule conflict warning (non-blocking).

---

### 5.6 ActivityChild -- **NEW**

| Field         | Rule                                                     |
| ------------- | -------------------------------------------------------- |
| `activity_id` | Required (FK)                                            |
| `child_id`    | Required (FK), unique within activity scope              |

**Business rules:**
- A child cannot be enrolled in the same activity twice (DB unique composite index + model uniqueness validation)

---

## 6. Missing Migrations

The following migrations are needed to complete the milestone. They should be created in this order.

### Migration 1: Add unique index on `users(provider, uid)`

```
AddProviderUidIndexToUsers
  - add_index :users, [:provider, :uid], unique: true, where: "provider IS NOT NULL"
```

**Rationale:** `User.from_omniauth` calls `find_or_create_by(provider, uid)`. Without a unique index, there is a race condition that could create duplicate OAuth records.

---

### Migration 2: Add unique composite index on `household_members(user_id, household_id)`

```
AddUniqueIndexToHouseholdMembers
  - add_index :household_members, [:user_id, :household_id], unique: true
```

**Rationale:** The model validates `uniqueness: { scope: :household_id }` but there is no DB-level constraint. The existing individual indexes on `user_id` and `household_id` remain for FK lookups.

---

### Migration 3: Remove `role` column from `household_members`

```
RemoveRoleFromHouseholdMembers
  - remove_column :household_members, :role, :string
```

**Rationale:** All members have equal access. The role column is unused and should be removed to avoid confusion.

---

### Migration 4: Create `activities` table

```
CreateActivities
  - create_table :activities do |t|
      t.references :household,    null: false, foreign_key: true
      t.string     :name,         null: false
      t.string     :location_name
      t.string     :address
      t.decimal    :latitude,     precision: 10, scale: 7
      t.decimal    :longitude,    precision: 10, scale: 7
      t.integer    :day_of_week
      t.time       :start_time,   null: false
      t.time       :end_time,     null: false
      t.integer    :duration_minutes, null: false
      t.string     :recurrence,   null: false, default: "weekly"
      t.date       :starts_on
      t.text       :notes
      t.timestamps
    end

    add_index :activities, :household_id
    add_index :activities, :day_of_week
    add_index :activities, [:household_id, :day_of_week]
```

---

### Migration 5: Create `activity_children` join table

```
CreateActivityChildren
  - create_table :activity_children do |t|
      t.references :activity, null: false, foreign_key: true
      t.references :child,    null: false, foreign_key: true
      t.timestamps
    end

    add_index :activity_children, [:activity_id, :child_id], unique: true
```

---

### Migration Summary

| #   | Name                                | Action                    |
| --- | ----------------------------------- | ------------------------- |
| 1   | `AddProviderUidIndexToUsers`        | Add unique partial index  |
| 2   | `AddUniqueIndexToHouseholdMembers`  | Add unique composite index|
| 3   | `RemoveRoleFromHouseholdMembers`    | Remove column             |
| 4   | `CreateActivities`                  | New table + indexes       |
| 5   | `CreateActivityChildren`            | New join table + indexes  |

---

## Appendix A: Full TypeScript Type Reference

For the frontend team to copy into a shared types file:

```typescript
// ==========================================
// Shared Props (every page)
// ==========================================

export interface SharedProps {
  auth: {
    user: AuthUser | null;
  };
  flash: {
    notice: string | null;
    alert: string | null;
  };
}

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  avatar_url: string | null;
}

// ==========================================
// Domain Models
// ==========================================

export interface Household {
  id: number;
  name: string;
}

export interface HouseholdMember {
  id: number;
  name: string;
  email: string;
  avatar_url: string | null;
}

export interface Child {
  id: number;
  first_name: string;
  date_of_birth: string;
  age: number;
}

export interface Activity {
  id: number;
  name: string;
  location_name: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  day_of_week: number | null;
  day_of_week_name: string | null;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  recurrence: "weekly" | "biweekly" | "monthly" | "one_time";
  starts_on: string | null;
  notes: string | null;
  children: ActivityChild[];
  created_at: string;
  updated_at: string;
}

export interface ActivityChild {
  id: number;
  first_name: string;
  age: number;
}

// ==========================================
// Page Props
// ==========================================

export interface HouseholdsShowProps extends SharedProps {
  household: Household;
  members: HouseholdMember[];
  children: Child[];
  errors?: Record<string, string[]>;
}

export interface HouseholdsNewProps extends SharedProps {
  errors: Record<string, string[]>;
}

export interface ActivitiesIndexProps extends SharedProps {
  household: Household;
  activities: Activity[];
  children: Child[];
}

export interface ActivitiesShowProps extends SharedProps {
  household: Household;
  activity: Activity;
  children: Child[];
}

export interface ActivitiesNewProps extends SharedProps {
  household: Household;
  children: Child[];
  activity: ActivityFormDefaults;
  errors?: Record<string, string[]>;
}

export interface ActivitiesEditProps extends SharedProps {
  household: Household;
  children: Child[];
  activity: Activity & { child_ids: number[] };
  errors?: Record<string, string[]>;
}

export interface ActivityFormDefaults {
  name: string;
  location_name: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  day_of_week: number | null;
  start_time: string;
  end_time: string;
  duration_minutes: number | null;
  recurrence: string;
  starts_on: string;
  notes: string;
  child_ids: number[];
}

// ==========================================
// Request Bodies
// ==========================================

export interface CreateHouseholdRequest {
  household: {
    name: string;
  };
}

export interface UpdateHouseholdRequest {
  household: {
    name: string;
  };
}

export interface AddMemberRequest {
  email: string;
}

export interface CreateChildRequest {
  child: {
    first_name: string;
    date_of_birth: string;
  };
}

export interface CreateActivityRequest {
  activity: {
    name: string;
    location_name?: string;
    address?: string;
    latitude?: number;
    longitude?: number;
    day_of_week?: number;
    start_time: string;
    end_time: string;
    duration_minutes: number;
    recurrence: "weekly" | "biweekly" | "monthly" | "one_time";
    starts_on?: string;
    notes?: string;
    child_ids: number[];
  };
}

export type UpdateActivityRequest = CreateActivityRequest;
export type UpdateChildRequest = CreateChildRequest;
```

---

## Appendix B: Day of Week Reference

| Value | Day       |
| ----- | --------- |
| 0     | Sunday    |
| 1     | Monday    |
| 2     | Tuesday   |
| 3     | Wednesday |
| 4     | Thursday  |
| 5     | Friday    |
| 6     | Saturday  |

This matches Ruby's `Date#wday` and JavaScript's `Date.getDay()`.
