import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import MemberInviteForm from '../MemberInviteForm'

const mockPost = vi.fn()
const mockSetData = vi.fn()

vi.mock('@inertiajs/react', () => ({
  useForm: vi.fn((initialData: Record<string, unknown>) => {
    const [data, setLocalData] = useState<Record<string, unknown>>({ ...initialData })
    return {
      data,
      setData: (key: string, value: unknown) => {
        mockSetData(key, value)
        setLocalData((prev) => ({ ...prev, [key]: value }))
      },
      post: mockPost,
      patch: vi.fn(),
      delete: vi.fn(),
      processing: false,
      errors: {} as Record<string, string>,
      wasSuccessful: false,
      reset: vi.fn(),
    }
  }),
  router: { delete: vi.fn(), post: vi.fn() },
  Link: ({ href, children }: { href: string; children: React.ReactNode }) =>
    <a href={href}>{children}</a>,
}))

describe('MemberInviteForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders an email input', () => {
    render(<MemberInviteForm householdId={1} />)

    const emailInput = screen.getByRole('textbox', { name: /invite by email/i })
    expect(emailInput).toBeInTheDocument()
    expect(emailInput).toHaveAttribute('type', 'email')
  })

  it('renders a submit button', () => {
    render(<MemberInviteForm householdId={1} />)

    expect(screen.getByRole('button', { name: /invite/i })).toBeInTheDocument()
  })

  it('typing into the email input calls setData', async () => {
    const user = userEvent.setup()
    render(<MemberInviteForm householdId={1} />)

    const emailInput = screen.getByRole('textbox', { name: /invite by email/i })
    await user.type(emailInput, 'newmember@example.com')

    expect(mockSetData).toHaveBeenCalled()
    // Each keystroke fires setData('email', <current value>)
    expect(mockSetData).toHaveBeenLastCalledWith('email', 'newmember@example.com')
  })

  it('submitting the form calls post with the correct URL', async () => {
    const user = userEvent.setup()
    render(<MemberInviteForm householdId={1} />)

    await user.click(screen.getByRole('button', { name: /invite/i }))

    expect(mockPost).toHaveBeenCalledWith('/households/1/household_members', { preserveScroll: true })
  })
})
