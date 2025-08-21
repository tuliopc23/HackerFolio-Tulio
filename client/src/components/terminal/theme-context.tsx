import React, { createContext, useContext, useState, useEffect } from 'react'

type Theme = 'lumon' | 'neon' | 'mono'

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('lumon') // dark-only default

  useEffect(() => {
    const savedTheme = localStorage.getItem('terminal-theme') as Theme | null
    if (savedTheme && ['lumon', 'neon', 'mono'].includes(savedTheme)) {
      setTheme(savedTheme)
    }
  }, [])

  useEffect(() => {
    const root = document.documentElement
    // Remove previous theme classes from <html>
    root.classList.remove('theme-lumon', 'theme-neon', 'theme-mono')

    // Add current theme class (lumon is effectively the default token set)
    if (theme !== 'lumon') {
      root.classList.add(`theme-${theme}`)
    }

    // Save to localStorage
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
