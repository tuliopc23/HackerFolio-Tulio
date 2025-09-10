import { useState, useMemo, useEffect } from 'react'

import LoadingScreen from '@/components/LoadingScreen'
import { useRoutePreloader } from '@/lib/route-preloader'
import { createAppRouter, AppRouterProvider } from '@/router-enhanced'

function App({ router: providedRouter }: { router?: ReturnType<typeof createAppRouter> }) {
  const [isLoading, setIsLoading] = useState(true)
  const router = useMemo(() => providedRouter ?? createAppRouter(), [providedRouter])
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument
  const preloader = useRoutePreloader(router as any)

  const handleLoadingComplete = () => {
    setIsLoading(false)
  }

  useEffect(() => {
    if (!isLoading) {
      preloader.observeLinks()
      return () => {
        preloader.destroy()
      }
    }
    return undefined
  }, [isLoading, preloader])

  return (
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
