import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../../contexts/ThemeContext';   // ✅ corregido

export const Hero = () => {
  const { theme } = useTheme();

  return (
    <section className="relative overflow-hidden grid-bg">
      <div className="max-w-7xl mx-auto px-6 py-28 relative z-10">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          {/* LEFT */}
          <div>
            <div className="hero-glow"></div>
            <div className="max-w-7xl mx-auto px-6 py-28 relative z-10">
              <div className="max-w-4xl">
                <div className="inline-flex items-center gap-2 bg-white border border-black/5 rounded-full px-4 py-2 mb-8" style={{ backgroundColor: theme.bgSurface, borderColor: theme.borderColor }}>
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  <span className="text-sm font-medium" style={{ color: theme.textSecondary }}>Optimizado para ATS modernos con IA</span>
                </div>
                <h1 className="text-6xl md:text-7xl font-black tracking-tight leading-none mb-8">
                  <span className="gradient-text">La IA </span><span className="textWhiteDark">rechaza tu CV antes de que alguien lo lea</span>
                </h1>
                <p className="text-xl md:text-2xl leading-relaxed max-w-3xl mb-12" style={{ color: theme.textSecondary }}>
                  Analízalo contra la oferta y corrígelo en tiempo real.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link to="/scanner" className="px-8 py-5 rounded-2xl text-white text-lg font-semibold hover:scale-105 transition shadow-2xl inline-block" style={{ background: `linear-gradient(90deg, ${theme.gradientFrom}, ${theme.gradientTo})` }}>
                    Analizar mi CV
                  </Link>
                  <button className="px-8 py-5 rounded-2xl text-lg font-semibold hover:bg-black/5 transition" style={{ color: theme.textDark, border: `1px solid ${theme.borderColor}`, backgroundColor: 'white' }}>
                    Ver demo
                  </button>
                </div>
              </div>
            </div>
          </div>
          {/* RIGHT: demo card con valores estáticos (para ejemplo) */}
          <div className="relative">
            <div className="glass rounded-[40px] p-8 shadow-2xl relative overflow-hidden" style={{ backgroundColor: theme.bgSurface, border: `1px solid ${theme.borderColor}` }}>
              <div className="scanner-line"></div>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wider" style={{ color: theme.textTertiary }}>ATS SCORE</p>
                  <h2 className="text-3xl font-black mt-2">CV Analysis</h2>
                </div>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white text-xl" style={{ background: `linear-gradient(135deg, ${theme.gradientFrom}, ${theme.gradientTo})` }}>
                  ⚡
                </div>
              </div>
              <div className="flex flex-col items-center mb-10">
                <div className="score-ring mb-6">
                  <div className="score-inner">
                    <span className="text-5xl font-black textDark" style={{ color: theme.textDark }} >82</span>
                    <span className="text-sm font-semibold textDark" style={{ color: theme.textDark }} >ATS SCORE</span>
                  </div>
                </div>
                <p className="text-center max-w-sm" style={{ color: theme.textSecondary }}>Tu CV tiene buena compatibilidad ATS, pero todavía hay mejoras clave para aumentar visibilidad.</p>
              </div>
              <div className="space-y-5">
                {[
                  { label: 'Keywords Match', value: 91 },
                  { label: 'ATS Formatting', value: 76 },
                  { label: 'Recruiter Visibility', value: 69 },
                ].map((item) => (
                  <div key={item.label} className="rounded-2xl p-5" style={{ backgroundColor: 'rgba(0,0,0,0.03)', border: `1px solid ${theme.borderColor}` }}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold">{item.label}</span>
                      <span className="font-bold" style={{ color: '#3b82f6' }}>{item.value}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(0,0,0,0.05)' }}>
                      <div className="h-full rounded-full" style={{ width: `${item.value}%`, background: `linear-gradient(90deg, ${theme.gradientFrom}, ${theme.gradientTo})` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};