import { render, screen, act, fireEvent } from '@testing-library/react'
import Flash from '../Flash'

describe('Flash', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.runOnlyPendingTimers()
    vi.useRealTimers()
  })

  it('renders a notice message when notice prop is provided', () => {
    render(<Flash notice="Record saved successfully" />)
    expect(screen.getByText('Record saved successfully')).toBeInTheDocument()
  })

  it('renders an alert message when alert prop is provided', () => {
    render(<Flash alert="Something went wrong" />)
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
  })

  it('renders nothing when both props are undefined', () => {
    const { container } = render(<Flash />)
    expect(container.firstChild).toBeNull()
  })

  it('dismiss button removes the notice when clicked', () => {
    render(<Flash notice="Record saved successfully" />)

    expect(screen.getByText('Record saved successfully')).toBeInTheDocument()

    act(() => { fireEvent.click(screen.getByRole('button', { name: 'Dismiss notice' })) })

    expect(screen.queryByText('Record saved successfully')).not.toBeInTheDocument()
  })

  it('dismiss button removes the alert when clicked', () => {
    render(<Flash alert="Something went wrong" />)

    expect(screen.getByText('Something went wrong')).toBeInTheDocument()

    act(() => { fireEvent.click(screen.getByRole('button', { name: 'Dismiss alert' })) })

    expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument()
  })

  it('notice auto-dismisses after 5000ms', () => {
    render(<Flash notice="Auto-dismiss me" />)
    expect(screen.getByText('Auto-dismiss me')).toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(5000)
    })

    expect(screen.queryByText('Auto-dismiss me')).not.toBeInTheDocument()
  })

  it('notice has role="status"', () => {
    render(<Flash notice="Status message" />)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('alert has role="alert"', () => {
    render(<Flash alert="Alert message" />)
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })
})
