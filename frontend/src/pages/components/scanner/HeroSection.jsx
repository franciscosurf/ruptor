import React from 'react';

export const HeroSection = ({ onStart }) => (
  <section className="relative overflow-hidden grid-bg">
    <div className="hero-glow"></div>
    <div className="max-w-7xl mx-auto px-6 py-28 relative z-10 text-center">
      <div className="inline-flex items-center gap-2 rounded-full px-4 py-2 mb-8 mx-auto" style={{ background: 'var(--bgSurface)', border: `1px solid var(--borderColor)` }}>
        <span className="w-2 h-2 rounded-full bg-green-500"></span>
        <span className="text-sm font-medium" style={{ color: 'var(--textSecondary)' }}>Editor In-Place Profesional</span>
      </div>
      <h1 className="text-6xl md:text-7xl font-black tracking-tight leading-none mb-8 max-w-4xl mx-auto">
        El <span className="gradient-text">75%</span> de CVs no lo lee nadie
      </h1>
      <p className="text-xl md:text-2xl leading-relaxed mb-10 max-w-2xl mx-auto" style={{ color: 'var(--textSecondary)' }}>
        El tuyo sí. Analízalo, mejora lo que falla y descárgalo listo para cualquier filtro.
      </p>
      <button
        onClick={onStart}
        className="px-10 py-5 rounded-2xl text-white text-lg font-bold hover:scale-105 transition shadow-2xl"
        style={{ background: 'linear-gradient(90deg, var(--gradientFrom), var(--gradientTo))' }}
      >
        Analizar mi CV
      </button>
    </div>
  </section>
);