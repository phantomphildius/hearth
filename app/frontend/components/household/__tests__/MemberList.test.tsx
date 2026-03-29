import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MemberList from '../MemberList'
import type { Member } from '../../../types'

vi.mock('@inertiajs/react', () => ({
  usePage: vi.fn(() => ({
    props: {
      auth: {
        user: { id: 1, name: 'Alice Smith', email: 'alice@example.com', avatar_url: null },
        current_household_id: 1,
      },
      flash: {},
    },
  })),
  router: { delete: vi.fn(), post: vi.fn() },
  Link: ({ href, children }: { href: string; children: React.ReactNode }) =>
    <a href={href}>{children}</a>,
}))

// ConfirmDialog uses a Modal — stub it out so we can control the dialog flow directly
vi.mock('../../feedback/ConfirmDialog', () => ({
  default: ({
    open,
    onConfirm,
    onCancel,
    message,
    confirmLabel,
  }: {
    open: boolean
    onConfirm: () => void
    onCancel: () => void
    title: string
    message: string
    confirmLabel?: string
    variant?: string
  }) =>
    open ? (
      <div role="dialog">
        <p>{message}</p>
        <button onClick={onConfirm}>{confirmLabel ?? 'Confirm'}</button>
        <button onClick={onCancel}>Cancel</button>
      </div>
    ) : null,
}))

const members: Member[] = [
  { id: 2, name: 'Bob Jones', email: 'bob@example.com', avatar_url: null },
  { id: 3, name: 'Carol White', email: 'carol@example.com', avatar_url: null },
]

const defaultProps = {
  members,
  householdId: 1,
  onRemove: vi.fn(),
}

describe('MemberList', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("renders each member's name", () => {
    render(<MemberList {...defaultProps} />)

    expect(screen.getByText('Bob Jones')).toBeInTheDocument()
    expect(screen.getByText('Carol White')).toBeInTheDocument()
  })

  it("renders each member's email", () => {
    render(<MemberList {...defaultProps} />)

    expect(screen.getByText('bob@example.com')).toBeInTheDocument()
    expect(screen.getByText('carol@example.com')).toBeInTheDocument()
  })

  it('renders a remove button for each member who is not the current user', () => {
    render(<MemberList {...defaultProps} />)

    const removeButtons = screen.getAllByRole('button', { name: /remove/i })
    // Both members (id 2 and 3) differ from current user (id 1), so both get a button
    expect(removeButtons).toHaveLength(2)
  })

  it('calls onRemove with the correct member id when remove is confirmed', async () => {
    const user = userEvent.setup()
    const onRemove = vi.fn()

    render(<MemberList {...defaultProps} onRemove={onRemove} />)

    // Click the Remove button for Bob Jones (first button)
    const removeButtons = screen.getAllByRole('button', { name: /remove/i })
    await user.click(removeButtons[0])

    // Confirm dialog should appear — click the confirm button inside it
    const confirmButton = within(screen.getByRole('dialog')).getByRole('button', { name: /^remove$/i })
    await user.click(confirmButton)

    expect(onRemove).toHaveBeenCalledWith(2)
    expect(onRemove).toHaveBeenCalledTimes(1)
  })

  it('does not render a remove button for the current user', () => {
    const membersIncludingCurrentUser: Member[] = [
      { id: 1, name: 'Alice Smith', email: 'alice@example.com', avatar_url: null },
      { id: 2, name: 'Bob Jones', email: 'bob@example.com', avatar_url: null },
    ]

    render(
      <MemberList
        {...defaultProps}
        members={membersIncludingCurrentUser}
      />
    )

    // Only one remove button — for Bob (id 2), not Alice (id 1, current user)
    const removeButtons = screen.getAllByRole('button', { name: /remove/i })
    expect(removeButtons).toHaveLength(1)
  })
})
