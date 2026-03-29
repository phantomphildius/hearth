import { render, screen } from '@testing-library/react'
import { usePage } from '@inertiajs/react'
import AuthLayout from '../AuthLayout'

vi.mock('@inertiajs/react', () => ({
  usePage: vi.fn(() => ({
    props: {
      auth: {
        user: { id: 1, name: 'Jane Smith', email: 'jane@example.com', avatar_url: null },
        current_household_id: 1,
      },
      flash: { notice: undefined, alert: undefined },
    },
  })),
  Link: ({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) =>
    <a href={href} className={className}>{children}</a>,
  router: { post: vi.fn() },
}))

describe('AuthLayout', () => {
  it('renders children content', () => {
    render(
      <AuthLayout>
        <div>Sign in form</div>
      </AuthLayout>
    )

    expect(screen.getByText('Sign in form')).toBeInTheDocument()
  })

  it('renders "Hearth" as the app title', () => {
    render(<AuthLayout><span /></AuthLayout>)

    expect(screen.getByRole('heading', { name: 'Hearth', level: 1 })).toBeInTheDocument()
  })

  it('renders the tagline', () => {
    render(<AuthLayout><span /></AuthLayout>)

    expect(screen.getByText("Your family's home base")).toBeInTheDocument()
  })

  it('renders a flash alert when flash.alert is present', () => {
    vi.mocked(usePage).mockReturnValueOnce({
      props: {
        auth: {
          user: null,
          current_household_id: null,
        },
        flash: { notice: undefined, alert: 'Invalid email or password.' },
      },
    } as any)

    render(<AuthLayout><span /></AuthLayout>)

    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByText('Invalid email or password.')).toBeInTheDocument()
  })

  it('does NOT render a flash alert when flash.alert is undefined', () => {
    render(<AuthLayout><span /></AuthLayout>)

    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})
