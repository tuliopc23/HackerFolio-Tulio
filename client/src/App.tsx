import { AnimatePresence } from 'motion/react'
import { useState } from 'react'

import LoadingScreen from '@/components/LoadingScreen'
import { createAppRouter, AppRouterProvider } from '@/router-enhanced'

function App() {
  const [isLoading, setIsLoading] = useState(true)
  const router = createAppRouter()

  const handleLoadingComplete = () => {
    setIsLoading(false)
  }

  return (
    <AnimatePresence mode='wait'>
      {isLoading ? (
        <LoadingScreen key='loading' onComplete={handleLoadingComplete} />
      ) : (
        <AppRouterProvider key='app' router={router} />
      )}
    </AnimatePresence>
  )
}

export default App
