import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ChildList from '../ChildList'
import type { Child } from '../../../types'

// Stub ConfirmDialog so tests can drive confirm/cancel without a real modal
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

const children: Child[] = [
  { id: 10, first_name: 'Emma', date_of_birth: '2018-04-12', age: 7 },
  { id: 11, first_name: 'Liam', date_of_birth: '2020-09-01', age: 5 },
]

const defaultProps = {
  children,
  householdId: 1,
  onEdit: vi.fn(),
  onRemove: vi.fn(),
}

describe('ChildList', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("renders each child's first name", () => {
    render(<ChildList {...defaultProps} />)

    expect(screen.getByText('Emma')).toBeInTheDocument()
    expect(screen.getByText('Liam')).toBeInTheDocument()
  })

  it('renders an empty state message when there are no children', () => {
    render(<ChildList {...defaultProps} children={[]} />)

    expect(screen.getByText(/no children added yet/i)).toBeInTheDocument()
  })

  it('renders an edit button for each child', () => {
    render(<ChildList {...defaultProps} />)

    const editButtons = screen.getAllByRole('button', { name: /edit/i })
    expect(editButtons).toHaveLength(2)
  })

  it('renders a remove button for each child', () => {
    render(<ChildList {...defaultProps} />)

    const removeButtons = screen.getAllByRole('button', { name: /remove/i })
    expect(removeButtons).toHaveLength(2)
  })

  it('calls onEdit with the correct child when edit is clicked', async () => {
    const user = userEvent.setup()
    const onEdit = vi.fn()

    render(<ChildList {...defaultProps} onEdit={onEdit} />)

    const editButtons = screen.getAllByRole('button', { name: /edit/i })
    // Click edit for the first child (Emma)
    await user.click(editButtons[0])

    expect(onEdit).toHaveBeenCalledWith(children[0])
    expect(onEdit).toHaveBeenCalledTimes(1)
  })

  it('calls onRemove with the correct child id when remove is confirmed', async () => {
    const user = userEvent.setup()
    const onRemove = vi.fn()

    render(<ChildList {...defaultProps} onRemove={onRemove} />)

    // Click Remove for Liam (second child)
    const removeButtons = screen.getAllByRole('button', { name: /remove/i })
    await user.click(removeButtons[1])

    // Confirm the dialog
    const confirmButton = within(screen.getByRole('dialog')).getByRole('button', { name: /^remove$/i })
    await user.click(confirmButton)

    expect(onRemove).toHaveBeenCalledWith(11)
    expect(onRemove).toHaveBeenCalledTimes(1)
  })

  it('does not call onRemove when the confirm dialog is cancelled', async () => {
    const user = userEvent.setup()
    const onRemove = vi.fn()

    render(<ChildList {...defaultProps} onRemove={onRemove} />)

    const removeButtons = screen.getAllByRole('button', { name: /remove/i })
    await user.click(removeButtons[0])

    const cancelButton = screen.getByRole('button', { name: /cancel/i })
    await user.click(cancelButton)

    expect(onRemove).not.toHaveBeenCalled()
  })
})
