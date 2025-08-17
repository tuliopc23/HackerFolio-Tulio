import React, { useState, useEffect } from 'react';
import { ThemeContext, type Theme } from '@/contexts/theme-context';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('neon');

  useEffect(() => {
    // Check for saved theme preference, default to neon
    const savedTheme = localStorage.getItem('terminal-theme') as Theme;
    
    if (savedTheme && ['lumon', 'neon', 'pico'].includes(savedTheme)) {
      setTheme(savedTheme);
    } else {
      setTheme('neon');
      localStorage.setItem('terminal-theme', 'neon');
    }
  }, []);

  useEffect(() => {
    // Remove previous theme classes
    document.body.classList.remove('theme-lumon', 'theme-neon', 'theme-pico');

    // Add theme class only for non-default themes (neon is now default)
    if (theme !== 'neon') {
      document.body.classList.add(`theme-${theme}`);
    }

    // Save to localStorage
    localStorage.setItem('terminal-theme', theme);
  }, [theme]);

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
}
