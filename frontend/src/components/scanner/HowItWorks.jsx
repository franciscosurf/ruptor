// src/components/scanner/HowItWorks.jsx
import React from 'react';

export const HowItWorks = () => (
  <section className="py-28 bg-gray-50/50">
    <div className="max-w-7xl mx-auto px-6">
      <div className="text-center mb-20">
        <span className="gradient-text font-bold uppercase tracking-widest text-sm">Cómo funciona</span>
        <h2 className="text-5xl font-black mt-4 mb-6">Edición profesional sin complicaciones</h2>
      </div>
      <div className="grid md:grid-cols-3 gap-8">
        <div className="bg-white rounded-[32px] p-10 shadow-xl border border-gray-100">
          <h3 className="text-2xl font-black mb-4">1. Subes tu CV</h3>
          <p className="text-gray-600">Carga tu PDF y la IA analizará su compatibilidad con la oferta.</p>
        </div>
        <div className="bg-white rounded-[32px] p-10 shadow-xl border border-gray-100">
          <h3 className="text-2xl font-black mb-4">2. Edición directa</h3>
          <p className="text-gray-600">Haz clic en cualquier palabra, modifícala y observa los cambios al instante.</p>
        </div>
        <div className="bg-white rounded-[32px] p-10 shadow-xl border border-gray-100">
          <h3 className="text-2xl font-black mb-4">3. Descarga impecable</h3>
          <p className="text-gray-600">El PDF generado conserva tipografías, tamaños y posiciones originales.</p>
        </div>
      </div>
    </div>
  </section>
);