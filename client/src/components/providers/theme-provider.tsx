import React, { useState, useEffect } from 'react';
import { ThemeContext, type Theme } from '@/contexts/theme-context';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('lumon');

  useEffect(() => {
    // Force lumon as default - clear any saved neon preference
    const savedTheme = localStorage.getItem('terminal-theme') as Theme;
    
    // Always start with lumon, ignore saved theme for now
    setTheme('lumon');
    localStorage.setItem('terminal-theme', 'lumon');
    
    // Uncomment this later if you want to restore saved theme behavior:
    // if (savedTheme && ['lumon', 'neon', 'pico'].includes(savedTheme)) {
    //   setTheme(savedTheme);
    // } else {
    //   setTheme('lumon');
    // }
  }, []);

  useEffect(() => {
    // Remove previous theme classes
    document.body.classList.remove('theme-lumon', 'theme-neon', 'theme-pico');

    // Add current theme class (lumon is default, so only add class for other themes)
    if (theme !== 'lumon') {
      document.body.classList.add(`theme-${theme}`);
    }

    // Save to localStorage
    localStorage.setItem('terminal-theme', theme);
  }, [theme]);

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
}
