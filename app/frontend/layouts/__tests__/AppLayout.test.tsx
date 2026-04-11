import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { usePage } from '@inertiajs/react'
import AppLayout from '../AppLayout'

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
  router: { post: vi.fn(), delete: vi.fn() },
}))

describe('AppLayout', () => {
  it('renders children content', () => {
    render(
      <AppLayout>
        <div>Page content here</div>
      </AppLayout>
    )

    expect(screen.getByText('Page content here')).toBeInTheDocument()
  })

  it('renders the app name / brand in the nav', () => {
    render(<AppLayout><span /></AppLayout>)

    // With a household_id set, "Hearth" renders as a link inside the nav
    const nav = screen.getByRole('navigation', { name: 'Main navigation' })
    expect(nav).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Hearth' })).toBeInTheDocument()
  })

  it('renders navigation links (Dashboard in mobile menu, Activities, Settings)', () => {
    render(<AppLayout><span /></AppLayout>)

    // Desktop nav always has Activities and Settings links
    const activityLinks = screen.getAllByRole('link', { name: 'Activities' })
    expect(activityLinks.length).toBeGreaterThanOrEqual(1)

    const settingsLinks = screen.getAllByRole('link', { name: 'Settings' })
    expect(settingsLinks.length).toBeGreaterThanOrEqual(1)
  })

  it("renders the signed-in user's name", () => {
    render(<AppLayout><span /></AppLayout>)

    // The name appears in the desktop header (hidden sm:block span)
    const nameElements = screen.getAllByText('Jane Smith')
    expect(nameElements.length).toBeGreaterThanOrEqual(1)
  })

  it('mobile menu button is present with an aria-label indicating it opens/closes a menu', () => {
    render(<AppLayout><span /></AppLayout>)

    // Button starts in closed state
    const menuButton = screen.getByRole('button', { name: 'Open menu' })
    expect(menuButton).toBeInTheDocument()
  })

  it('clicking the mobile menu button toggles aria-expanded and shows/hides the mobile menu', async () => {
    const user = userEvent.setup()
    render(<AppLayout><span /></AppLayout>)

    const menuButton = screen.getByRole('button', { name: 'Open menu' })
    expect(menuButton).toHaveAttribute('aria-expanded', 'false')

    // Before opening: Activities appears once (desktop nav only)
    const linksBeforeOpen = screen.getAllByRole('link', { name: 'Activities' })
    const countBefore = linksBeforeOpen.length

    // Open the menu
    await user.click(menuButton)

    expect(screen.getByRole('button', { name: 'Close menu' })).toHaveAttribute('aria-expanded', 'true')
    // After opening: Activities appears in both desktop nav and mobile menu
    expect(screen.getAllByRole('link', { name: 'Activities' }).length).toBeGreaterThan(countBefore)

    // Close the menu
    await user.click(screen.getByRole('button', { name: 'Close menu' }))

    expect(screen.getByRole('button', { name: 'Open menu' })).toHaveAttribute('aria-expanded', 'false')
    // After closing: back to original count
    expect(screen.getAllByRole('link', { name: 'Activities' }).length).toBe(countBefore)
  })

  it('sign out button is present', () => {
    render(<AppLayout><span /></AppLayout>)

    // "Sign out" appears as a button in both desktop and (when open) mobile menu
    const signOutButtons = screen.getAllByRole('button', { name: 'Sign out' })
    expect(signOutButtons.length).toBeGreaterThanOrEqual(1)
  })

  it('renders a flash notice when flash.notice is set', () => {
    vi.mocked(usePage).mockReturnValueOnce({
      props: {
        auth: {
          user: { id: 1, name: 'Jane Smith', email: 'jane@example.com', avatar_url: null },
          current_household_id: 1,
        },
        flash: { notice: 'Changes saved successfully.', alert: undefined },
      },
    } as any)

    render(<AppLayout><span /></AppLayout>)

    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(screen.getByText('Changes saved successfully.')).toBeInTheDocument()
  })

  it('renders a flash alert when flash.alert is set', () => {
    vi.mocked(usePage).mockReturnValueOnce({
      props: {
        auth: {
          user: { id: 1, name: 'Jane Smith', email: 'jane@example.com', avatar_url: null },
          current_household_id: 1,
        },
        flash: { notice: undefined, alert: 'Something went wrong.' },
      },
    } as any)

    render(<AppLayout><span /></AppLayout>)

    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByText('Something went wrong.')).toBeInTheDocument()
  })
})
