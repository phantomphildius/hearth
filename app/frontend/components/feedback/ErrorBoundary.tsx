import { Component } from 'react'

interface Props {
  children: React.ReactNode
}

interface State {
  hasError: boolean
  message: string | null
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, message: null }
  }

  static getDerivedStateFromError(error: unknown): State {
    const message = error instanceof Error ? error.message : null
    return { hasError: true, message }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
          <div className="max-w-md w-full text-center space-y-4">
            <h1 className="text-xl font-semibold text-stone-800">Something went wrong</h1>
            <p className="text-sm text-stone-500">
              An unexpected error occurred. Try refreshing the page.
            </p>
            {this.state.message && (
              <p className="text-xs text-stone-400 font-mono">{this.state.message}</p>
            )}
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-amber-700 rounded-lg hover:bg-amber-800 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
            >
              Refresh page
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
