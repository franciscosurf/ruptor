import React, { useEffect } from 'react'; 
import { Header } from './components/layout/Header';
import { Hero } from './components/home/Hero';
import { Features } from './components/home/Features';
import { Link } from 'react-router-dom';
import { ThemeProvider } from '../contexts/ThemeContext';   // ✅ corregido
//import '../styles/themes.css';         
import { useTheme } from '../contexts/ThemeContext';                    // ✅ corregido

import { HeaderDark } from './components/layout/HeaderDark';
import { HeroDark } from './components/home/HeroDark';

// Componente interno que aplica el tema al body
const ThemedApp = () => {
  const { theme, currentTheme } = useTheme();

  useEffect(() => {
    // Aplicar variables CSS globales al elemento root
    const root = document.documentElement;
    Object.entries(theme).forEach(([key, value]) => {
      root.style.setProperty(`--${key}`, value);
    });
    // También se puede añadir una clase al body
    document.body.className = `theme-${currentTheme}`;
  }, [theme, currentTheme]);

  return (
    <>
      {/* Tailwind CSS CDN y estilos personalizados */}
      <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet" />
      <style>{`
        .bgPurple { background: linear-gradient(90deg, var(--gradientFrom), var(--gradientTo)); }
        body {
          font-family: 'Inter', sans-serif;
          background: var(--bgPrimary);
          color: var(--textPrimary);
        }
        .gradient-text {
          background: linear-gradient(90deg, var(--gradientFrom), var(--gradientTo));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .hero-glow {
          position: absolute;
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, var(--heroGlow) 0%, transparent 70%);
          top: -120px;
          right: -120px;
          z-index: 0;
        }
        .grid-bg {
          background-image: linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px);
          background-size: 40px 40px;
        }
        .card {
          background: var(--cardBg);
          backdrop-filter: blur(10px);
          border: 1px solid var(--borderColor);
        }
      `}</style>

      <div className="font-['Inter',sans-serif] overflow-x-hidden" style={{ background: 'var(--bgPrimary)', color: 'var(--textPrimary)' }}>
        <HeaderDark />
        <HeroDark />
        <Features />

        <footer className="border-t py-10" style={{ borderTopColor: 'var(--borderColor)' }}>
          <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold" style={{ background: 'linear-gradient(135deg, var(--gradientFrom), var(--gradientTo))' }}>
                ⚡
              </div>
              <span className="font-bold text-lg">ruptor</span>
            </div>
            <p className="text-sm" style={{ color: 'var(--textTertiary)' }}>© 2026 ruptor — Supera el filtro. Llega al humano.</p>
          </div>
        </footer>
      </div>
    </>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <ThemedApp />
    </ThemeProvider>
  );
}