import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ConfirmDialog from '../ConfirmDialog'

describe('ConfirmDialog', () => {
  beforeEach(() => {
    HTMLDialogElement.prototype.showModal = vi.fn()
    HTMLDialogElement.prototype.close = vi.fn()
  })

  it('does not render when open=false', () => {
    const { container } = render(
      <ConfirmDialog
        open={false}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
        title="Confirm Action"
        message="Are you sure you want to do this?"
      />
    )
    expect(container.firstChild).toBeNull()
  })

  it('renders the message text when open=true', () => {
    render(
      <ConfirmDialog
        open={true}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
        title="Confirm Action"
        message="Are you sure you want to do this?"
      />
    )
    expect(screen.getByText('Are you sure you want to do this?')).toBeInTheDocument()
  })

  it('calls onConfirm when the confirm button is clicked', async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn()

    render(
      <ConfirmDialog
        open={true}
        onConfirm={onConfirm}
        onCancel={vi.fn()}
        title="Confirm Action"
        message="Are you sure?"
        confirmLabel="Yes, do it"
      />
    )

    await user.click(screen.getByRole('button', { name: 'Yes, do it' }))

    expect(onConfirm).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when the cancel button is clicked', async () => {
    const user = userEvent.setup()
    const onCancel = vi.fn()

    render(
      <ConfirmDialog
        open={true}
        onConfirm={vi.fn()}
        onCancel={onCancel}
        title="Confirm Action"
        message="Are you sure?"
      />
    )

    await user.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(onCancel).toHaveBeenCalledTimes(1)
  })

  it('cancel button has type="button"', () => {
    render(
      <ConfirmDialog
        open={true}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
        title="Confirm Action"
        message="Are you sure?"
      />
    )
    const cancelButton = screen.getByRole('button', { name: 'Cancel' })
    expect(cancelButton).toHaveAttribute('type', 'button')
  })
})
