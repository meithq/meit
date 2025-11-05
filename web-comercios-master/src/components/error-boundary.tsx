'use client'

import React, { Component, type ReactNode, type ErrorInfo } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

/**
 * Error Boundary Component
 *
 * Catches React errors in component tree and displays user-friendly error UI
 *
 * Usage:
 * ```typescript
 * <ErrorBoundary>
 *   <YourComponent />
 * </ErrorBoundary>
 * ```
 *
 * With custom fallback:
 * ```typescript
 * <ErrorBoundary fallback={<CustomErrorUI />}>
 *   <YourComponent />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error to console
    console.error('ErrorBoundary caught an error:', error, errorInfo)

    // Update state with error info
    this.setState({
      errorInfo,
    })

    // Call optional onError callback
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }

    // TODO: Send error to error tracking service (e.g., Sentry)
    // Example:
    // Sentry.captureException(error, { contexts: { react: { componentStack: errorInfo.componentStack } } })
  }

  handleReload = (): void => {
    // Reset error state and reload page
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    })
    window.location.reload()
  }

  handleReset = (): void => {
    // Reset error state without reloading
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    })
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // If custom fallback is provided, use it
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default error UI
      return (
        <div className="flex min-h-screen items-center justify-center bg-neutral-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-destructive">Algo salió mal</CardTitle>
              <CardDescription>
                Lo sentimos, ocurrió un error inesperado. Por favor intenta recargar la página.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Error details (only in development) */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="rounded-md bg-neutral-100 p-4">
                  <p className="mb-2 text-sm font-semibold text-neutral-700">Error:</p>
                  <p className="mb-2 text-xs font-mono text-neutral-600">
                    {this.state.error.toString()}
                  </p>
                  {this.state.errorInfo && (
                    <>
                      <p className="mb-2 text-sm font-semibold text-neutral-700">Stack Trace:</p>
                      <pre className="max-h-40 overflow-auto text-xs text-neutral-600">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </>
                  )}
                </div>
              )}

              {/* Action buttons */}
              <div className="flex gap-2">
                <Button onClick={this.handleReload} className="flex-1">
                  Recargar página
                </Button>
                <Button onClick={this.handleReset} variant="outline" className="flex-1">
                  Intentar de nuevo
                </Button>
              </div>

              {/* Help text */}
              <p className="text-center text-xs text-neutral-500">
                Si el problema persiste, contacta a soporte técnico
              </p>
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}

/**
 * Hook to reset error boundary from child components
 */
export function useErrorHandler() {
  const [, setError] = React.useState<Error | null>(null)

  return React.useCallback((error: Error) => {
    setError(() => {
      throw error
    })
  }, [])
}
