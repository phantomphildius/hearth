import AuthLayout from '../../layouts/AuthLayout'
import Button from '../../components/form/Button'

export default function SignIn() {
  const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''

  return (
    <AuthLayout>
      <form action="/users/auth/google_oauth2" method="post">
        <input type="hidden" name="authenticity_token" value={csrfToken} />
        <Button type="submit" fullWidth size="lg">
          Sign in with Google
        </Button>
      </form>
    </AuthLayout>
  )
}
