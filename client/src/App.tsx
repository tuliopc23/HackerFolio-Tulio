import { createAppRouter, AppRouterProvider } from '@/router'

function App() {
  const router = createAppRouter()
  return <AppRouterProvider router={router} />
}

export default App
