// src/components/scanner/HeroSection.jsx
import React from 'react';

export const HeroSection = ({ onStart }) => (
  <section className="relative overflow-hidden grid-bg">
    <div className="hero-glow"></div>
    <div className="max-w-7xl mx-auto px-6 py-28 relative z-10 text-center">
      <div className="inline-flex items-center gap-2 bg-black/5 rounded-full px-4 py-2 mb-8 mx-auto">
        <span className="w-2 h-2 rounded-full bg-green-500"></span>
        <span className="text-sm font-medium">Editor In-Place Profesional</span>
      </div>
      <h1 className="text-6xl md:text-7xl font-black tracking-tight leading-none mb-8 max-w-4xl mx-auto">
        Descubre cómo <span className="gradient-text">te filtra</span> la IA.
      </h1>
      <p className="text-xl md:text-2xl text-black/60 leading-relaxed mb-10 max-w-2xl mx-auto">
        Edita tu CV directamente en el visor y descárgalo con cambios profesionales. Sin pérdida de formato ni calidad.
      </p>
      <button onClick={onStart} className="px-10 py-5 rounded-2xl bg-black text-white text-lg font-bold hover:scale-105 transition shadow-2xl">
        Subir mi CV y Analizar
      </button>
    </div>
  </section>
);