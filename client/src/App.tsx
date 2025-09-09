import { useState, useMemo } from 'react'

import LoadingScreen from '@/components/LoadingScreen'
import { createAppRouter, AppRouterProvider } from '@/router-enhanced'

function App({ router: providedRouter }: { router?: ReturnType<typeof createAppRouter> }) {
  const [isLoading, setIsLoading] = useState(true)

  // OPTIMIZATION: Memoize router creation to prevent recreation on every render
  const router = useMemo(() => providedRouter ?? createAppRouter(), [providedRouter])

  const handleLoadingComplete = () => {
    setIsLoading(false)
  }

  return (
    // OPTIMIZATION: Replace AnimatePresence with CSS transitions (-50KB)
    <div className='app-container'>
      {isLoading ? (
        <LoadingScreen key='loading' onComplete={handleLoadingComplete} />
      ) : (
        <div key='app' className='app-content animate-in fade-in duration-300'>
          <AppRouterProvider router={router} />
        </div>
      )}
    </div>
  )
}

export default App
