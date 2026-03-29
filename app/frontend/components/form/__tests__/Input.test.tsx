import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import Input from '../Input'

describe('Input', () => {
  it('renders the label text', () => {
    render(<Input label="Full Name" name="full_name" value="" onChange={vi.fn()} />)
    expect(screen.getByText('Full Name')).toBeInTheDocument()
  })

  it('renders an input with the correct name attribute', () => {
    render(<Input label="Full Name" name="full_name" value="" onChange={vi.fn()} />)
    expect(screen.getByRole('textbox')).toHaveAttribute('name', 'full_name')
  })

  it('calls onChange with the new value when user types', async () => {
    const user = userEvent.setup()
    function Wrapper() {
      const [value, setValue] = useState('')
      return <Input label="Full Name" name="full_name" value={value} onChange={setValue} />
    }
    render(<Wrapper />)
    await user.type(screen.getByRole('textbox'), 'Alice')
    expect(screen.getByRole('textbox')).toHaveValue('Alice')
  })

  it('shows error message when error prop is provided', () => {
    render(<Input label="Full Name" name="full_name" value="" onChange={vi.fn()} error="This field is required" />)
    expect(screen.getByText('This field is required')).toBeInTheDocument()
  })

  it('does not show error message when error prop is absent', () => {
    render(<Input label="Full Name" name="full_name" value="" onChange={vi.fn()} />)
    expect(screen.queryByRole('paragraph')).not.toBeInTheDocument()
  })

  it('has required attribute when required=true', () => {
    render(<Input label="Full Name" name="full_name" value="" onChange={vi.fn()} required />)
    expect(screen.getByRole('textbox')).toHaveAttribute('required')
  })
})
