import React from 'react';
import { Link } from 'react-router-dom';
import { ThemeSwitcher } from '../../../components/common/ThemeSwitcher';   // ✅ corregido
import { useTheme } from '../../../contexts/ThemeContext';                 // ✅ corregido

export function Header() {
  const { theme, currentTheme } = useTheme();
  const logoSrc = currentTheme === 'dark' ? '/logo-dark.png' : '/logo.png';

  return (
    <header className="w-full border-b backdrop-blur sticky top-0 z-50" style={{ backgroundColor: theme.bgSurface, borderBottomColor: theme.borderColor }}>
      <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
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
              e.target.parentNode.appendChild(span);
              e.target.remove();
            }}
          />
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium" style={{ color: theme.textSecondary }}>
          <Link to="/" className="hover:text-black transition" style={{ color: theme.textSecondary }}>Producto</Link>
          <Link to="/scanner" className="hover:text-black transition" style={{ color: theme.textSecondary }}>ATS Scanner</Link>
          <Link to="/pricing" className="hover:text-black transition" style={{ color: theme.textSecondary }}>Pricing</Link>
          <Link to="/blog" className="hover:text-black transition" style={{ color: theme.textSecondary }}>Blog</Link>
        </nav>
        <ThemeSwitcher />
        <button className="px-5 py-3 rounded-2xl font-semibold hover:scale-105 transition" style={{ backgroundColor: theme.buttonBg, color: theme.buttonText }}>
          Probar gratis
        </button>
      </div>
    </header>
  );
}