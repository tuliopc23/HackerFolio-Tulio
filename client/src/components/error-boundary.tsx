import { AlertTriangle, RefreshCw, Terminal, Code, Bug } from 'lucide-react'
import React, { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  showDetails?: boolean
  title?: string
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
  isExpanded: boolean
}

export class TerminalErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      isExpanded: false,
    }
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
      isExpanded: false,
    }
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    })

    // Log error to external service in production
    // eslint-disable-next-line no-console
    console.error('TerminalErrorBoundary caught an error:', error, errorInfo)

    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      isExpanded: false,
    })
  }

  handleToggleDetails = () => {
    this.setState(prev => ({ isExpanded: !prev.isExpanded }))
  }

  override render() {
    if (this.state.hasError) {
      // If a custom fallback is provided, use it
      if (this.props.fallback) {
        return this.props.fallback
      }

      const { error, errorInfo, isExpanded } = this.state
      const { title = 'Terminal Error', showDetails = true } = this.props

      return (
        <div className='w-full h-full bg-lumon-bg border border-terminal-red rounded-lg overflow-hidden shadow-2xl'>
          {/* Error Header */}
          <div className='bg-terminal-red/10 border-b border-terminal-red px-4 py-3 flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <div className='flex items-center gap-2'>
                <div className='w-3 h-3 rounded-full bg-terminal-red animate-pulse' />
                <div className='w-3 h-3 rounded-full bg-terminal-orange' />
                <div className='w-3 h-3 rounded-full bg-lumon-border' />
              </div>
              <Terminal className='w-4 h-4 text-terminal-red' />
              <span className='text-terminal-red font-medium text-sm'>{title}</span>
            </div>
            <button
              onClick={this.handleReset}
              className='flex items-center gap-2 px-3 py-1 bg-terminal-red/20 hover:bg-terminal-red/30 border border-terminal-red rounded text-terminal-red text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-terminal-red focus:ring-opacity-50'
              aria-label='Reset and try again'
            >
              <RefreshCw className='w-3 h-3' />
              Reset
            </button>
          </div>

          {/* Error Content */}
          <div className='p-6 space-y-4'>
            {/* ASCII Art Error Icon */}
            <div className='flex justify-center mb-6'>
              <pre className='text-terminal-red text-xs leading-none font-mono select-none'>
                {`    ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
   ▄                             ▄
  ▄   ⚠️  TERMINAL ERROR DETECTED  ⚠️   ▄
 ▄                               ▄
▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄`}
              </pre>
            </div>

            {/* Error Message */}
            <div className='bg-lumon-border/50 border border-terminal-red/30 rounded p-4'>
              <div className='flex items-start gap-3'>
                <AlertTriangle className='w-5 h-5 text-terminal-red flex-shrink-0 mt-0.5' />
                <div className='flex-1'>
                  <h3 className='text-magenta-bright font-semibold mb-2'>
                    System Malfunction Detected
                  </h3>
                  <p className='text-lumon-text text-sm leading-relaxed'>
                    The terminal encountered an unexpected error and needs to restart this
                    component. Your session data has been preserved.
                  </p>
                  {error && (
                    <div className='mt-3 p-3 bg-terminal-red/10 border border-terminal-red/20 rounded text-terminal-red text-xs font-mono'>
                      <strong>Error:</strong> {error.message}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className='flex items-center gap-3 pt-2'>
              <button
                onClick={this.handleReset}
                className='flex items-center gap-2 px-4 py-2 bg-magenta-bright hover:bg-magenta-dark text-lumon-bg font-medium rounded transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-magenta-bright focus:ring-opacity-50'
              >
                <RefreshCw className='w-4 h-4' />
                Restart Component
              </button>

              {showDetails && (
                <button
                  onClick={this.handleToggleDetails}
                  className='flex items-center gap-2 px-4 py-2 bg-lumon-border/50 hover:bg-lumon-border border border-magenta-soft text-magenta-bright rounded transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-magenta-bright focus:ring-opacity-50'
                >
                  <Code className='w-4 h-4' />
                  {isExpanded ? 'Hide Details' : 'Show Details'}
                </button>
              )}

              <button
                onClick={() => {
                  window.location.reload()
                }}
                className='flex items-center gap-2 px-4 py-2 bg-lumon-border/30 hover:bg-lumon-border/50 border border-lumon-border text-lumon-text rounded transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-lumon-border focus:ring-opacity-50'
              >
                <Terminal className='w-4 h-4' />
                Reload Terminal
              </button>
            </div>

            {/* Error Details (Expandable) */}
            {showDetails && isExpanded && (error ?? errorInfo) && (
              <div className='mt-6 p-4 bg-lumon-bg border border-terminal-red/20 rounded overflow-hidden'>
                <div className='flex items-center gap-2 mb-3'>
                  <Bug className='w-4 h-4 text-terminal-red' />
                  <h4 className='text-magenta-bright font-medium'>Debug Information</h4>
                </div>

                <div className='space-y-4 text-xs font-mono'>
                  {error && (
                    <div>
                      <div className='text-terminal-red font-semibold mb-2'>Error Stack:</div>
                      <pre className='text-lumon-text bg-lumon-border/20 p-3 rounded overflow-x-auto whitespace-pre-wrap break-words'>
                        {error.stack}
                      </pre>
                    </div>
                  )}

                  {errorInfo?.componentStack && (
                    <div>
                      <div className='text-terminal-red font-semibold mb-2'>Component Stack:</div>
                      <pre className='text-lumon-text bg-lumon-border/20 p-3 rounded overflow-x-auto whitespace-pre-wrap break-words'>
                        {errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Terminal-style footer */}
            <div className='mt-6 pt-4 border-t border-magenta-soft/20'>
              <div className='flex items-center gap-2 text-magenta-soft text-xs font-mono'>
                <span className='text-terminal-green'>$</span>
                <span>error_recovery_mode --active --restart-available</span>
                <div className='w-2 h-3 bg-magenta-bright animate-pulse ml-1' />
              </div>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// Hook version for functional components
export function useErrorHandler() {
  return (error: Error, errorInfo?: ErrorInfo) => {
    // eslint-disable-next-line no-console
    console.error('Error caught by useErrorHandler:', error, errorInfo)
    // You can integrate with error reporting services here
  }
}

// Higher-order component wrapper
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <TerminalErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </TerminalErrorBoundary>
  )

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName ?? Component.name})`
  return WrappedComponent
}

export default TerminalErrorBoundary
