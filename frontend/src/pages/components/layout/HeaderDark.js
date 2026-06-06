// src/components/home/HeaderDark.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { ThemeSwitcher } from '../../../components/common/ThemeSwitcher';
import { useTheme } from '../../../contexts/ThemeContext';

export const HeaderDark = () => {
  const { theme, currentTheme } = useTheme();
  const logoSrc = currentTheme === 'dark' ? '/logo-dark.png' : '/logo.png';

  return (
    <header className="absolute top-0 left-0 w-full z-50">
      <div className="max-w-7xl mx-auto px-8 py-8 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-3">
          <img
            src={logoSrc}
            alt="Logo"
            style={{ width: 162, height: 48 }}
            onError={(e) => {
              e.target.style.display = 'none';
              const span = document.createElement('span');
              span.textContent = '📄';
              span.style.fontSize = '28px';
              e.target.parentNode?.appendChild(span);
              e.target.remove();
            }}
          />
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          <Link to="/" className="hover:opacity-80 transition" style={{ color: 'rgba(255,255,255,0.8)' }}>
            Producto
          </Link>
          <Link to="/scanner" className="hover:opacity-80 transition" style={{ color: 'rgba(255,255,255,0.8)' }}>
            ATS Scanner
          </Link>
          <Link to="/pricing" className="hover:opacity-80 transition" style={{ color: 'rgba(255,255,255,0.8)' }}>
            Pricing
          </Link>
          <Link to="/blog" className="hover:opacity-80 transition" style={{ color: 'rgba(255,255,255,0.8)' }}>
            Blog
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <ThemeSwitcher />
          <button className="px-5 py-3 rounded-xl bg-white text-black font-semibold hover:scale-105 transition shadow-md">
            Probar gratis
          </button>
        </div>
      </div>
    </header>
  );
};