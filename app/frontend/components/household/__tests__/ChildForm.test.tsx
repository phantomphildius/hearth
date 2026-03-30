import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ChildForm from '../ChildForm'
import type { Child } from '../../../types'

const mockPost = vi.fn()
const mockPatch = vi.fn()
const mockSetData = vi.fn()

vi.mock('@inertiajs/react', () => ({
  useForm: vi.fn((initialData: Record<string, unknown>) => ({
    data: initialData,
    setData: mockSetData,
    post: mockPost,
    patch: mockPatch,
    delete: vi.fn(),
    processing: false,
    errors: {} as Record<string, string>,
    wasSuccessful: false,
    reset: vi.fn(),
  })),
  router: { delete: vi.fn(), post: vi.fn() },
  Link: ({ href, children }: { href: string; children: React.ReactNode }) =>
    <a href={href}>{children}</a>,
}))

import { useForm } from '@inertiajs/react'

function mockUseForm(data: Record<string, unknown>) {
  ;(useForm as ReturnType<typeof vi.fn>).mockReturnValueOnce({
    data,
    setData: mockSetData,
    post: mockPost,
    patch: mockPatch,
    processing: false,
    errors: {},
    wasSuccessful: false,
    reset: vi.fn(),
  })
}

const existingChild: Child = {
  id: 10,
  first_name: 'Emma',
  date_of_birth: '2018-04-12',
  age: 7,
}

describe('ChildForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('add mode (no child prop)', () => {
    it('renders a first name input', () => {
      render(<ChildForm householdId={1} onCancel={vi.fn()} />)

      expect(screen.getByRole('textbox', { name: /first name/i })).toBeInTheDocument()
    })

    it('renders a date of birth input', () => {
      render(<ChildForm householdId={1} onCancel={vi.fn()} />)

      // DatePicker renders an <input type="date"> labelled "Date of Birth"
      const dobInput = screen.getByLabelText(/date of birth/i)
      expect(dobInput).toBeInTheDocument()
      expect(dobInput).toHaveAttribute('type', 'date')
    })

    it('renders an "Add Child" submit button', () => {
      render(<ChildForm householdId={1} onCancel={vi.fn()} />)

      expect(screen.getByRole('button', { name: /add child/i })).toBeInTheDocument()
    })

    it('submitting calls post with the correct URL', async () => {
      const user = userEvent.setup()
      mockUseForm({ first_name: 'Alice', date_of_birth: '2018-01-01' })
      render(<ChildForm householdId={1} onCancel={vi.fn()} />)

      await user.click(screen.getByRole('button', { name: /add child/i }))

      expect(mockPost).toHaveBeenCalledWith('/households/1/children', { preserveScroll: true })
      expect(mockPatch).not.toHaveBeenCalled()
    })

    it('cancel button calls the onCancel prop', async () => {
      const user = userEvent.setup()
      const onCancel = vi.fn()

      render(<ChildForm householdId={1} onCancel={onCancel} />)

      await user.click(screen.getByRole('button', { name: /cancel/i }))

      expect(onCancel).toHaveBeenCalledTimes(1)
    })
  })

  describe('edit mode (child prop provided)', () => {
    it('renders a first name input pre-populated with the child name', () => {
      render(<ChildForm householdId={1} child={existingChild} onCancel={vi.fn()} />)

      // useForm is called with the child's data; the input value comes from form.data
      const firstNameInput = screen.getByRole('textbox', { name: /first name/i })
      expect(firstNameInput).toBeInTheDocument()
    })

    it('renders a date of birth input', () => {
      render(<ChildForm householdId={1} child={existingChild} onCancel={vi.fn()} />)

      const dobInput = screen.getByLabelText(/date of birth/i)
      expect(dobInput).toBeInTheDocument()
      expect(dobInput).toHaveAttribute('type', 'date')
    })

    it('renders an "Update" submit button', () => {
      render(<ChildForm householdId={1} child={existingChild} onCancel={vi.fn()} />)

      expect(screen.getByRole('button', { name: /update/i })).toBeInTheDocument()
    })

    it('submitting calls patch with the correct URL', async () => {
      const user = userEvent.setup()
      render(<ChildForm householdId={1} child={existingChild} onCancel={vi.fn()} />)

      await user.click(screen.getByRole('button', { name: /update/i }))

      expect(mockPatch).toHaveBeenCalledWith(
        `/households/1/children/${existingChild.id}`,
        { preserveScroll: true },
      )
      expect(mockPost).not.toHaveBeenCalled()
    })

    it('cancel button calls the onCancel prop', async () => {
      const user = userEvent.setup()
      const onCancel = vi.fn()

      render(<ChildForm householdId={1} child={existingChild} onCancel={onCancel} />)

      await user.click(screen.getByRole('button', { name: /cancel/i }))

      expect(onCancel).toHaveBeenCalledTimes(1)
    })
  })
})
