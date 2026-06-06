import React from 'react';
import { useTheme } from '../../../contexts/ThemeContext';   // ✅ corregido (contexts, no context)

export const Features = () => {
  const { theme } = useTheme();

  return (
    <>
      {/* CÓMO FUNCIONA */}
      <section className="py-28">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <span className="gradient-text font-bold uppercase tracking-widest text-sm">Cómo funciona</span>
            <h2 className="text-6xl font-black mb-8">
              Tu talento no está siendo rechazado.
              <span className="gradient-text block">Tu CV sí.</span>
            </h2>
            <p className="text-xl max-w-2xl mx-auto" style={{ color: theme.textSecondary }}>Convierte un CV invisible para IA en una candidatura optimizada para superar filtros automáticos.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: '📄', title: 'Escaneo ATS', desc: 'Analizamos cómo interpreta tu CV un sistema ATS moderno y detectamos puntos débiles automáticamente.' },
              { icon: '⚡', title: 'Optimización IA', desc: 'Mejoramos keywords, estructura y compatibilidad para aumentar tu score ATS y pasar filtros.' },
              { icon: '🎯', title: 'Más entrevistas', desc: 'Porque el objetivo real no es “tener un CV bonito”, sino llegar al recruiter humano.' },
            ].map((item) => (
              <div key={item.title} className="card rounded-3xl p-8 shadow-xl" style={{ backgroundColor: theme.cardBg, border: `1px solid ${theme.borderColor}` }}>
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-6" style={{ background: `linear-gradient(135deg, ${theme.gradientFrom}, ${theme.gradientTo})` }}>
                  {item.icon}
                </div>
                <h3 className="text-2xl font-bold mb-4">{item.title}</h3>
                <p className="leading-relaxed" style={{ color: theme.textSecondary }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SOCIAL PROOF - El mercado cambió */}
      <section className="py-24 text-white relative overflow-hidden" style={{ backgroundColor: '#000000' }}>
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full blur-3xl" style={{ backgroundColor: theme.gradientFrom }}></div>
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10 text-center">
          <h2 className="text-5xl font-black mb-8">El mercado cambió.</h2>
          <p className="text-2xl text-white/70 max-w-3xl mx-auto leading-relaxed mb-16">
            Hoy la mayoría de candidatos son rechazados antes de que un humano lea su CV. ruptor nace para cambiar eso.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            <div><div className="text-6xl font-black gradient-text mb-3">75%</div><p className="text-white/60">de CVs nunca llegan a un recruiter</p></div>
            <div><div className="text-6xl font-black gradient-text mb-3">+3x</div><p className="text-white/60">más posibilidades de pasar ATS</p></div>
            <div><div className="text-6xl font-black gradient-text mb-3">IA</div><p className="text-white/60">optimizando cada candidatura</p></div>
          </div>
        </div>
      </section>

      {/* CTA - Tu próximo trabajo */}
      <section className="py-28">
        <div className="max-w-5xl mx-auto px-6">
          <div className="rounded-[40px] p-14 text-white text-center shadow-2xl" style={{ background: `linear-gradient(135deg, ${theme.gradientFrom}, ${theme.gradientTo})` }}>
            <h2 className="text-5xl font-black mb-6">Tu próximo trabajo no debería perderse en un algoritmo.</h2>
            <p className="text-xl text-white/80 max-w-2xl mx-auto mb-10">Empieza gratis y descubre cómo los ATS están leyendo realmente tu CV.</p>
            <button className="px-10 py-5 rounded-2xl text-lg font-bold hover:scale-105 transition" style={{ backgroundColor: 'white', color: 'black' }}>
              Probar ruptor gratis
            </button>
          </div>
        </div>
      </section>
    </>
  );
};