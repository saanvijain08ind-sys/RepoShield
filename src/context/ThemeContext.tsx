import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    // Check localStorage first
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ostm-theme');
      if (saved === 'light' || saved === 'dark') {
        return saved;
      }
    }
    return 'dark'; // default to dark
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
      document.body.classList.add('bg-[#0d1117]', 'text-[#c9d1d9]');
      document.body.classList.remove('bg-[#f6f8fa]', 'text-[#1f2328]');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
      document.body.classList.add('bg-[#f6f8fa]', 'text-[#1f2328]');
      document.body.classList.remove('bg-[#0d1117]', 'text-[#c9d1d9]');
    }
    localStorage.setItem('ostm-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const setTheme = (t: Theme) => {
    setThemeState(t);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
