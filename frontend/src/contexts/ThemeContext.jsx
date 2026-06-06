import React, { createContext, useState, useContext, useEffect } from 'react';

const themes = {
  light: {
    name: 'light',
    bgPrimary: '#ffffff',
    textPrimary: '#0b1020',
    bgSurface: 'rgba(255,255,255,0.8)',
    borderColor: 'rgba(0,0,0,0.06)',
    gradientFrom: '#7c3aed',
    gradientTo: '#2563eb',
    cardBg: 'rgba(255,255,255,0.8)',
    heroGlow: 'rgba(99,102,241,0.20)',
    textSecondary: 'rgba(0,0,0,0.6)',
    textTertiary: 'rgba(0,0,0,0.4)',
    buttonBg: '#000000',
    buttonText: '#ffffff',
    textWhiteDark: '#000000',
    textDark: '#0b1020',
  },
  dark: {
    name: 'dark',
    bgPrimary: '#0f172a',
    textPrimary: '#f1f5f9',
    bgSurface: 'rgba(30,41,59,0.8)',
    borderColor: 'rgba(255,255,255,0.1)',
    gradientFrom: '#a855f7',
    gradientTo: '#3b82f6',
    cardBg: 'rgba(30,41,59,0.8)',
    heroGlow: 'rgba(168,85,247,0.25)',
    textSecondary: 'rgba(255,255,255,0.6)',
    textTertiary: 'rgba(255,255,255,0.4)',
    buttonBg: '#ffffff',
    buttonText: '#0f172a',
    textWhiteDark: '#ffffff',
    textDark: '#0b1020',
  },
};

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState('light');

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved && themes[saved]) setCurrentTheme(saved);
  }, []);

  const toggleTheme = () => {
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    setCurrentTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme: themes[currentTheme], currentTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);