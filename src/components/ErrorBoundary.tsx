import { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ error, errorInfo })
    console.error('ErrorBoundary caught:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center p-8">
          <div className="max-w-2xl w-full bg-gray-900 rounded-2xl p-8 border border-red-500/20">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
              <h1 className="text-2xl font-bold text-red-400">Something went wrong</h1>
            </div>
            <div className="bg-gray-950 rounded-lg p-4 mb-4 overflow-auto max-h-60">
              <p className="text-red-300 font-mono text-sm whitespace-pre-wrap">
                {this.state.error?.message || 'Unknown error'}
              </p>
            </div>
            {this.state.errorInfo && (
              <details className="text-gray-400 text-sm">
                <summary className="cursor-pointer hover:text-gray-300 mb-2">Stack trace</summary>
                <pre className="font-mono text-xs whitespace-pre-wrap mt-2 bg-gray-950 p-4 rounded-lg max-h-80 overflow-auto">
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
            <button
              onClick={() => window.location.reload()}
              className="mt-6 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors"
            >
              Reload Application
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
