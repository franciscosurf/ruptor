import React, { useState, useEffect } from 'react';
import { useAnalysis } from './hooks/useAnalysis';
import { useOptimizer } from './hooks/useOptimizer';
import { Header } from './components/layout/Header';
import { Link } from 'react-router-dom';

export default function App() {
  const {
    file, fileName, jobDescription, analysisMode, result, loading, error,
    handleFileChange, setJobDescription, setAnalysisMode, handleSubmit, handleExportReport,
    setResult
  } = useAnalysis();

  const { showOptimizer, cvOptimizations, loadingOptimizer, handleOptimizeCV, closeOptimizer } = useOptimizer(file, jobDescription);

  const [showModal, setShowModal] = useState(false);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    if (result) setShowResults(true);
  }, [result]);

  const handleNewAnalysis = () => {
    setResult(null);
    setShowResults(false);
  };

  const closeModal = () => setShowModal(false);

  const scrollToSuggestions = () => {
    const el = document.getElementById('suggestions-section');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <>
      {/* Tailwind CSS CDN y estilos personalizados */}
      <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet" />
        <style>{` 
      .bgPurple {background: linear-gradient(90deg,#7c3aed,#2563eb);}
    `}</style>
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
        .hero-glow {
          position: absolute;
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(99,102,241,0.20) 0%, rgba(255,255,255,0) 70%);
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
          background: rgba(255,255,255,0.8);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(0,0,0,0.06);
        }
      `}</style>

      <div className="font-['Inter',sans-serif] bg-white text-[#0b1020] overflow-x-hidden">
        {/* HEADER */}
        <Header />

        {/* HERO */}
        <section className="relative overflow-hidden grid-bg">
          <div className="hero-glow"></div>
          <div className="max-w-7xl mx-auto px-6 py-28 relative z-10">
            <div className="max-w-4xl">
              <div className="inline-flex items-center gap-2 bg-white border border-black/5 rounded-full px-4 py-2 mb-8">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                <span className="text-sm font-medium">Optimizado para ATS modernos con IA</span>
              </div>
              <h1 className="text-6xl md:text-7xl font-black tracking-tight leading-none mb-8">
                Supera el filtro ATS
                <span className="gradient-text block">Consigue el puesto.</span>
              </h1>
              <p className="text-xl md:text-2xl text-black/60 leading-relaxed max-w-3xl mb-12">
                Analiza tu CV contra la oferta y recibe sugerencias en tiempo real para pasar el filtro.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/scanner" className="px-8 py-5 rounded-2xl bgPurple text-white text-lg font-semibold hover:scale-105 transition shadow-2xl inline-block">
                  Analizar mi CV
                </Link>
                <button className="px-8 py-5 rounded-2xl border border-black/10 bg-white text-lg font-semibold hover:bg-black/5 transition">
                  Ver demo
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES - Cómo funciona */}
        <section className="py-28">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-20">
              <span className="gradient-text font-bold uppercase tracking-widest text-sm">Cómo funciona</span>
              <h2 className="text-5xl font-black mt-4 mb-6">Hackea el proceso ATS</h2>
              <p className="text-xl text-black/60 max-w-2xl mx-auto">Convierte un CV invisible para IA en una candidatura optimizada para superar filtros automáticos.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="card rounded-3xl p-8 shadow-xl">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center text-2xl mb-6">📄</div>
                <h3 className="text-2xl font-bold mb-4">Escaneo ATS</h3>
                <p className="text-black/60 leading-relaxed">Analizamos cómo interpreta tu CV un sistema ATS moderno y detectamos puntos débiles automáticamente.</p>
              </div>
              <div className="card rounded-3xl p-8 shadow-xl">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center text-2xl mb-6">⚡</div>
                <h3 className="text-2xl font-bold mb-4">Optimización IA</h3>
                <p className="text-black/60 leading-relaxed">Mejoramos keywords, estructura y compatibilidad para aumentar tu score ATS y pasar filtros.</p>
              </div>
              <div className="card rounded-3xl p-8 shadow-xl">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center text-2xl mb-6">🎯</div>
                <h3 className="text-2xl font-bold mb-4">Más entrevistas</h3>
                <p className="text-black/60 leading-relaxed">Porque el objetivo real no es “tener un CV bonito”, sino llegar al recruiter humano.</p>
              </div>
            </div>
          </div>
        </section>

        {/* SOCIAL PROOF - El mercado cambió */}
        <section className="py-24 bg-black text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full bg-purple-600 blur-3xl"></div>
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
            <div className="rounded-[40px] p-14 bg-gradient-to-br from-purple-600 to-blue-500 text-white text-center shadow-2xl">
              <h2 className="text-5xl font-black mb-6">Tu próximo trabajo no debería perderse en un algoritmo.</h2>
              <p className="text-xl text-white/80 max-w-2xl mx-auto mb-10">Empieza gratis y descubre cómo los ATS están leyendo realmente tu CV.</p>
              <button onClick={() => setShowModal(true)} className="px-10 py-5 bg-white text-black rounded-2xl text-lg font-bold hover:scale-105 transition">
                Probar ruptor gratis
              </button>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="border-t border-black/5 py-10">
          <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center text-white font-bold">⚡</div>
              <span className="font-bold text-lg">ruptor</span>
            </div>
            <p className="text-black/40 text-sm">© 2026 ruptor — Supera el filtro. Llega al humano.</p>
          </div>
        </footer>

        {/* Loading y error */}
        {loading && <LoadingSpinner />}
        {error && (
          <div className="fixed bottom-4 right-4 bg-red-100 border border-red-300 text-red-700 px-4 py-2 rounded-lg shadow-lg">
            ⚠️ {error}
          </div>
        )}
      </div>
    </>
  );
}