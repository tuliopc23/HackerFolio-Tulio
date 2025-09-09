import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState, lazy, Suspense, type ReactNode } from 'react'

import { ThemeProvider } from '@/components/terminal/theme-context'

export function AppProviders({ children }: { children: ReactNode }) {
  // Create QueryClient instance with optimized defaults
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Keep data fresh for 5 minutes
            staleTime: 5 * 60 * 1000,
            // Cache data for 10 minutes
            gcTime: 10 * 60 * 1000,
            // Retry failed requests 3 times
            retry: 3,
            // Retry delay with exponential backoff
            retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
            // Enable background refetching
            refetchOnWindowFocus: true,
            refetchOnReconnect: true,
            // Disable refetch on mount if data is fresh
            refetchOnMount: data => !data,
          },
          mutations: {
            // Retry failed mutations once
            retry: 1,
            // Mutation retry delay
            retryDelay: 1000,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        {children}
        {/* TanStack Query DevTools - only in development */}
        {import.meta.env.DEV && (
          <Suspense fallback={null}>
            <ReactQueryDevtoolsLazy
              initialIsOpen={false}
              buttonPosition='bottom-left'
              position='bottom'
            />
          </Suspense>
        )}
      </ThemeProvider>
    </QueryClientProvider>
  )
}

// Lazy-load DevTools in development only, avoiding unused import warnings
const ReactQueryDevtoolsLazy = lazy(() =>
  import('@tanstack/react-query-devtools').then(mod => ({ default: mod.ReactQueryDevtools }))
)
