import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TimePicker from '../TimePicker'

describe('TimePicker', () => {
  it('renders the label text', () => {
    render(<TimePicker label="Start Time" name="start_time" value="" onChange={vi.fn()} />)
    expect(screen.getByText('Start Time')).toBeInTheDocument()
  })

  it('renders an input of type time', () => {
    render(<TimePicker label="Start Time" name="start_time" value="" onChange={vi.fn()} />)
    const input = document.querySelector('input[type="time"]')
    expect(input).toBeInTheDocument()
  })

  it('has the correct name attribute', () => {
    render(<TimePicker label="Start Time" name="start_time" value="" onChange={vi.fn()} />)
    const input = document.querySelector('input[type="time"]')
    expect(input).toHaveAttribute('name', 'start_time')
  })

  it('shows error message when error prop is provided', () => {
    render(<TimePicker label="Start Time" name="start_time" value="" onChange={vi.fn()} error="Time is required" />)
    expect(screen.getByText('Time is required')).toBeInTheDocument()
  })

  it('calls onChange when value changes', async () => {
    const user = userEvent.setup()
    const handleChange = vi.fn()
    render(<TimePicker label="Start Time" name="start_time" value="" onChange={handleChange} />)
    const input = document.querySelector('input[type="time"]') as HTMLInputElement
    await user.type(input, '14:30')
    expect(handleChange).toHaveBeenCalled()
  })
})
