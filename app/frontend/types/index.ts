// ============================================================
// Core Domain Types
// ============================================================

export interface User {
  id: number
  name: string | null
  email: string
  avatar_url: string | null
}

export interface Household {
  id: number
  name: string
}

export interface Member {
  id: number
  name: string | null
  email: string
  avatar_url: string | null
}

export interface Child {
  id: number
  first_name: string
  date_of_birth: string
  age: number
}

export interface Activity {
  id: number
  name: string
  day_of_week: number | null
  day_of_week_name: string | null
  start_time: string
  end_time: string
  duration_minutes: number
  recurrence: 'weekly' | 'biweekly' | 'monthly' | 'one_time'
  starts_on: string | null
  biweekly_anchor_date: string | null
  notes: string | null
  children: ActivityChild[]
  created_at: string
  updated_at: string
}

export interface ProjectedCalendarEntry {
  kind: 'projected'
  activity_id: number
  session_id: null
  scheduled_date: string
  start_time: string
  end_time: string
  name: string
  notes: null
  children: ActivityChild[]
}

export interface SessionCalendarEntry {
  kind: 'session'
  activity_id: number
  session_id: number
  scheduled_date: string
  start_time: string
  end_time: string
  name: string
  notes: string | null
  children: ActivityChild[]
}

export interface CancelledCalendarEntry {
  kind: 'cancelled'
  activity_id: number
  session_id: number
  scheduled_date: string
  start_time: string
  end_time: string
  name: string
  notes: string | null
  children: ActivityChild[]
}

export type CalendarEntry = ProjectedCalendarEntry | SessionCalendarEntry | CancelledCalendarEntry

export interface ActivityChild {
  id: number
  first_name: string
  age: number
}

// ============================================================
// Form Data Types
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
  day_of_week: number | null
  start_time: string
  end_time: string
  recurrence: string
  starts_on: string
  biweekly_anchor_date: string
  notes: string
  child_ids: number[]
}

// ============================================================
// Shared Props
// ============================================================

export interface SharedProps {
  auth: {
    user: User | null
    current_household_id: number | null
  }
  flash: {
    notice?: string
    alert?: string
  }
}

// ============================================================
// Page Props
// ============================================================

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
  calendar_entries: CalendarEntry[]
  week_start: string
  children: Child[]
}

export interface ActivityNewPageProps extends SharedProps {
  household: Household
  children: Child[]
  errors?: Record<string, string[]>
}

export interface ActivityEditPageProps extends SharedProps {
  household: Household
  activity: Activity & { child_ids: number[] }
  children: Child[]
  errors?: Record<string, string[]>
}
