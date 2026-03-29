// ============================================================
// Core Domain Types
// ============================================================

export interface User {
  id: number
  name: string
  email: string
  avatar_url: string | null
}

export interface Household {
  id: number
  name: string
}

export interface Member {
  id: number
  name: string
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
  location_name: string | null
  address: string | null
  latitude: number | null
  longitude: number | null
  day_of_week: number | null
  day_of_week_name: string | null
  start_time: string
  end_time: string
  duration_minutes: number
  recurrence: 'weekly' | 'biweekly' | 'monthly' | 'one_time'
  starts_on: string | null
  notes: string | null
  children: ActivityChild[]
  created_at: string
  updated_at: string
}

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
  location_name: string
  address: string
  latitude: number | null
  longitude: number | null
  notes: string
  child_ids: number[]
}

export interface LocationData {
  location_name: string
  address: string
  latitude: number | null
  longitude: number | null
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
