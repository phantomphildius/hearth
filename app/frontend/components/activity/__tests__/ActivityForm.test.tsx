import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ActivityForm from '../ActivityForm'
import type { Activity, Child, ActivityFormData } from '../../../types'

// ---------------------------------------------------------------------------
// Inertia mock
// ---------------------------------------------------------------------------
vi.mock('@inertiajs/react', () => ({
  useForm: vi.fn((initialData: Record<string, unknown>) => ({
    data: initialData,
    setData: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    processing: false,
    errors: {} as Record<string, string>,
    wasSuccessful: false,
    reset: vi.fn(),
  })),
  router: { get: vi.fn(), delete: vi.fn() },
  Link: ({ href, children }: { href: string; children: React.ReactNode }) =>
    <a href={href}>{children}</a>,
}))

// ---------------------------------------------------------------------------
// Import useForm AFTER mocking so we can inspect / reconfigure it per-test
// ---------------------------------------------------------------------------
import { useForm } from '@inertiajs/react'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const defaultChildren: Child[] = [
  { id: 1, first_name: 'Alice', date_of_birth: '2017-06-15', age: 6 },
  { id: 2, first_name: 'Bob', date_of_birth: '2019-03-10', age: 5 },
]

/** Build the form data that useForm receives for a given recurrence type. */
function makeFormData(overrides: Partial<ActivityFormData> = {}): ActivityFormData {
  return {
    name: '',
    day_of_week: null,
    start_time: '',
    end_time: '',
    recurrence: 'weekly',
    starts_on: '',
    biweekly_anchor_date: '',
    notes: '',
    child_ids: [],
    ...overrides,
  }
}

/** Configure the useForm mock to return a specific data shape. */
function mockUseForm(data: ActivityFormData) {
  vi.mocked(useForm).mockReturnValue({
    data,
    setData: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    processing: false,
    errors: {} as Record<string, string>,
    wasSuccessful: false,
    reset: vi.fn(),
  } as unknown as ReturnType<typeof useForm>)
}

const defaultProps = {
  householdId: 1,
  children: [],
  onCancel: vi.fn(),
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('ActivityForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Default: weekly recurrence, empty form
    mockUseForm(makeFormData())
  })

  it('renders the activity name input', () => {
    render(<ActivityForm {...defaultProps} />)
    expect(screen.getByLabelText(/activity name/i)).toBeInTheDocument()
  })

  it('day of week select is visible for "weekly" recurrence', () => {
    mockUseForm(makeFormData({ recurrence: 'weekly' }))
    render(<ActivityForm {...defaultProps} />)
    expect(screen.getByLabelText(/day of week/i)).toBeInTheDocument()
  })

  it('day of week select is not rendered for "one_time" recurrence', () => {
    mockUseForm(makeFormData({ recurrence: 'one_time' }))
    render(<ActivityForm {...defaultProps} />)
    expect(screen.queryByLabelText(/day of week/i)).not.toBeInTheDocument()
  })

  it('day of week select is not rendered for "monthly" recurrence', () => {
    mockUseForm(makeFormData({ recurrence: 'monthly' }))
    render(<ActivityForm {...defaultProps} />)
    expect(screen.queryByLabelText(/day of week/i)).not.toBeInTheDocument()
  })

  it('"Starting from" input is visible for "monthly" recurrence', () => {
    mockUseForm(makeFormData({ recurrence: 'monthly' }))
    render(<ActivityForm {...defaultProps} />)
    expect(screen.getByLabelText(/starting from/i)).toBeInTheDocument()
  })

  it('"Starting from" input is NOT visible for "weekly" recurrence', () => {
    mockUseForm(makeFormData({ recurrence: 'weekly' }))
    render(<ActivityForm {...defaultProps} />)
    expect(screen.queryByLabelText(/starting from/i)).not.toBeInTheDocument()
  })

  it('start date input is visible for "one_time" recurrence', () => {
    mockUseForm(makeFormData({ recurrence: 'one_time' }))
    render(<ActivityForm {...defaultProps} />)
    expect(screen.getByLabelText(/^date$/i)).toBeInTheDocument()
  })

  it('start date input is NOT visible for "weekly" recurrence', () => {
    mockUseForm(makeFormData({ recurrence: 'weekly' }))
    render(<ActivityForm {...defaultProps} />)
    expect(screen.queryByLabelText(/^date$/i)).not.toBeInTheDocument()
  })

  it('"Starting week of" input is visible for "biweekly" recurrence', () => {
    mockUseForm(makeFormData({ recurrence: 'biweekly' }))
    render(<ActivityForm {...defaultProps} />)
    expect(screen.getByLabelText(/starting week of/i)).toBeInTheDocument()
  })

  it('"Starting week of" input is NOT visible for "weekly" recurrence', () => {
    mockUseForm(makeFormData({ recurrence: 'weekly' }))
    render(<ActivityForm {...defaultProps} />)
    expect(screen.queryByLabelText(/starting week of/i)).not.toBeInTheDocument()
  })

  it('submitting with end_time before start_time shows a client-side error', async () => {
    const user = userEvent.setup()

    // Provide times so the validation branch fires: end <= start
    mockUseForm(makeFormData({ name: 'Soccer', day_of_week: 1, start_time: '10:00', end_time: '09:00' }))
    render(<ActivityForm {...defaultProps} />)

    await user.click(screen.getByRole('button', { name: /create activity/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent(/end time must be after start time/i)
  })

  it('children checkboxes are rendered when children are provided', () => {
    mockUseForm(makeFormData({ child_ids: [] }))
    render(<ActivityForm {...defaultProps} children={defaultChildren} />)

    expect(screen.getByRole('checkbox', { name: /alice/i })).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: /bob/i })).toBeInTheDocument()
  })

  it('does not render children checkboxes when no children are provided', () => {
    render(<ActivityForm {...defaultProps} children={[]} />)
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument()
  })
})
