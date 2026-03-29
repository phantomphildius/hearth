import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import DatePicker from '../DatePicker'

describe('DatePicker', () => {
  it('renders the label text', () => {
    render(<DatePicker label="Event Date" name="event_date" value="" onChange={vi.fn()} />)
    expect(screen.getByText('Event Date')).toBeInTheDocument()
  })

  it('renders an input of type date', () => {
    render(<DatePicker label="Event Date" name="event_date" value="" onChange={vi.fn()} />)
    const input = document.querySelector('input[type="date"]')
    expect(input).toBeInTheDocument()
  })

  it('has the correct name attribute', () => {
    render(<DatePicker label="Event Date" name="event_date" value="" onChange={vi.fn()} />)
    const input = document.querySelector('input[type="date"]')
    expect(input).toHaveAttribute('name', 'event_date')
  })

  it('calls onChange when value changes', async () => {
    const user = userEvent.setup()
    const handleChange = vi.fn()
    render(<DatePicker label="Event Date" name="event_date" value="" onChange={handleChange} />)
    const input = document.querySelector('input[type="date"]') as HTMLInputElement
    await user.type(input, '2026-06-15')
    expect(handleChange).toHaveBeenCalled()
  })

  it('shows error message when error prop is provided', () => {
    render(<DatePicker label="Event Date" name="event_date" value="" onChange={vi.fn()} error="Date is required" />)
    expect(screen.getByText('Date is required')).toBeInTheDocument()
  })
})
