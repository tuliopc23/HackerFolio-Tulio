import React, { createContext, useContext, useState, useEffect } from 'react'

type Theme = 'oxocarbon'

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('oxocarbon') // oxocarbon only

  useEffect(() => {
    const savedTheme = localStorage.getItem('terminal-theme') as Theme | null
    if (savedTheme === 'oxocarbon') {
      setTheme(savedTheme)
    }
  }, [])

  useEffect(() => {
    const root = document.documentElement
    // Remove any previous theme classes from <html>
    root.classList.remove('theme-oxocarbon')

    // Oxocarbon is the default theme, no class needed
    localStorage.setItem('terminal-theme', theme)
  }, [theme])

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
