import { usePage } from '@inertiajs/react'
import AuthLayout from '../../layouts/AuthLayout'
import Button from '../../components/form/Button'

interface SignInProps {
  dev_sign_in_path?: string
}

export default function SignIn() {
  const { props } = usePage<SignInProps>()
  const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''

  return (
    <AuthLayout>
      <form action="/users/auth/google_oauth2" method="post">
        <input type="hidden" name="authenticity_token" value={csrfToken} />
        <Button type="submit" fullWidth size="lg">
          Sign in with Google
        </Button>
      </form>
      {props.dev_sign_in_path && (
        <a href={props.dev_sign_in_path} style={{ display: 'block', marginTop: '1rem', textAlign: 'center', fontSize: '0.875rem', opacity: 0.6 }}>
          Dev sign-in (bypass OAuth)
        </a>
      )}
    </AuthLayout>
  )
}
