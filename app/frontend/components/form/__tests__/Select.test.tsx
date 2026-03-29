import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Select from '../Select'

const options = [
  { value: 'cat', label: 'Cat' },
  { value: 'dog', label: 'Dog' },
  { value: 'bird', label: 'Bird' },
]

describe('Select', () => {
  it('renders the label text', () => {
    render(<Select label="Pet Type" name="pet_type" value="" onChange={vi.fn()} options={options} />)
    expect(screen.getByText('Pet Type')).toBeInTheDocument()
  })

  it('renders all provided options', () => {
    render(<Select label="Pet Type" name="pet_type" value="" onChange={vi.fn()} options={options} />)
    expect(screen.getByRole('option', { name: 'Cat' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Dog' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Bird' })).toBeInTheDocument()
  })

  it('shows error message when error prop is provided', () => {
    render(<Select label="Pet Type" name="pet_type" value="" onChange={vi.fn()} options={options} error="Please select a type" />)
    expect(screen.getByText('Please select a type')).toBeInTheDocument()
  })

  it('does not show error message when error prop is absent', () => {
    const { container } = render(<Select label="Pet Type" name="pet_type" value="" onChange={vi.fn()} options={options} />)
    expect(container.querySelector('p')).not.toBeInTheDocument()
  })

  it('calls onChange when selection changes', async () => {
    const user = userEvent.setup()
    const handleChange = vi.fn()
    render(<Select label="Pet Type" name="pet_type" value="" onChange={handleChange} options={options} />)
    await user.selectOptions(screen.getByRole('combobox'), 'dog')
    expect(handleChange).toHaveBeenCalledWith('dog')
  })
})
