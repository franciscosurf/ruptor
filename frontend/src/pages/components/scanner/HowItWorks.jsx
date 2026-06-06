import React from 'react';

export const HowItWorks = () => (
  <section className="py-28" style={{ background: 'var(--bgSurface)' }}>
    <div className="max-w-7xl mx-auto px-6">
      <div className="text-center mb-20">
        <span className="gradient-text font-bold uppercase tracking-widest text-sm">Cómo funciona</span>
        <h2 className="text-5xl font-black mt-4 mb-6" style={{ color: 'var(--textPrimary)' }}>Edición profesional sin complicaciones</h2>
      </div>
      <div className="grid md:grid-cols-3 gap-8">
        {[1, 2, 3].map((step, idx) => (
          <div key={idx} className="rounded-[32px] p-10 shadow-xl" style={{ background: 'var(--cardBg)', border: `1px solid var(--borderColor)` }}>
            <h3 className="text-2xl font-black mb-4" style={{ color: 'var(--textPrimary)' }}>
              {idx === 0 ? '1. Subes tu CV' : idx === 1 ? '2. Edición directa' : '3. Descarga impecable'}
            </h3>
            <p className="text-gray-600" style={{ color: 'var(--textSecondary)' }}>
              {idx === 0 && 'Carga tu PDF y la IA analizará su compatibilidad con la oferta.'}
              {idx === 1 && 'Haz clic en cualquier palabra, modifícala y observa los cambios al instante.'}
              {idx === 2 && 'El PDF generado conserva tipografías, tamaños y posiciones originales.'}
            </p>
          </div>
        ))}
      </div>
    </div>
  </section>
);