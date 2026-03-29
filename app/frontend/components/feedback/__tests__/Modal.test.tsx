import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Modal from '../Modal'

describe('Modal', () => {
  beforeEach(() => {
    HTMLDialogElement.prototype.showModal = vi.fn()
    HTMLDialogElement.prototype.close = vi.fn()
  })

  it('returns null when open=false', () => {
    const { container } = render(
      <Modal open={false} onClose={vi.fn()} title="Test Modal">
        <p>Modal content</p>
      </Modal>
    )
    expect(container.firstChild).toBeNull()
  })

  it('renders the title when open=true', () => {
    render(
      <Modal open={true} onClose={vi.fn()} title="My Modal Title">
        <p>Some content</p>
      </Modal>
    )
    expect(screen.getByText('My Modal Title')).toBeInTheDocument()
  })

  it('renders children when open=true', () => {
    render(
      <Modal open={true} onClose={vi.fn()} title="My Modal">
        <p>Child content here</p>
      </Modal>
    )
    expect(screen.getByText('Child content here')).toBeInTheDocument()
  })

  it('calls showModal() when open becomes true', () => {
    render(
      <Modal open={true} onClose={vi.fn()} title="My Modal">
        <p>Content</p>
      </Modal>
    )
    expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when the close button is clicked', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()

    render(
      <Modal open={true} onClose={onClose} title="My Modal">
        <p>Content</p>
      </Modal>
    )

    await user.click(screen.getByRole('button', { name: 'Close dialog' }))

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('close button has aria-label="Close dialog"', () => {
    render(
      <Modal open={true} onClose={vi.fn()} title="My Modal">
        <p>Content</p>
      </Modal>
    )
    expect(screen.getByRole('button', { name: 'Close dialog' })).toBeInTheDocument()
  })
})
