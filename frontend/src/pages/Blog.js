import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '../components/layout/Header';

export default function Blog() {
  // Estado para el filtro activo (solo UI, sin funcionalidad real)
  const [activeFilter, setActiveFilter] = useState('Todos');

  const filters = ['Todos', 'ATS', 'CV Optimization', 'Recruiters', 'LinkedIn', 'Interviews'];

  return (
    <div className="overflow-x-hidden">
      {/* Tailwind CDN (si no está ya en el index.html) */}
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
          transition: all 0.25s ease;
        }
        .card:hover {
          transform: translateY(-6px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.08);
        }
        .hero-glow {
          position: absolute;
          width: 700px;
          height: 700px;
          border-radius: 999px;
          background: radial-gradient(circle, rgba(99,102,241,0.18), transparent 70%);
          top: -300px;
          right: -250px;
        }
        .article-gradient {
          background: linear-gradient(135deg, #7c3aed 0%, #2563eb 100%);
        }
        .tag {
          background: rgba(0,0,0,0.05);
          border: 1px solid rgba(0,0,0,0.05);
        }
      `}</style>

      {/* HEADER */}
      <Header />

      {/* HERO */}
      <section className="relative overflow-hidden grid-bg">
        <div className="hero-glow"></div>
        <div className="max-w-7xl mx-auto px-6 py-28 relative z-10">
          <div className="max-w-5xl">
            <div className="inline-flex items-center gap-2 bg-black/5 border border-black/5 rounded-full px-4 py-2 mb-8">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              <span className="text-sm font-medium">Estrategias reales para superar ATS modernos</span>
            </div>
            <h1 className="text-6xl md:text-7xl font-black tracking-tight leading-none mb-8">
              El blog para
              <span className="gradient-text"> vencer filtros ATS.</span>
            </h1>
            <p className="text-xl md:text-2xl text-black/60 leading-relaxed max-w-3xl">
              Aprende cómo funcionan realmente los sistemas ATS,
              cómo optimizar tu CV y cómo conseguir que un humano vea tu candidatura.
            </p>
          </div>
        </div>
      </section>

      {/* FEATURED ARTICLE */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="article-gradient rounded-[40px] overflow-hidden shadow-2xl">
            <div className="grid lg:grid-cols-2">
              <div className="p-14 text-white flex flex-col justify-center">
                <div className="inline-flex w-fit items-center gap-2 bg-white/10 border border-white/10 rounded-full px-4 py-2 mb-8">
                  <span className="text-sm font-semibold">FEATURED ARTICLE</span>
                </div>
                <h2 className="text-5xl font-black leading-tight mb-6">
                  Cómo funcionan realmente los ATS en 2026
                </h2>
                <p className="text-xl text-white/75 leading-relaxed mb-10">
                  La mayoría de candidatos son rechazados automáticamente antes de que un recruiter vea su CV.
                  Te enseñamos cómo evitarlo.
                </p>
                <div className="flex items-center gap-6">
                  <button className="px-8 py-4 rounded-2xl bg-white text-black font-bold hover:scale-105 transition">
                    Leer artículo
                  </button>
                  <span className="text-white/60">8 min lectura</span>
                </div>
              </div>
              <div className="relative min-h-[420px] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="relative z-10 w-[320px] h-[320px] rounded-[40px] bg-white/10 backdrop-blur-xl border border-white/10 flex items-center justify-center">
                  <div className="text-[120px]">⚡</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BLOG GRID */}
      <section className="pb-28">
        <div className="max-w-7xl mx-auto px-6">
          {/* FILTERS (solo UI) */}
          <div className="flex flex-wrap gap-4 mb-16">
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-5 py-3 rounded-2xl font-semibold transition ${
                  activeFilter === filter
                    ? 'bg-black text-white'
                    : 'tag hover:bg-black hover:text-white'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          {/* ARTICLES GRID */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Artículo 1 */}
            <article className="card rounded-[32px] overflow-hidden shadow-xl">
              <div className="h-56 article-gradient flex items-center justify-center text-white text-7xl">🤖</div>
              <div className="p-8">
                <div className="flex items-center gap-3 mb-5">
                  <span className="px-3 py-1 rounded-full bg-black/5 text-sm font-semibold">ATS</span>
                  <span className="text-sm text-black/40">6 min</span>
                </div>
                <h3 className="text-3xl font-black leading-tight mb-4">7 errores que hacen que tu CV sea rechazado por IA</h3>
                <p className="text-black/60 leading-relaxed mb-8">
                  Muchos CVs nunca llegan a un recruiter humano por pequeños errores de estructura o keywords.
                </p>
                <a href="#" className="font-bold text-lg hover:opacity-70 transition">Leer más →</a>
              </div>
            </article>

            {/* Artículo 2 */}
            <article className="card rounded-[32px] overflow-hidden shadow-xl">
              <div className="h-56 bg-black flex items-center justify-center text-white text-7xl">📄</div>
              <div className="p-8">
                <div className="flex items-center gap-3 mb-5">
                  <span className="px-3 py-1 rounded-full bg-black/5 text-sm font-semibold">CV</span>
                  <span className="text-sm text-black/40">9 min</span>
                </div>
                <h3 className="text-3xl font-black leading-tight mb-4">El formato perfecto para pasar filtros ATS</h3>
                <p className="text-black/60 leading-relaxed mb-8">
                  Diseños bonitos pueden destruir tu compatibilidad ATS. Este es el formato que sí funciona.
                </p>
                <a href="#" className="font-bold text-lg hover:opacity-70 transition">Leer más →</a>
              </div>
            </article>

            {/* Artículo 3 */}
            <article className="card rounded-[32px] overflow-hidden shadow-xl">
              <div className="h-56 bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white text-7xl">💼</div>
              <div className="p-8">
                <div className="flex items-center gap-3 mb-5">
                  <span className="px-3 py-1 rounded-full bg-black/5 text-sm font-semibold">Career</span>
                  <span className="text-sm text-black/40">5 min</span>
                </div>
                <h3 className="text-3xl font-black leading-tight mb-4">Lo que los recruiters nunca te dicen</h3>
                <p className="text-black/60 leading-relaxed mb-8">
                  La realidad del recruiting moderno y cómo los algoritmos están cambiando la contratación.
                </p>
                <a href="#" className="font-bold text-lg hover:opacity-70 transition">Leer más →</a>
              </div>
            </article>

            {/* Artículo 4 */}
            <article className="card rounded-[32px] overflow-hidden shadow-xl">
              <div className="h-56 bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-7xl">🔍</div>
              <div className="p-8">
                <div className="flex items-center gap-3 mb-5">
                  <span className="px-3 py-1 rounded-full bg-black/5 text-sm font-semibold">ATS</span>
                  <span className="text-sm text-black/40">11 min</span>
                </div>
                <h3 className="text-3xl font-black leading-tight mb-4">Cómo piensan los ATS modernos</h3>
                <p className="text-black/60 leading-relaxed mb-8">
                  Parsing, semantic matching, AI ranking y todo lo que ocurre cuando subes un CV.
                </p>
                <a href="#" className="font-bold text-lg hover:opacity-70 transition">Leer más →</a>
              </div>
            </article>

            {/* Artículo 5 */}
            <article className="card rounded-[32px] overflow-hidden shadow-xl">
              <div className="h-56 bg-gradient-to-br from-indigo-600 to-blue-500 flex items-center justify-center text-white text-7xl">⚡</div>
              <div className="p-8">
                <div className="flex items-center gap-3 mb-5">
                  <span className="px-3 py-1 rounded-full bg-black/5 text-sm font-semibold">Optimization</span>
                  <span className="text-sm text-black/40">7 min</span>
                </div>
                <h3 className="text-3xl font-black leading-tight mb-4">Cómo aumentar tu ATS Score rápidamente</h3>
                <p className="text-black/60 leading-relaxed mb-8">
                  Cambios pequeños que pueden aumentar drásticamente la visibilidad de tu candidatura.
                </p>
                <a href="#" className="font-bold text-lg hover:opacity-70 transition">Leer más →</a>
              </div>
            </article>

            {/* Artículo 6 */}
            <article className="card rounded-[32px] overflow-hidden shadow-xl">
              <div className="h-56 bg-gradient-to-br from-black to-gray-700 flex items-center justify-center text-white text-7xl">🧠</div>
              <div className="p-8">
                <div className="flex items-center gap-3 mb-5">
                  <span className="px-3 py-1 rounded-full bg-black/5 text-sm font-semibold">AI Recruiting</span>
                  <span className="text-sm text-black/40">10 min</span>
                </div>
                <h3 className="text-3xl font-black leading-tight mb-4">El futuro del recruiting ya es IA</h3>
                <p className="text-black/60 leading-relaxed mb-8">
                  Cómo la inteligencia artificial está transformando el mercado laboral y qué hacer para adaptarte.
                </p>
                <a href="#" className="font-bold text-lg hover:opacity-70 transition">Leer más →</a>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* NEWSLETTER */}
      <section className="pb-28">
        <div className="max-w-5xl mx-auto px-6">
          <div className="rounded-[40px] p-14 bg-gradient-to-br from-purple-600 to-blue-500 text-white text-center shadow-2xl">
            <h2 className="text-5xl font-black mb-6">Aprende a superar ATS modernos.</h2>
            <p className="text-xl text-white/80 max-w-2xl mx-auto mb-10">
              Recibe estrategias, ejemplos reales y hacks de recruiting directamente en tu email.
            </p>
            <div className="flex flex-col md:flex-row gap-4 justify-center max-w-2xl mx-auto">
              <input
                type="email"
                placeholder="tu@email.com"
                className="flex-1 px-6 py-5 rounded-2xl text-black outline-none text-lg"
              />
              <button className="px-8 py-5 bg-black text-white rounded-2xl text-lg font-bold hover:scale-105 transition">
                Suscribirme
              </button>
            </div>
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