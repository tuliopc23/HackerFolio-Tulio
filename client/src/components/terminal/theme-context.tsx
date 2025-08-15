import React, { createContext, useContext, useState, useEffect } from 'react';

export type Theme = 'lumon' | 'neon' | 'mono' | 'pico';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('lumon');

  useEffect(() => {
    const savedTheme = localStorage.getItem('terminal-theme') as Theme;
    if (savedTheme && ['lumon', 'neon', 'mono', 'pico'].includes(savedTheme)) {
      setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    // Remove previous theme classes
    document.body.classList.remove('theme-lumon', 'theme-neon', 'theme-mono', 'theme-pico');
    
    // Add current theme class
    if (theme !== 'lumon') {
      document.body.classList.add(`theme-${theme}`);
    }
    
    // Save to localStorage
    localStorage.setItem('terminal-theme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
