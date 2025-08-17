import React, { useState, useEffect } from 'react';
import { ThemeContext, type Theme } from '@/contexts/theme-context';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('lumon');

  useEffect(() => {
    // Check for saved theme preference, default to lumon
    const savedTheme = localStorage.getItem('terminal-theme') as Theme;
    
    if (savedTheme && ['lumon', 'neon', 'pico'].includes(savedTheme)) {
      setTheme(savedTheme);
    } else {
      setTheme('lumon');
      localStorage.setItem('terminal-theme', 'lumon');
    }
  }, []);

  useEffect(() => {
    // Ensure exactly one theme class is present on <body>
    document.body.classList.remove('theme-lumon', 'theme-neon', 'theme-pico');
    document.body.classList.add(`theme-${theme}`);
    document.body.setAttribute('data-theme', theme);

    // Save to localStorage
    localStorage.setItem('terminal-theme', theme);
  }, [theme]);

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
}
