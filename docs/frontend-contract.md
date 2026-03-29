# Hearth Frontend Architecture Contract

**Version:** 1.0
**Date:** 2026-03-28
**Status:** Draft
**Stack:** Rails 8.1 + Inertia.js 3 + React 19 + TypeScript 6 + Tailwind CSS 4

---

## Table of Contents

1. [Page Components](#1-page-components)
2. [Shared Components](#2-shared-components)
3. [TypeScript Interfaces](#3-typescript-interfaces)
4. [Routing & Navigation](#4-routing--navigation)
5. [State Management](#5-state-management)
6. [Accessibility Requirements](#6-accessibility-requirements)
7. [Styling Conventions](#7-styling-conventions)

---

## 1. Page Components

All page components live under `app/frontend/pages/` and are resolved by Inertia via the glob pattern in `app/frontend/entrypoints/application.tsx`. The Inertia page name (e.g., `"Households/Show"`) maps directly to the file path (e.g., `pages/Households/Show.tsx`).

Every page component receives the shared Inertia props injected by `ApplicationController#inertia_share`:

```
auth: { user: User | null }
flash: { notice?: string; alert?: string }
```

These shared props are available on every page via `usePage()` and are NOT repeated in the per-page prop tables below.

---

### 1.1 Auth/SignIn.tsx

**File:** `app/frontend/pages/Auth/SignIn.tsx`
**Layout:** `AuthLayout` (no navigation bar, centered card)
**Auth required:** No (this is the unauthenticated landing page)

| Prop | Type | Description |
|------|------|-------------|
| _none beyond shared props_ | | |

**Renders:**
- Hearth logo and tagline
- "Sign in with Google" button that initiates OAuth via `POST /users/auth/google_oauth2`
- The sign-in button must submit a form (not a simple link) to include the CSRF token, consistent with `omniauth-rails_csrf_protection`

**User actions:**
| Action | Mechanism | Target |
|--------|-----------|--------|
| Sign in with Google | Form POST | `/users/auth/google_oauth2` |

**Notes:**
- The CSRF token must be included. Use a hidden form with `method="post"` and an `authenticity_token` hidden input sourced from the `<meta>` tag, or use Inertia's `router.post()`.
- On successful OAuth, Devise handles the redirect server-side (typically to `root_path`). No client-side redirect logic is needed.
- Flash alerts (e.g., "Authentication failed") are displayed via the `AuthLayout`.

---

### 1.2 Households/Show.tsx

**File:** `app/frontend/pages/Households/Show.tsx`
**Layout:** `AppLayout`
**Auth required:** Yes

| Prop | Type | Description |
|------|------|-------------|
| `household` | `Household` | The current household (`{ id, name }`) |
| `members` | `Member[]` | All users in the household |
| `children` | `Child[]` | All children in the household |
| `errors` | `Record<string, string[]> \| undefined` | Validation errors (present on failed update) |

**Renders:**
- Household name as page heading
- Summary cards: member count, children count
- Quick-glance list of members (avatar, name)
- Quick-glance list of children (name, age)
- Navigation links to Settings page and Activities page

**User actions:**
| Action | Mechanism | Target |
|--------|-----------|--------|
| Navigate to Settings | Inertia `Link` | `/households/:id` (Settings tab/page) |
| Navigate to Activities | Inertia `Link` | `/households/:id/activities` |

---

### 1.3 Households/New.tsx

**File:** `app/frontend/pages/Households/New.tsx`
**Layout:** `AppLayout`
**Auth required:** Yes

| Prop | Type | Description |
|------|------|-------------|
| `errors` | `Record<string, string[]> \| undefined` | Validation errors from a failed create |

**Renders:**
- Page heading: "Create Your Household"
- Form with a single text input for household name
- Submit button: "Create Household"

**User actions:**
| Action | Mechanism | Target |
|--------|-----------|--------|
| Submit form | Inertia `useForm` + `post()` | `POST /households` |

**Notes:**
- This page is shown to first-time users who have authenticated but do not yet belong to a household.
- On success, the server redirects to `Households/Show`.

---

### 1.4 Households/Settings.tsx

**File:** `app/frontend/pages/Households/Settings.tsx`
**Layout:** `AppLayout`
**Auth required:** Yes

| Prop | Type | Description |
|------|------|-------------|
| `household` | `Household` | The current household |
| `members` | `Member[]` | All members of the household |
| `children` | `Child[]` | All children in the household |
| `errors` | `Record<string, string[]> \| undefined` | Validation errors |

**Renders:**
- **Household Name section:** Inline-editable name with save button
- **Members section:** `MemberList` component showing current members with remove buttons; `MemberInviteForm` to add by email
- **Children section:** `ChildList` component showing children with edit/remove; `ChildForm` to add a new child

**User actions:**
| Action | Mechanism | Target |
|--------|-----------|--------|
| Update household name | Inertia `useForm` + `patch()` | `PATCH /households/:id` |
| Invite member by email | Inertia `useForm` + `post()` | `POST /households/:id/household_members` |
| Remove member | Inertia `router.delete()` after `ConfirmDialog` | `DELETE /households/:id/household_members/:user_id` |
| Add child | Inertia `useForm` + `post()` | `POST /households/:id/children` |
| Edit child | Inertia `useForm` + `patch()` | `PATCH /households/:id/children/:id` |
| Remove child | Inertia `router.delete()` after `ConfirmDialog` | `DELETE /households/:id/children/:id` |

**Notes:**
- The Settings page is a new Inertia page that requires a new `settings` action in `HouseholdsController`. The backend team must add `def settings` rendering `"Households/Settings"` with the same props shape as `show`.
- Alternatively, Settings can be rendered client-side as a tabbed view on `Households/Show` using the same props. Coordinate with backend on preferred approach. The contract assumes a dedicated page.

---

### 1.5 Activities/Index.tsx

**File:** `app/frontend/pages/Activities/Index.tsx`
**Layout:** `AppLayout`
**Auth required:** Yes

| Prop | Type | Description |
|------|------|-------------|
| `household` | `Household` | The current household (for context/breadcrumbs) |
| `activities` | `Activity[]` | All activities for the household |
| `weekStart` | `string` (ISO 8601 date) | The Monday of the currently viewed week |

**Renders:**
- Week navigation header: left/right arrows to change week, "Today" button to reset
- `WeeklyCalendar` component showing 7 day columns (Mon-Sun) with `ActivityCard` entries slotted by `day_of_week` and sorted by `start_time`
- Floating action button (FAB) or "Add Activity" button linking to `Activities/New`

**User actions:**
| Action | Mechanism | Target |
|--------|-----------|--------|
| Navigate previous week | Inertia `router.get()` with `week_start` param | `GET /households/:id/activities?week_start=YYYY-MM-DD` |
| Navigate next week | Inertia `router.get()` with `week_start` param | Same |
| Jump to current week | Inertia `router.get()` without param | `GET /households/:id/activities` |
| View activity details | Open `Modal` with activity details | Client-side |
| Edit activity | Inertia `Link` | `GET /households/:id/activities/:id/edit` |
| Delete activity | Inertia `router.delete()` after `ConfirmDialog` | `DELETE /households/:id/activities/:id` |
| Add new activity | Inertia `Link` | `GET /households/:id/activities/new` |

**Notes:**
- The Activity model does not yet exist in the database. The backend team must create the `activities` table, model, and controller. This contract defines the expected prop shape (see Section 3).
- Week navigation is server-driven: each week change triggers an Inertia visit with a `week_start` query parameter.

---

### 1.6 Activities/New.tsx

**File:** `app/frontend/pages/Activities/New.tsx`
**Layout:** `AppLayout`
**Auth required:** Yes

| Prop | Type | Description |
|------|------|-------------|
| `household` | `Household` | The current household |
| `children` | `Child[]` | Children available for assignment |
| `errors` | `Record<string, string[]> \| undefined` | Validation errors |

**Renders:**
- Page heading: "New Activity"
- `ActivityForm` component (see Section 2) pre-populated with empty defaults
- Cancel link back to `Activities/Index`

**User actions:**
| Action | Mechanism | Target |
|--------|-----------|--------|
| Submit form | Inertia `useForm` + `post()` | `POST /households/:id/activities` |
| Cancel | Inertia `Link` | `GET /households/:id/activities` |
| Pick location | `LocationPicker` component (see Section 2) | Client-side state |

---

### 1.7 Activities/Edit.tsx

**File:** `app/frontend/pages/Activities/Edit.tsx`
**Layout:** `AppLayout`
**Auth required:** Yes

| Prop | Type | Description |
|------|------|-------------|
| `household` | `Household` | The current household |
| `activity` | `Activity` | The activity being edited |
| `children` | `Child[]` | Children available for assignment |
| `errors` | `Record<string, string[]> \| undefined` | Validation errors |

**Renders:**
- Page heading: "Edit Activity"
- `ActivityForm` component pre-populated with existing activity data
- Cancel link back to `Activities/Index`
- Delete button (with confirmation)

**User actions:**
| Action | Mechanism | Target |
|--------|-----------|--------|
| Submit form | Inertia `useForm` + `patch()` | `PATCH /households/:id/activities/:id` |
| Cancel | Inertia `Link` | `GET /households/:id/activities` |
| Delete | Inertia `router.delete()` after `ConfirmDialog` | `DELETE /households/:id/activities/:id` |
| Pick location | `LocationPicker` component | Client-side state |

---

## 2. Shared Components

All shared components live under `app/frontend/components/`. Each component is a named export from its own file. Components are organized by domain subdirectory.

---

### 2.1 Layout Components

#### `AppLayout`

**File:** `app/frontend/layouts/AppLayout.tsx` (already exists)
**Props:**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `children` | `React.ReactNode` | Yes | Page content |

**Behavior:**
- Renders top navigation bar with Hearth logo, user avatar/name, sign-out link
- Renders flash messages (notice/alert) from shared Inertia props
- Wraps children in a max-width content container
- Sign-out link must use Inertia `router.delete('/users/sign_out')` or a `Link` with `method="delete"` instead of `data-method` (Inertia does not use Rails UJS)
- **Navigation links to add:** Household dashboard, Activities, Settings

**Enhancement needed:** The existing `AppLayout` uses an `<a>` tag with `data-method="delete"` for sign-out. This must be converted to an Inertia-compatible approach since the app does not include Rails UJS.

#### `AuthLayout`

**File:** `app/frontend/layouts/AuthLayout.tsx`
**Props:**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `children` | `React.ReactNode` | Yes | Page content |

**Behavior:**
- Full-viewport centered layout with no navigation bar
- Displays flash messages (alert only, since notice is unlikely pre-auth)
- Minimal branding: Hearth logo centered above the content card
- Background: `bg-stone-100` for visual distinction from the app layout

---

### 2.2 Form Components

All form components live under `app/frontend/components/form/`.

#### `Input`

**File:** `app/frontend/components/form/Input.tsx`

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `label` | `string` | Yes | Visible label text |
| `name` | `string` | Yes | Input name attribute and `htmlFor` target |
| `type` | `string` | No | Input type (default: `"text"`) |
| `value` | `string` | Yes | Controlled value |
| `onChange` | `(value: string) => void` | Yes | Change handler (receives value, not event) |
| `error` | `string \| undefined` | No | Validation error message |
| `placeholder` | `string` | No | Placeholder text |
| `required` | `boolean` | No | Marks field as required |
| `disabled` | `boolean` | No | Disables the input |
| `autoFocus` | `boolean` | No | Auto-focus on mount |

**Behavior:**
- Renders a `<label>` and `<input>` pair
- Displays error message below the input in red when present
- Applies error styling (red border) to the input when `error` is set
- Label includes a red asterisk when `required` is true

#### `Select`

**File:** `app/frontend/components/form/Select.tsx`

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `label` | `string` | Yes | Visible label text |
| `name` | `string` | Yes | Select name attribute |
| `value` | `string` | Yes | Controlled value |
| `onChange` | `(value: string) => void` | Yes | Change handler |
| `options` | `{ value: string; label: string }[]` | Yes | Available options |
| `error` | `string \| undefined` | No | Validation error message |
| `placeholder` | `string` | No | Placeholder/default option text |
| `required` | `boolean` | No | Marks field as required |
| `disabled` | `boolean` | No | Disables the select |

#### `Button`

**File:** `app/frontend/components/form/Button.tsx`

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `children` | `React.ReactNode` | Yes | Button content |
| `type` | `"button" \| "submit" \| "reset"` | No | Button type (default: `"button"`) |
| `variant` | `"primary" \| "secondary" \| "danger" \| "ghost"` | No | Visual variant (default: `"primary"`) |
| `size` | `"sm" \| "md" \| "lg"` | No | Size variant (default: `"md"`) |
| `disabled` | `boolean` | No | Disables the button |
| `loading` | `boolean` | No | Shows loading spinner and disables |
| `onClick` | `() => void` | No | Click handler |
| `fullWidth` | `boolean` | No | Expands to full container width |

**Variant styles:**
- `primary`: `bg-amber-600 text-white hover:bg-amber-700` (Hearth brand warmth)
- `secondary`: `bg-stone-100 text-stone-700 hover:bg-stone-200`
- `danger`: `bg-red-600 text-white hover:bg-red-700`
- `ghost`: `bg-transparent text-stone-600 hover:bg-stone-100`

#### `DatePicker`

**File:** `app/frontend/components/form/DatePicker.tsx`

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `label` | `string` | Yes | Visible label text |
| `name` | `string` | Yes | Input name attribute |
| `value` | `string` | Yes | ISO date string (YYYY-MM-DD) |
| `onChange` | `(value: string) => void` | Yes | Change handler |
| `error` | `string \| undefined` | No | Validation error message |
| `min` | `string` | No | Minimum selectable date |
| `max` | `string` | No | Maximum selectable date |
| `required` | `boolean` | No | Marks as required |

**Behavior:**
- Uses native `<input type="date">` for broadest accessibility and mobile support
- Falls back gracefully on browsers without native date picker support

#### `TimePicker`

**File:** `app/frontend/components/form/TimePicker.tsx`

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `label` | `string` | Yes | Visible label text |
| `name` | `string` | Yes | Input name attribute |
| `value` | `string` | Yes | Time string (HH:MM, 24-hour) |
| `onChange` | `(value: string) => void` | Yes | Change handler |
| `error` | `string \| undefined` | No | Validation error message |
| `required` | `boolean` | No | Marks as required |

**Behavior:**
- Uses native `<input type="time">` for broadest accessibility and mobile support

---

### 2.3 Household Components

All household components live under `app/frontend/components/household/`.

#### `MemberList`

**File:** `app/frontend/components/household/MemberList.tsx`

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `members` | `Member[]` | Yes | Household members to display |
| `householdId` | `number` | Yes | Household ID (for action URLs) |
| `currentUserId` | `number` | Yes | Logged-in user's ID (to prevent self-removal) |
| `onRemove` | `(userId: number) => void` | Yes | Remove member callback |

**Behavior:**
- Renders a list of members with avatar, name, and email
- Each member (except the current user) has a "Remove" button
- Remove triggers `ConfirmDialog` before calling `onRemove`
- Empty state: should not occur (household always has at least one member)

#### `MemberInviteForm`

**File:** `app/frontend/components/household/MemberInviteForm.tsx`

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `householdId` | `number` | Yes | Household ID for the POST target |

**Behavior:**
- Single email input with "Invite" button
- Uses Inertia `useForm` internally to manage form state
- Submits `POST /households/:id/household_members` with `{ email }`
- Clears input on success (detected via `useForm` `wasSuccessful`)
- Displays inline error if the server returns one

#### `ChildList`

**File:** `app/frontend/components/household/ChildList.tsx`

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `children` | `Child[]` | Yes | Children to display |
| `householdId` | `number` | Yes | Household ID for action URLs |
| `onEdit` | `(child: Child) => void` | Yes | Edit callback (opens ChildForm in edit mode) |
| `onRemove` | `(childId: number) => void` | Yes | Remove callback |

**Behavior:**
- Renders a list of children with name, age, and date of birth
- Each child has "Edit" and "Remove" buttons
- Remove triggers `ConfirmDialog` before calling `onRemove`
- Empty state: "No children added yet" message

#### `ChildForm`

**File:** `app/frontend/components/household/ChildForm.tsx`

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `householdId` | `number` | Yes | Household ID for the POST/PATCH target |
| `child` | `Child \| null` | No | Existing child for edit mode; null for create mode |
| `onCancel` | `() => void` | Yes | Cancel callback (closes/resets form) |

**Behavior:**
- Two fields: `first_name` (text input) and `date_of_birth` (date picker)
- Uses Inertia `useForm` internally
- In create mode: `POST /households/:id/children`
- In edit mode: `PATCH /households/:id/children/:child_id`
- Calls `onCancel` to collapse the form after success or user cancellation

---

### 2.4 Activity Components

All activity components live under `app/frontend/components/activity/`.

#### `WeeklyCalendar`

**File:** `app/frontend/components/activity/WeeklyCalendar.tsx`

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `activities` | `Activity[]` | Yes | Activities for the current week |
| `weekStart` | `string` | Yes | ISO date of the Monday of the displayed week |
| `onActivityClick` | `(activity: Activity) => void` | Yes | Callback when an activity card is clicked |

**Behavior:**
- Renders a 7-column grid (Mon through Sun), each column headed by the day name and date
- Activities are placed in their respective day column based on `day_of_week` (0=Monday, 6=Sunday)
- Within each day, activities are sorted by `start_time`
- Each activity renders as an `ActivityCard`
- Highlights "today" column with a subtle visual indicator (`bg-amber-50` border or background accent)
- Responsive: on mobile (< `md` breakpoint), collapses to a vertically stacked day-by-day list

#### `ActivityCard`

**File:** `app/frontend/components/activity/ActivityCard.tsx`

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `activity` | `Activity` | Yes | Activity to display |
| `onClick` | `() => void` | Yes | Click handler |

**Behavior:**
- Compact card showing: activity name, time range, location name (if set), assigned child name(s)
- Color-coded left border or background based on activity category (if categories are introduced) or a default amber accent
- Truncates long names with ellipsis
- Entire card is clickable (acts as a button for accessibility)

#### `ActivityForm`

**File:** `app/frontend/components/activity/ActivityForm.tsx`

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `activity` | `Activity \| null` | No | Existing activity for edit mode; null for create |
| `householdId` | `number` | Yes | Household ID for form action URL |
| `children` | `Child[]` | Yes | Available children for assignment |
| `errors` | `Record<string, string[]> \| undefined` | No | Server validation errors |
| `onCancel` | `() => void` | Yes | Cancel callback |

**Behavior:**
- Fields:
  - `name` (text Input, required)
  - `day_of_week` (Select: Monday-Sunday, required)
  - `start_time` (TimePicker, required)
  - `end_time` (TimePicker, required)
  - `recurring` (checkbox: whether this repeats weekly)
  - `location_name` (text Input, optional)
  - `location_address` (text Input, populated by LocationPicker, optional)
  - `latitude` / `longitude` (hidden fields, populated by LocationPicker)
  - `child_ids` (multi-select or checkbox group of household children, optional)
  - `notes` (textarea, optional)
- Embeds `LocationPicker` component for geolocation
- Uses Inertia `useForm` internally
- Create mode: `POST /households/:id/activities`
- Edit mode: `PATCH /households/:id/activities/:id`
- Validates `end_time > start_time` client-side before submit

#### `LocationPicker`

**File:** `app/frontend/components/activity/LocationPicker.tsx`

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `locationName` | `string` | Yes | Current location name value |
| `locationAddress` | `string` | Yes | Current address value |
| `latitude` | `number \| null` | Yes | Current latitude |
| `longitude` | `number \| null` | Yes | Current longitude |
| `onChange` | `(location: LocationData) => void` | Yes | Callback with updated location data |

Where `LocationData` is:
```typescript
interface LocationData {
  location_name: string
  location_address: string
  latitude: number | null
  longitude: number | null
}
```

**Behavior:**
- "Use Current Location" button that triggers Browser Geolocation API
- On geolocation success: populates `latitude`, `longitude`, and optionally reverse-geocodes to fill `location_address` (reverse geocoding is a stretch goal; initially just stores coordinates)
- Manual text entry for `location_name` and `location_address` as fallback
- Displays geolocation permission state: idle, requesting, granted, denied
- If denied: shows helpful message about enabling location permissions
- Does NOT depend on any external mapping library (no Google Maps, Mapbox, etc.) for MVP. Uses the browser Geolocation API only.

---

### 2.5 Feedback Components

All feedback components live under `app/frontend/components/feedback/`.

#### `Flash`

**File:** `app/frontend/components/feedback/Flash.tsx`

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `notice` | `string \| undefined` | No | Success message |
| `alert` | `string \| undefined` | No | Error/warning message |

**Behavior:**
- Renders a dismissible banner at the top of the page content area
- Notice: green background (`bg-green-50 text-green-800 border-green-200`)
- Alert: red background (`bg-red-50 text-red-800 border-red-200`)
- Auto-dismisses after 5 seconds with a fade-out transition
- Dismiss button (X icon) for manual dismissal
- Announced to screen readers via `role="status"` (notice) or `role="alert"` (alert)

**Notes:** This component should be extracted from the current inline flash rendering in `AppLayout` to make it reusable and add dismissal/auto-dismiss behavior.

#### `Modal`

**File:** `app/frontend/components/feedback/Modal.tsx`

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `open` | `boolean` | Yes | Controls visibility |
| `onClose` | `() => void` | Yes | Close callback |
| `title` | `string` | Yes | Modal heading |
| `children` | `React.ReactNode` | Yes | Modal body content |
| `size` | `"sm" \| "md" \| "lg"` | No | Width variant (default: `"md"`) |

**Behavior:**
- Renders a backdrop overlay (`bg-black/50`) with a centered dialog panel
- Closes on backdrop click, Escape key press, and close button click
- Traps focus within the modal when open (see Section 6 for focus management details)
- Uses `<dialog>` element or `role="dialog"` with `aria-modal="true"`
- Animates in/out with a fade + scale transition

#### `ConfirmDialog`

**File:** `app/frontend/components/feedback/ConfirmDialog.tsx`

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `open` | `boolean` | Yes | Controls visibility |
| `onConfirm` | `() => void` | Yes | Confirm callback |
| `onCancel` | `() => void` | Yes | Cancel callback |
| `title` | `string` | Yes | Dialog heading |
| `message` | `string` | Yes | Descriptive text |
| `confirmLabel` | `string` | No | Confirm button text (default: `"Confirm"`) |
| `variant` | `"danger" \| "default"` | No | Controls confirm button style (default: `"default"`) |

**Behavior:**
- Built on top of `Modal` with a fixed two-button footer (Cancel + Confirm)
- When `variant="danger"`, confirm button uses `Button` variant `"danger"`
- Focus is placed on the Cancel button when opened (safe default to prevent accidental destructive action)

---

## 3. TypeScript Interfaces

All shared types live in `app/frontend/types/index.ts` and are imported as `@/types` throughout the app.

```typescript
// ============================================================
// Core Domain Types
// ============================================================

/** Matches ApplicationController#inertia_share -> auth.user */
export interface User {
  id: number
  name: string
  email: string
  avatar_url: string | null
}

/** Matches HouseholdsController#household_props */
export interface Household {
  id: number
  name: string
}

/**
 * Matches HouseholdsController#user_props
 * Represents a user in the context of household membership.
 */
export interface Member {
  id: number
  name: string
  email: string
  avatar_url: string | null
}

/** Matches HouseholdsController#child_props */
export interface Child {
  id: number
  first_name: string
  date_of_birth: string // ISO 8601 date (YYYY-MM-DD)
  age: number           // Computed by Child#age on the server
}

/**
 * Activity (to be created by backend).
 * Expected shape for ActivitiesController props.
 */
export interface Activity {
  id: number
  name: string
  day_of_week: number           // 0 = Monday, 6 = Sunday
  start_time: string            // HH:MM (24-hour)
  end_time: string              // HH:MM (24-hour)
  recurring: boolean
  location_name: string | null
  location_address: string | null
  latitude: number | null
  longitude: number | null
  notes: string | null
  child_ids: number[]
  children: Pick<Child, 'id' | 'first_name'>[] // Nested child summaries
  household_id: number
  created_at: string            // ISO 8601 datetime
  updated_at: string            // ISO 8601 datetime
}

// ============================================================
// Form Data Types (for Inertia useForm)
// ============================================================

export interface HouseholdFormData {
  name: string
}

export interface MemberInviteFormData {
  email: string
}

export interface ChildFormData {
  first_name: string
  date_of_birth: string
}

export interface ActivityFormData {
  name: string
  day_of_week: number
  start_time: string
  end_time: string
  recurring: boolean
  location_name: string
  location_address: string
  latitude: number | null
  longitude: number | null
  notes: string
  child_ids: number[]
}

// ============================================================
// Location
// ============================================================

export interface LocationData {
  location_name: string
  location_address: string
  latitude: number | null
  longitude: number | null
}

// ============================================================
// Inertia Shared Props
// ============================================================

/** Shape of the shared props injected by ApplicationController on every request */
export interface SharedProps {
  auth: {
    user: User | null
  }
  flash: {
    notice?: string
    alert?: string
  }
}

// ============================================================
// Page-Specific Props
// ============================================================

export interface SignInPageProps extends SharedProps {
  // No additional props
}

export interface HouseholdShowPageProps extends SharedProps {
  household: Household
  members: Member[]
  children: Child[]
  errors?: Record<string, string[]>
}

export interface HouseholdNewPageProps extends SharedProps {
  errors?: Record<string, string[]>
}

export interface HouseholdSettingsPageProps extends SharedProps {
  household: Household
  members: Member[]
  children: Child[]
  errors?: Record<string, string[]>
}

export interface ActivitiesIndexPageProps extends SharedProps {
  household: Household
  activities: Activity[]
  weekStart: string // ISO 8601 date
}

export interface ActivityNewPageProps extends SharedProps {
  household: Household
  children: Child[]
  errors?: Record<string, string[]>
}

export interface ActivityEditPageProps extends SharedProps {
  household: Household
  activity: Activity
  children: Child[]
  errors?: Record<string, string[]>
}
```

---

## 4. Routing & Navigation

### 4.1 Route Map

The table below maps Rails routes to Inertia page components. Routes marked with **[NEW]** require backend work to create the controller action and/or resource.

| HTTP Method | Path | Rails Action | Inertia Page Component | Auth Required |
|-------------|------|--------------|----------------------|---------------|
| GET | `/users/sign_in` | Devise session (override) | `Auth/SignIn` | No |
| POST | `/users/auth/google_oauth2` | OmniAuth callback | (server redirect) | No |
| DELETE | `/users/sign_out` | Devise session destroy | (server redirect to sign-in) | Yes |
| GET | `/households/:id` | `households#show` | `Households/Show` | Yes |
| GET | `/households/new` | `households#new` **[NEW]** | `Households/New` | Yes |
| POST | `/households` | `households#create` | (redirect on success) | Yes |
| PATCH | `/households/:id` | `households#update` | (redirect on success) | Yes |
| GET | `/households/:id/settings` | `households#settings` **[NEW]** | `Households/Settings` | Yes |
| POST | `/households/:id/household_members` | `household_members#create` | (redirect on success) | Yes |
| DELETE | `/households/:id/household_members/:id` | `household_members#destroy` | (redirect on success) | Yes |
| POST | `/households/:id/children` | `children#create` | (redirect on success) | Yes |
| PATCH | `/households/:id/children/:id` | `children#update` | (redirect on success) | Yes |
| DELETE | `/households/:id/children/:id` | `children#destroy` | (redirect on success) | Yes |
| GET | `/households/:id/activities` **[NEW]** | `activities#index` **[NEW]** | `Activities/Index` | Yes |
| GET | `/households/:id/activities/new` **[NEW]** | `activities#new` **[NEW]** | `Activities/New` | Yes |
| POST | `/households/:id/activities` **[NEW]** | `activities#create` **[NEW]** | (redirect on success) | Yes |
| GET | `/households/:id/activities/:id/edit` **[NEW]** | `activities#edit` **[NEW]** | `Activities/Edit` | Yes |
| PATCH | `/households/:id/activities/:id` **[NEW]** | `activities#update` **[NEW]** | (redirect on success) | Yes |
| DELETE | `/households/:id/activities/:id` **[NEW]** | `activities#destroy` **[NEW]** | (redirect on success) | Yes |

### 4.2 Suggested Route Changes (config/routes.rb)

```ruby
# Add to config/routes.rb:
resources :households, only: [:show, :new, :create, :update] do
  member do
    get :settings
  end
  resources :household_members, only: [:create, :destroy]
  resources :children, only: [:create, :update, :destroy]
  resources :activities  # [NEW] full CRUD
end
```

### 4.3 Navigation Structure

**AppLayout navigation bar:**

| Link | Target | Visible When |
|------|--------|-------------|
| Hearth (logo/home) | `/households/:id` | Always (when authenticated) |
| Activities | `/households/:id/activities` | Always (when authenticated) |
| Settings | `/households/:id/settings` | Always (when authenticated) |
| Sign out | `DELETE /users/sign_out` | Always (when authenticated) |

The household ID for navigation links is derived from `auth.user`'s current household context. The implementation must resolve the correct household ID. Options:
1. Include `current_household_id` in the shared Inertia props (recommended)
2. Derive from the current page's `household` prop when available

**Recommendation:** Add `current_household_id: number | null` to `SharedProps.auth` so that navigation links always have the correct household ID regardless of the current page.

### 4.4 Auth Guards

- **Unauthenticated users:** Devise's `before_action :authenticate_user!` in `ApplicationController` handles server-side redirects. Unauthenticated requests to protected routes will redirect to the sign-in page.
- **Auth/SignIn page:** Must skip the `authenticate_user!` before action. The Devise sessions controller handles this. Ensure the Inertia page is rendered for `GET /users/sign_in`.
- **Post-auth redirect:** After successful Google OAuth, Devise redirects to `root_path` (which is `households#show`). If the user has no household, the `households#show` action should detect this and redirect to `households#new`.
- **No client-side route guards are needed.** All auth enforcement happens server-side via Devise + the `before_action`. Inertia preserves this model.

---

## 5. State Management

### 5.1 General Principle

Hearth follows the Inertia.js philosophy: **the server is the source of truth.** There is no client-side store (no Redux, Zustand, or React Context for data). Page props provided by the server are the canonical state. Mutations happen via Inertia form submissions that trigger server-side redirects with fresh props.

### 5.2 Form State (Inertia useForm)

All forms use the `useForm` hook from `@inertiajs/react`:

```typescript
const { data, setData, post, patch, processing, errors, wasSuccessful, reset } = useForm<T>(initialValues)
```

**Conventions:**
- `processing` is used to disable submit buttons and show loading states
- `errors` from `useForm` maps server-returned validation errors to field names
- `wasSuccessful` is used to trigger post-submission side effects (e.g., clearing an invite form)
- `reset()` is called to clear the form after a successful inline submission (e.g., adding a child without navigating away)
- The `preserveScroll: true` option should be passed to `post()`/`patch()`/`delete()` for inline operations on the Settings page to avoid jarring scroll-to-top behavior

### 5.3 Geolocation State

Geolocation is managed locally within the `LocationPicker` component via `useState` and `useEffect`.

**State machine:**

```
idle -> requesting -> granted (coordinates received)
                   -> denied (user denied permission)
                   -> error (geolocation API error)
```

| State | UI |
|-------|-----|
| `idle` | "Use Current Location" button enabled |
| `requesting` | Button disabled, spinner shown |
| `granted` | Coordinates displayed, address field auto-populated if reverse geocoding is available |
| `denied` | Warning message with instructions to enable location in browser settings |
| `error` | Generic error message with retry button |

**Implementation notes:**
- Use `navigator.geolocation.getCurrentPosition()` (not `watchPosition`)
- Set a timeout of 10 seconds via the `options` parameter
- Coordinates are passed to the parent `ActivityForm` via the `onChange` callback; they are not stored in any global state
- The geolocation permission check can use the Permissions API (`navigator.permissions.query({ name: 'geolocation' })`) to pre-check status on component mount, but this is optional since browser support varies

### 5.4 Flash Message State

Flash messages flow from the server via shared Inertia props (`flash.notice`, `flash.alert`). The `Flash` component manages its own visibility state:

- On receiving new flash props (detected via `useEffect` on the flash values), the component becomes visible
- A 5-second timer starts for auto-dismiss
- User can manually dismiss via the close button
- Internal state: `visible: boolean` managed with `useState`

### 5.5 Modal and Dialog State

Modals and confirm dialogs use local `useState` in the parent component:

```typescript
const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
```

There is no global modal state manager. Each modal instance is controlled by the component that triggers it.

### 5.6 Weekly Calendar Navigation State

The currently viewed week is server-driven via the `weekStart` prop. Navigating between weeks triggers an Inertia `router.get()` request with an updated `week_start` query parameter. No client-side date state is needed beyond what the server provides.

---

## 6. Accessibility Requirements

Hearth targets **WCAG 2.1 Level AA** compliance across all components.

### 6.1 Semantic HTML

- Use native HTML elements wherever possible: `<button>`, `<a>`, `<input>`, `<select>`, `<label>`, `<form>`, `<nav>`, `<main>`, `<header>`, `<dialog>`
- Never use `<div>` or `<span>` as interactive elements. Use `<button>` for actions, `<a>` for navigation.
- All `<img>` elements must have an `alt` attribute. Decorative images use `alt=""`.

### 6.2 Keyboard Navigation

| Component | Keyboard Behavior |
|-----------|------------------|
| `Button` | Focusable, activated with Enter and Space |
| `Input`, `Select`, `DatePicker`, `TimePicker` | Standard browser keyboard behavior via native elements |
| `Modal` | Focus trap: Tab cycles within modal; Escape closes modal |
| `ConfirmDialog` | Same as Modal; initial focus on Cancel button |
| `ActivityCard` | Focusable (`tabIndex={0}`), activated with Enter and Space |
| `WeeklyCalendar` | Arrow keys navigate between day columns (stretch goal); Tab moves between activity cards |
| `MemberList` / `ChildList` | Tab navigates between list items and their action buttons |
| `Flash` | Dismiss button focusable; auto-dismiss does not steal focus |
| Navigation links | Standard anchor/Link keyboard behavior |
| Sign-in button | Focusable, activated with Enter and Space |

### 6.3 ARIA Attributes

| Component | Required ARIA |
|-----------|--------------|
| `AppLayout` nav | `<nav aria-label="Main navigation">` |
| `Modal` | `role="dialog"`, `aria-modal="true"`, `aria-labelledby` pointing to title |
| `ConfirmDialog` | `role="alertdialog"`, `aria-modal="true"`, `aria-labelledby`, `aria-describedby` pointing to message |
| `Flash` (notice) | `role="status"`, `aria-live="polite"` |
| `Flash` (alert) | `role="alert"`, `aria-live="assertive"` |
| `Input` (with error) | `aria-invalid="true"`, `aria-describedby` pointing to error message element |
| `Select` (with error) | Same as Input |
| `Button` (loading) | `aria-busy="true"`, `aria-disabled="true"` |
| `ActivityCard` | `role="button"`, `tabIndex={0}` (since it is a clickable div) |
| `WeeklyCalendar` columns | `role="list"` for each day column; `role="listitem"` for each activity |
| Required fields | `aria-required="true"` on the input (redundant with `required` attribute but belt-and-suspenders) |

### 6.4 Focus Management

- **Modal open:** Move focus to the first focusable element inside the modal (or the close button). For `ConfirmDialog`, focus the Cancel button.
- **Modal close:** Return focus to the element that triggered the modal opening. Store a ref to the trigger element before opening.
- **Flash auto-dismiss:** Do NOT move focus when the flash disappears.
- **Form submission (Inertia):** After a server response with validation errors, move focus to the first field with an error. Implement via a `useEffect` that watches `errors` and calls `.focus()` on the first errored input.
- **Page navigation (Inertia):** Inertia handles scroll reset. No custom focus management needed for page transitions (the browser default of focusing `<body>` is acceptable, though focusing `<main>` or the `<h1>` is a recommended enhancement).

### 6.5 Color Contrast

All text/background combinations must meet **4.5:1** contrast ratio for normal text and **3:1** for large text (18px+ or 14px+ bold).

| Usage | Foreground | Background | Ratio | Passes |
|-------|-----------|------------|-------|--------|
| Body text | `stone-800` (#292524) | `stone-50` (#fafaf9) | 14.7:1 | Yes |
| Secondary text | `stone-600` (#57534e) | `stone-50` (#fafaf9) | 7.2:1 | Yes |
| Muted text | `stone-400` (#a8a29e) | `white` (#ffffff) | 3.0:1 | **Fails for small text** |
| Primary button text | `white` (#ffffff) | `amber-600` (#d97706) | 3.5:1 | **Fails for small text** |
| Danger button text | `white` (#ffffff) | `red-600` (#dc2626) | 4.6:1 | Yes |
| Flash notice text | `green-800` (#166534) | `green-50` (#f0fdf4) | 9.3:1 | Yes |
| Flash alert text | `red-800` (#991b1b) | `red-50` (#fef2f2) | 10.1:1 | Yes |

**Required fixes (must address before shipping):**
1. **Muted text (`stone-400` on white):** Change sign-out link and similar muted text to `stone-500` (#78716c, ratio ~4.6:1) to meet AA for normal text.
2. **Primary button (`amber-600` background):** Either darken to `amber-700` (#b45309, ~5.0:1 with white) or use dark text (`amber-900` on `amber-600`). Recommended: use `amber-700` as the primary button background with white text.

### 6.6 Motion and Reduced Motion

- All animations (modal fade/scale, flash auto-dismiss fade) must respect `prefers-reduced-motion: reduce`
- When reduced motion is preferred: skip transitions, show/hide instantly
- Tailwind utility: use `motion-safe:` prefix for transition classes (e.g., `motion-safe:transition-opacity`)

---

## 7. Styling Conventions

### 7.1 Design Tokens / Color Palette

Hearth uses the Tailwind CSS `stone` palette as its neutral base and `amber` as its brand accent, evoking warmth and home.

| Role | Tailwind Token | Hex | Usage |
|------|---------------|-----|-------|
| Background (page) | `stone-50` | #fafaf9 | Page background |
| Background (surface) | `white` | #ffffff | Cards, nav, modals |
| Border (default) | `stone-200` | #e7e5e4 | Card borders, dividers |
| Text (primary) | `stone-800` | #292524 | Headings, body text |
| Text (secondary) | `stone-600` | #57534e | Descriptions, labels |
| Text (muted) | `stone-500` | #78716c | Timestamps, hints (AA-compliant) |
| Brand (primary) | `amber-700` | #b45309 | Primary buttons, active states |
| Brand (hover) | `amber-800` | #92400e | Primary button hover |
| Brand (highlight) | `amber-50` | #fffbeb | Today highlight, selected states |
| Danger | `red-600` | #dc2626 | Danger buttons, error borders |
| Success | `green-600` | #16a34a | Success indicators |

### 7.2 Tailwind Class Organization

Within a component's `className`, order Tailwind classes in the following groups, separated by a space. This is a convention (not enforced by tooling) to improve readability:

1. **Layout:** `flex`, `grid`, `block`, `inline`, `relative`, `absolute`
2. **Sizing:** `w-*`, `h-*`, `min-w-*`, `max-w-*`
3. **Spacing:** `p-*`, `px-*`, `m-*`, `mx-*`, `gap-*`
4. **Typography:** `text-*`, `font-*`, `leading-*`, `tracking-*`
5. **Background & Border:** `bg-*`, `border-*`, `rounded-*`, `shadow-*`
6. **State modifiers:** `hover:*`, `focus:*`, `disabled:*`, `active:*`
7. **Responsive:** `sm:*`, `md:*`, `lg:*`
8. **Motion:** `transition-*`, `duration-*`, `motion-safe:*`

Example:
```
className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-white bg-amber-700 rounded-lg shadow-sm hover:bg-amber-800 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:opacity-50"
```

### 7.3 Responsive Breakpoints Strategy

| Breakpoint | Tailwind Prefix | Usage |
|-----------|----------------|-------|
| < 640px | (default / mobile-first) | Single column layouts, stacked calendar, compact cards |
| >= 640px | `sm:` | Slightly wider form fields, inline label/input pairs |
| >= 768px | `md:` | Weekly calendar switches to 7-column grid, side-by-side layouts |
| >= 1024px | `lg:` | Max-width container comfortably fills screen, larger cards |
| >= 1280px | `xl:` | Not heavily used for MVP (the `max-w-4xl` container caps width) |

**Mobile-first principle:** All styles are written for the smallest screen first. Larger breakpoints add complexity, never the reverse.

**Key responsive behaviors:**
- `WeeklyCalendar`: stacked day list on mobile, 7-column grid on `md:` and up
- `ActivityForm`: full-width stacked fields on mobile, 2-column grid for time fields on `sm:` and up
- `Settings` page sections: full-width stacked on mobile, 2-column (sidebar + content) on `lg:`
- Navigation: horizontal link bar on all sizes (no hamburger menu for MVP given the small link count)

### 7.4 Component Styling Patterns

**When to use inline Tailwind classes (default):**
- One-off styling that is specific to a single component
- Layout and spacing that varies by context

**When to extract a component:**
- When the same visual pattern (same classes, same structure) appears 3+ times
- When the pattern has interactive behavior (e.g., a button is always a `<Button>` component, never raw `<button>`)
- When the pattern requires accessibility attributes that should be co-located

**Never:**
- Do NOT create Tailwind `@apply` abstractions in CSS. All styling stays in JSX.
- Do NOT use CSS modules or styled-components. Tailwind utility classes are the sole styling mechanism.
- Do NOT use arbitrary values (e.g., `w-[342px]`) except for truly one-off layout needs. Prefer Tailwind's scale.

### 7.5 Spacing Scale

Use Tailwind's default spacing scale consistently:

| Context | Spacing |
|---------|---------|
| Page padding (mobile) | `px-4 py-6` |
| Page padding (desktop) | `px-6 py-8` |
| Card padding | `p-4` or `p-6` |
| Section spacing (vertical) | `space-y-6` or `gap-6` |
| Form field spacing | `space-y-4` |
| Inline element gap | `gap-2` or `gap-3` |
| Button internal padding | `px-4 py-2` (md), `px-3 py-1.5` (sm), `px-5 py-2.5` (lg) |

### 7.6 Typography Scale

| Element | Tailwind Classes |
|---------|-----------------|
| Page title (h1) | `text-2xl font-semibold text-stone-800` |
| Section title (h2) | `text-lg font-semibold text-stone-800` |
| Subsection title (h3) | `text-base font-medium text-stone-700` |
| Body text | `text-sm text-stone-600` |
| Small/caption text | `text-xs text-stone-500` |
| Button text | `text-sm font-medium` |
| Input text | `text-sm` |
| Label text | `text-sm font-medium text-stone-700` |

---

## Appendix A: File Tree Summary

```
app/frontend/
  application.css
  entrypoints/
    application.tsx           # Inertia app bootstrap (exists)
  layouts/
    AppLayout.tsx             # Authenticated layout (exists, needs updates)
    AuthLayout.tsx            # Unauthenticated layout (NEW)
  pages/
    Auth/
      SignIn.tsx              # NEW
    Households/
      Show.tsx                # NEW
      New.tsx                 # NEW
      Settings.tsx            # NEW
    Activities/
      Index.tsx               # NEW
      New.tsx                 # NEW
      Edit.tsx                # NEW
  components/
    form/
      Input.tsx               # NEW
      Select.tsx              # NEW
      Button.tsx              # NEW
      DatePicker.tsx          # NEW
      TimePicker.tsx          # NEW
    household/
      MemberList.tsx          # NEW
      MemberInviteForm.tsx    # NEW
      ChildList.tsx           # NEW
      ChildForm.tsx           # NEW
    activity/
      WeeklyCalendar.tsx      # NEW
      ActivityCard.tsx         # NEW
      ActivityForm.tsx         # NEW
      LocationPicker.tsx       # NEW
    feedback/
      Flash.tsx               # NEW
      Modal.tsx               # NEW
      ConfirmDialog.tsx        # NEW
  types/
    index.ts                  # NEW
```

## Appendix B: Backend Dependencies

The following backend changes are required before the corresponding frontend pages can function. These are documented here for coordination purposes.

| Dependency | Description | Blocks |
|-----------|-------------|--------|
| `households#new` action | Render `Households/New` Inertia page | `Households/New.tsx` |
| `households#settings` action | Render `Households/Settings` with same props as `show` | `Households/Settings.tsx` |
| Add `settings` route | `member { get :settings }` inside `resources :households` | Settings navigation |
| `activities` table migration | Create activities table with columns matching `Activity` interface | All activity pages |
| `Activity` model | Model with validations, associations to household and children | All activity pages |
| `ActivitiesController` | Full CRUD controller with Inertia rendering | All activity pages |
| `resources :activities` route | Nested under `resources :households` | All activity pages |
| Shared prop: `current_household_id` | Add to `ApplicationController#inertia_share` `auth` hash | Navigation links |
| Devise Inertia sign-in page | Configure Devise to render `Auth/SignIn` via Inertia for `GET /users/sign_in` | `Auth/SignIn.tsx` |
| `activities_children` join table | Many-to-many between activities and children | Activity child assignment |

## Appendix C: Third-Party Dependencies

No new npm packages are required for the MVP scope. The current `package.json` dependencies are sufficient:

- `@inertiajs/react` -- page rendering, routing, form handling
- `react` / `react-dom` -- UI framework
- `typescript` -- type safety
- `tailwindcss` (via `@tailwindcss/vite`) -- styling

**Explicitly excluded for MVP:**
- No map/geolocation libraries (use Browser Geolocation API directly)
- No date manipulation libraries (use native `Date` and `Intl.DateTimeFormat`)
- No state management libraries (Inertia props + React local state)
- No animation libraries (use CSS transitions via Tailwind)
- No icon library (use inline SVGs or HTML entities for the small icon set needed)

If the icon needs grow beyond a handful, consider adding `lucide-react` (lightweight, tree-shakeable) in a future milestone.
