import React from 'react';
import { Link } from 'react-router-dom';
import { Header } from '../components/layout/Header';

export default function Pricing() {
  return (
    <div className="overflow-x-hidden">
      {/* Tailwind CDN (ya debería estar incluido en index.html, pero lo añadimos por si acaso) */}
      <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet" />
      <style>{`
        body {
          font-family: 'Inter', sans-serif;
          background: #ffffff;
          color: #0b1020;
        }
        .gradient-text {
          background: linear-gradient(90deg, #7c3aed, #2563eb);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .grid-bg {
          background-image: linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px);
          background-size: 40px 40px;
        }
        .card {
          background: rgba(255,255,255,0.82);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(0,0,0,0.06);
        }
        .popular-card {
          background: linear-gradient(180deg, #0b1020 0%, #121933 100%);
          color: white;
          border: 1px solid rgba(255,255,255,0.08);
          transform: scale(1.04);
          position: relative;
          overflow: hidden;
        }
        .popular-card::before {
          content: "";
          position: absolute;
          inset: -100px;
          background: radial-gradient(circle, rgba(124,58,237,0.28), transparent 60%);
        }
        .glow {
          position: absolute;
          width: 600px;
          height: 600px;
          border-radius: 999px;
          background: radial-gradient(circle, rgba(99,102,241,0.16), transparent 70%);
          top: -250px;
          right: -250px;
        }
        .check {
          color: #2563eb;
          font-weight: bold;
        }
      `}</style>

      {/* NAV (Header con Links) */}
      {/* HEADER */}
        <Header />

      {/* HERO */}
      <section className="relative overflow-hidden grid-bg">
        <div className="glow"></div>
        <div className="max-w-7xl mx-auto px-6 py-28 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 bg-black/5 border border-black/5 rounded-full px-4 py-2 mb-8">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            <span className="text-sm font-medium">Pricing simple. Sin humo corporativo.</span>
          </div>
          <h1 className="text-6xl md:text-7xl font-black tracking-tight leading-none mb-8">
            Paga por
            <span className="gradient-text"> entrevistas,</span>
            <br />
            no por rechazos automáticos.
          </h1>
          <p className="text-xl md:text-2xl text-black/60 max-w-3xl mx-auto leading-relaxed">
            Optimiza tu CV para superar ATS modernos y aumentar tus posibilidades de llegar a recruiters reales.
          </p>
        </div>
      </section>

      {/* PRICING CARDS */}
      <section className="py-10 pb-28">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-3 gap-8 items-start">
            {/* Free */}
            <div className="card rounded-[32px] p-10 shadow-xl">
              <div className="mb-8">
                <span className="text-sm font-bold uppercase tracking-widest text-black/40">Gratis</span>
                <h2 className="text-4xl font-black mt-3 mb-4">Free</h2>
                <div className="flex items-end gap-2 mb-4">
                  <span className="text-6xl font-black">0€</span>
                  <span className="text-black/40 mb-2">/mes</span>
                </div>
                <p className="text-black/60">Perfecto para probar cómo leen tu CV los ATS.</p>
              </div>
              <div className="space-y-4 mb-10">
                <div className="flex gap-3"><span className="check">✓</span><span>1 análisis ATS</span></div>
                <div className="flex gap-3"><span className="check">✓</span><span>Score ATS básico</span></div>
                <div className="flex gap-3"><span className="check">✓</span><span>Sugerencias automáticas</span></div>
                <div className="flex gap-3 opacity-40"><span>—</span><span>Optimización IA avanzada</span></div>
                <div className="flex gap-3 opacity-40"><span>—</span><span>CV ilimitados</span></div>
              </div>
              <button className="w-full py-4 rounded-2xl border border-black/10 font-semibold hover:bg-black/5 transition">
                Empezar gratis
              </button>
            </div>

            {/* Pro */}
            <div className="popular-card rounded-[32px] p-10 shadow-2xl">
              <div className="absolute top-5 right-5 bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs font-bold px-4 py-2 rounded-full">
                MÁS POPULAR
              </div>
              <div className="relative z-10">
                <div className="mb-8">
                  <span className="text-sm font-bold uppercase tracking-widest text-white/50">Profesional</span>
                  <h2 className="text-4xl font-black mt-3 mb-4">Pro</h2>
                  <div className="flex items-end gap-2 mb-4">
                    <span className="text-6xl font-black">19€</span>
                    <span className="text-white/40 mb-2">/mes</span>
                  </div>
                  <p className="text-white/70">Para candidatos que quieren maximizar entrevistas.</p>
                </div>
                <div className="space-y-4 mb-10">
                  <div className="flex gap-3"><span className="text-blue-400 font-bold">✓</span><span>CVs ilimitados</span></div>
                  <div className="flex gap-3"><span className="text-blue-400 font-bold">✓</span><span>Optimización ATS avanzada</span></div>
                  <div className="flex gap-3"><span className="text-blue-400 font-bold">✓</span><span>Matching con ofertas reales</span></div>
                  <div className="flex gap-3"><span className="text-blue-400 font-bold">✓</span><span>Reescritura IA de CV</span></div>
                  <div className="flex gap-3"><span className="text-blue-400 font-bold">✓</span><span>Keywords optimizadas</span></div>
                  <div className="flex gap-3"><span className="text-blue-400 font-bold">✓</span><span>Prioridad en nuevas funciones</span></div>
                </div>
                <button className="w-full py-4 rounded-2xl bg-white text-black font-bold hover:scale-105 transition">
                  Probar Pro
                </button>
              </div>
            </div>

            {/* Elite */}
            <div className="card rounded-[32px] p-10 shadow-xl">
              <div className="mb-8">
                <span className="text-sm font-bold uppercase tracking-widest text-black/40">Career Boost</span>
                <h2 className="text-4xl font-black mt-3 mb-4">Elite</h2>
                <div className="flex items-end gap-2 mb-4">
                  <span className="text-6xl font-black">49€</span>
                  <span className="text-black/40 mb-2">/mes</span>
                </div>
                <p className="text-black/60">Optimización total para procesos competitivos.</p>
              </div>
              <div className="space-y-4 mb-10">
                <div className="flex gap-3"><span className="check">✓</span><span>Todo en Pro</span></div>
                <div className="flex gap-3"><span className="check">✓</span><span>CV adaptado por oferta</span></div>
                <div className="flex gap-3"><span className="check">✓</span><span>Generación de cover letters IA</span></div>
                <div className="flex gap-3"><span className="check">✓</span><span>Preparación entrevistas</span></div>
                <div className="flex gap-3"><span className="check">✓</span><span>LinkedIn optimization</span></div>
                <div className="flex gap-3"><span className="check">✓</span><span>Soporte prioritario</span></div>
              </div>
              <button className="w-full py-4 rounded-2xl bg-black text-white font-semibold hover:scale-105 transition">
                Ir a Elite
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* COMPARISON */}
      <section className="py-24 bg-black text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full bg-purple-600 blur-3xl"></div>
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10 text-center">
          <h2 className="text-5xl font-black mb-8">El problema no eres tú.</h2>
          <p className="text-2xl text-white/70 max-w-3xl mx-auto leading-relaxed mb-20">
            El problema es que los ATS modernos filtran candidatos antes de que un recruiter pueda ver su potencial.
          </p>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white/5 border border-white/10 rounded-[32px] p-10 text-left">
              <h3 className="text-3xl font-black mb-8 text-red-400">Sin ruptor</h3>
              <div className="space-y-5 text-white/60">
                <div>✕ CV rechazado automáticamente</div>
                <div>✕ Keywords incorrectas</div>
                <div>✕ Formato incompatible ATS</div>
                <div>✕ Baja visibilidad</div>
                <div>✕ Aplicaciones ignoradas</div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-purple-600 to-blue-500 rounded-[32px] p-10 text-left">
              <h3 className="text-3xl font-black mb-8">Con ruptor</h3>
              <div className="space-y-5 text-white/90">
                <div>✓ CV optimizado para IA</div>
                <div>✓ Mejor score ATS</div>
                <div>✓ Keywords estratégicas</div>
                <div>✓ Más entrevistas</div>
                <div>✓ Más posibilidades reales</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-28">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-black mb-6">Preguntas frecuentes</h2>
            <p className="text-xl text-black/60">Todo lo que necesitas saber sobre ruptor.</p>
          </div>
          <div className="space-y-6">
            <div className="card rounded-3xl p-8">
              <h3 className="text-xl font-bold mb-3">¿Qué hace exactamente ruptor?</h3>
              <p className="text-black/60 leading-relaxed">Analiza y optimiza tu CV para que sea compatible con sistemas ATS modernos utilizados por empresas y recruiters.</p>
            </div>
            <div className="card rounded-3xl p-8">
              <h3 className="text-xl font-bold mb-3">¿Realmente mejora mis posibilidades?</h3>
              <p className="text-black/60 leading-relaxed">Sí. Muchos candidatos son descartados automáticamente por formato, keywords o estructura antes de llegar a revisión humana.</p>
            </div>
            <div className="card rounded-3xl p-8">
              <h3 className="text-xl font-bold mb-3">¿Puedo cancelar cuando quiera?</h3>
              <p className="text-black/60 leading-relaxed">Sí. Sin permanencia ni contratos extraños.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="pb-28">
        <div className="max-w-5xl mx-auto px-6">
          <div className="rounded-[40px] p-14 bg-gradient-to-br from-purple-600 to-blue-500 text-white text-center shadow-2xl">
            <h2 className="text-5xl font-black mb-6">Tu CV merece llegar a una persona real.</h2>
            <p className="text-xl text-white/80 max-w-2xl mx-auto mb-10">Empieza gratis y descubre cómo los ATS están leyendo tu candidatura.</p>
            <Link to="/" className="px-10 py-5 bg-white text-black rounded-2xl text-lg font-bold hover:scale-105 transition inline-block">
              Empezar ahora
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-black/5 py-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center text-white font-bold">⚡</div>
            <span className="font-bold text-lg">ruptor</span>
          </Link>
          <p className="text-black/40 text-sm">© 2026 ruptor — Supera el filtro. Llega al humano.</p>
        </div>
      </footer>
    </div>
  );
}