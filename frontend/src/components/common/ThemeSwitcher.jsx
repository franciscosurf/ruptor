import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

export const ThemeSwitcher = () => {
  const { currentTheme, toggleTheme } = useTheme();
  return (
    <button
      onClick={toggleTheme}
      className="px-3 py-2 rounded-lg text-sm font-medium transition"
      style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-color)',
        color: 'var(--text-primary)',
      }}
    >
      {currentTheme === 'light' ? '🌙 Modo oscuro' : '☀️ Modo claro'}
    </button>
  );
};