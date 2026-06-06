// src/components/home/HeroDark.jsx
import React from 'react';
import { Link } from 'react-router-dom';

export const HeroDark = () => {
  return (
    <section className="[ main-ia ] relative min-h-screen overflow-hidden flex items-center justify-center">
      {/* Estilos globales (igual que antes) */}
      <style>{`

        .main-ia {
          /*background: rgb(5, 8, 22);*/
          position: relative;
          max-width: 130vh;
          margin: 0 auto;
        }

        .grid-bg {
          position: fixed;
          inset: 0;
          background: 
            linear-gradient(rgba(255,255,255,.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,.04) 1px, transparent 1px);
          background-size: 60px 60px;
        }
        .orb {
          position: absolute;
          width: 900px;
          height: 900px;
          border-radius: 999px;
          background: radial-gradient(circle, rgba(139,92,246,.35), rgba(59,130,246,.15), transparent 70%);
          filter: blur(80px);
          animation: float 10s ease-in-out infinite;
        }
        .scanner {
          position: absolute;
          width: 2px;
          height: 700px;
          background: linear-gradient(transparent, rgba(255,255,255,.8), transparent);
          filter: blur(1px);
          animation: scan 4s ease-in-out infinite;
        }
        .network {
          position: absolute;
          width: 650px;
          height: 650px;
          border-radius: 999px;
        }
        .node {
          position: absolute;
          width: 8px;
          height: 8px;
          border-radius: 999px;
          background: #fff;
          opacity: .8;
        }
        .glass {
          background: rgba(255,255,255,.04);
          backdrop-filter: blur(30px);
          border: 1px solid rgba(255,255,255,.08);
        }
        .gradient {
          background: linear-gradient(90deg, #8b5cf6, #3b82f6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .skill {
          position: absolute;
          padding: 12px 18px;
          border-radius: 999px;
          background: rgba(255,255,255,.04);
          border: 1px solid rgba(255,255,255,.08);
          color: white;
          backdrop-filter: blur(20px);
          animation: float 6s ease-in-out infinite;
        }
        .noise {
          position: absolute;
          inset: 0;
          opacity: .03;
          background-image: url("https://grainy-gradients.vercel.app/noise.svg");
        }
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-30px); }
          100% { transform: translateY(0px); }
        }
        @keyframes scan {
          0% { transform: translateY(-120px); }
          50% { transform: translateY(120px); }
          100% { transform: translateY(-120px); }
        }
      `}</style>

      {/* Capas decorativas */}
      <div className="grid-bg" />
      <div className="noise" />
      <div className="orb" />
      <div className="scanner" />

      {/* Red de nodos */}
      <div className="network">
        <div className="node top-0 left-1/2" style={{ transform: 'translate(-50%, 0)' }} />
        <div className="node" style={{ top: '80px', left: '80px' }} />
        <div className="node" style={{ top: '80px', right: '80px' }} />
        <div className="node" style={{ bottom: '80px', left: '80px' }} />
        <div className="node" style={{ bottom: '80px', right: '80px' }} />
        <div className="node bottom-0 left-1/2" style={{ transform: 'translate(-50%, 0)' }} />
        <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 650 650">
          <line x1="325" y1="0" x2="100" y2="120" stroke="white" strokeWidth="1.5" />
          <line x1="325" y1="0" x2="550" y2="120" stroke="white" strokeWidth="1.5" />
          <line x1="100" y1="120" x2="100" y2="520" stroke="white" strokeWidth="1.5" />
          <line x1="550" y1="120" x2="550" y2="520" stroke="white" strokeWidth="1.5" />
          <line x1="100" y1="520" x2="325" y2="650" stroke="white" strokeWidth="1.5" />
          <line x1="550" y1="520" x2="325" y2="650" stroke="white" strokeWidth="1.5" />
        </svg>
      </div>

      {/* Skills flotantes con posiciones inline */}
      <div className="skill" style={{ top: '22%', left: '12%', animationDelay: '0s' }}>+ Python</div>
      <div className="skill" style={{ top: '28%', right: '15%', animationDelay: '1s' }}>+ Leadership</div>
      <div className="skill" style={{ bottom: '25%', left: '18%', animationDelay: '2s' }}>+ Product Strategy</div>
      <div className="skill" style={{ bottom: '30%', right: '18%', animationDelay: '0.5s' }}>+ SQL</div>
      <div className="skill" style={{ top: '50%', right: '10%', animationDelay: '1.5s' }}>+ AI</div>

      {/* Tarjeta ATS Score (posiciones inline) */}
      <div className="absolute glass rounded-3xl p-6 shadow-2xl" style={{ right: '16%', top: '35%', animationDelay: '1.5s' }}>
        <div className="text-white/50 text-xs uppercase tracking-widest">ATS SCORE</div>
        <div className="text-6xl font-black gradient">92</div>
        <div className="text-green-400 mt-2 text-sm">Recruiter Ready</div>
      </div>

      {/* Contenido principal centrado */}
      <div className="relative z-20 max-w-5xl text-center px-8">
        <div className="inline-flex gap-2 items-center glass rounded-full px-5 py-2 mb-10">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <span className="text-white/70 text-sm">ATS Optimization Platform</span>
        </div>
        <h1 className="text-white font-black leading-none text-7xl md:text-9xl">
          Supera el filtro.
          <span className="block gradient">Llega al humano.</span>
        </h1>
        <p className="mt-10 text-white/60 text-xl max-w-3xl mx-auto leading-relaxed">
          Tu CV compite contra algoritmos antes que contra personas.
          Ruptor analiza, optimiza y adapta tu candidatura para superar ATS modernos y conseguir más entrevistas.
        </p>
        <div className="mt-12 flex justify-center gap-4 flex-wrap">
          <Link to="/scanner" className="px-8 py-5 rounded-2xl bg-white text-black font-bold hover:scale-105 transition shadow-xl">
            Analizar mi CV
          </Link>
          <button className="px-8 py-5 rounded-2xl border border-white/10 text-white hover:bg-white/5 transition">
            Ver demo
          </button>
        </div>
      </div>
    </section>
  );
};