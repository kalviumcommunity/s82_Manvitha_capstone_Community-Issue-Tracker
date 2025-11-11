import React, { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie'; // 1. Import js-cookie

const ThemeContext = createContext(undefined);

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    // 2. Read from cookies instead of local storage
    const savedTheme = Cookies.get('themePreference');
    if (savedTheme) return savedTheme;

    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }

    return 'light';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // 3. Set the cookie
    // We add 'expires' to make it persistent like localStorage
    // and 'path: /' to make it available on all pages.
    Cookies.set('themePreference', theme, { expires: 365, path: '/' });
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
};

export default ThemeContext;