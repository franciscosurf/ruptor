import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAnalysis } from '../hooks/useAnalysis';
import { useOptimizer } from '../hooks/useOptimizer';
import { ScoreCircle } from '../components/common/ScoreCircle';
import { TagList } from '../components/common/TagList';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { DetailedScores } from '../components/analysis/DetailedScores';
import { Recommendations } from '../components/analysis/Recommendations';
import { MissingTermsWithContext } from '../components/analysis/MissingTermsWithContext';
import { JobSkillsList } from '../components/analysis/JobSkillsList';
import { OptimizerModal } from '../components/optimizer/OptimizerModal';
import { JobForm } from '../components/forms/JobForm';
import { Header } from '../components/layout/Header';

export default function Scanner() {
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
    <div className="overflow-x-hidden">
      {/* Estilos (Tailwind + personalizados) */}
      <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet" />
      <style>{`
        body { font-family: 'Inter', sans-serif; background: #ffffff; color: #0b1020; }
        .gradient-text { background: linear-gradient(90deg,#7c3aed,#2563eb); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .grid-bg { background-image: linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px); background-size: 40px 40px; }
        .card { background: rgba(255,255,255,0.82); backdrop-filter: blur(10px); border: 1px solid rgba(0,0,0,0.06); }
        .glass { background: rgba(255,255,255,0.72); backdrop-filter: blur(14px); border: 1px solid rgba(0,0,0,0.06); }
        .hero-glow { position: absolute; width: 700px; height: 700px; border-radius: 999px; background: radial-gradient(circle, rgba(99,102,241,0.18), transparent 70%); top: -300px; right: -250px; }
        .scanner-line { position: absolute; top: 0; left: 0; width: 100%; height: 4px; background: linear-gradient(90deg, #7c3aed, #2563eb); box-shadow: 0 0 20px rgba(37,99,235,0.7); animation: scan 3s linear infinite; }
        @keyframes scan { 0% { transform: translateY(0); } 50% { transform: translateY(280px); } 100% { transform: translateY(0); } }
        .score-ring { width: 180px; height: 180px; border-radius: 999px; background: conic-gradient(#2563eb 0deg, #7c3aed 290deg, rgba(0,0,0,0.06) 290deg); display: flex; align-items: center; justify-content: center; }
        .score-inner { width: 140px; height: 140px; border-radius: 999px; background: white; display: flex; align-items: center; justify-content: center; flex-direction: column; }
      `}</style>

      {/* HEADER */}
        <Header />

      {/* HERO (con botón que abre el modal) */}
      <section className="relative overflow-hidden grid-bg">
        <div className="hero-glow"></div>
        <div className="max-w-7xl mx-auto px-6 py-28 relative z-10">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-black/5 border border-black/5 rounded-full px-4 py-2 mb-8">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                <span className="text-sm font-medium">ATS Scanner impulsado por IA</span>
              </div>
              <h1 className="text-6xl md:text-7xl font-black tracking-tight leading-none mb-8">
                Descubre cómo
                <span className="gradient-text"> te filtra</span>
                la IA.
              </h1>
              <p className="text-xl md:text-2xl text-black/60 leading-relaxed mb-10 max-w-2xl">
                Tu CV probablemente está siendo rechazado antes de que un humano lo vea.
                Analiza tu candidatura con ruptor y descubre exactamente cómo te interpreta un ATS moderno.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button onClick={() => setShowModal(true)} className="px-8 py-5 rounded-2xl bg-black text-white text-lg font-semibold hover:scale-105 transition shadow-2xl">
                  Subir mi CV
                </button>
                <button className="px-8 py-5 rounded-2xl border border-black/10 bg-white text-lg font-semibold hover:bg-black/5 transition">
                  Ver ejemplo
                </button>
              </div>
            </div>
            {/* Previsualización estática del score */}
            <div className="relative">
              <div className="glass rounded-[40px] p-8 shadow-2xl relative overflow-hidden">
                <div className="scanner-line"></div>
                <div className="flex items-center justify-between mb-8">
                  <div><p className="text-sm text-black/40 font-semibold uppercase tracking-wider">ATS SCORE</p><h2 className="text-3xl font-black mt-2">CV Analysis</h2></div>
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center text-white text-xl">⚡</div>
                </div>
                <div className="flex flex-col items-center mb-10">
                  <div className="score-ring mb-6"><div className="score-inner"><span className="text-5xl font-black">82</span><span className="text-black/40 text-sm font-semibold">ATS SCORE</span></div></div>
                  <p className="text-black/60 text-center max-w-sm">Tu CV tiene buena compatibilidad ATS, pero todavía hay mejoras clave para aumentar visibilidad.</p>
                </div>
                <div className="space-y-5">
                  <div className="bg-black/3 rounded-2xl p-5 border border-black/5"><div className="flex items-center justify-between mb-2"><span className="font-semibold">Keywords Match</span><span className="font-bold text-blue-600">91%</span></div><div className="w-full h-2 rounded-full bg-black/5 overflow-hidden"><div className="h-full w-[91%] bg-gradient-to-r from-purple-600 to-blue-500 rounded-full"></div></div></div>
                  <div className="bg-black/3 rounded-2xl p-5 border border-black/5"><div className="flex items-center justify-between mb-2"><span className="font-semibold">ATS Formatting</span><span className="font-bold text-blue-600">76%</span></div><div className="w-full h-2 rounded-full bg-black/5 overflow-hidden"><div className="h-full w-[76%] bg-gradient-to-r from-purple-600 to-blue-500 rounded-full"></div></div></div>
                  <div className="bg-black/3 rounded-2xl p-5 border border-black/5"><div className="flex items-center justify-between mb-2"><span className="font-semibold">Recruiter Visibility</span><span className="font-bold text-blue-600">69%</span></div><div className="w-full h-2 rounded-full bg-black/5 overflow-hidden"><div className="h-full w-[69%] bg-gradient-to-r from-purple-600 to-blue-500 rounded-full"></div></div></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-28">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <span className="gradient-text font-bold uppercase tracking-widest text-sm">Cómo funciona</span>
            <h2 className="text-5xl font-black mt-4 mb-6">Simulamos ATS reales</h2>
            <p className="text-xl text-black/60 max-w-3xl mx-auto">Analizamos tu CV igual que lo haría un sistema automático de selección moderno.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="card rounded-[32px] p-10 shadow-xl">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center text-white text-2xl mb-8">📄</div>
              <h3 className="text-2xl font-black mb-4">1. Subes tu CV</h3>
              <p className="text-black/60 leading-relaxed">PDF o DOCX. Nuestro motor analiza estructura, contenido y compatibilidad ATS.</p>
            </div>
            <div className="card rounded-[32px] p-10 shadow-xl">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center text-white text-2xl mb-8">🤖</div>
              <h3 className="text-2xl font-black mb-4">2. La IA te evalúa</h3>
              <p className="text-black/60 leading-relaxed">Simulamos filtros automáticos usados por recruiters y plataformas de contratación.</p>
            </div>
            <div className="card rounded-[32px] p-10 shadow-xl">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center text-white text-2xl mb-8">⚡</div>
              <h3 className="text-2xl font-black mb-4">3. Optimiza y supera</h3>
              <p className="text-black/60 leading-relaxed">Obtén mejoras concretas para aumentar tu score ATS y llegar al recruiter humano.</p>
            </div>
          </div>
        </div>
      </section>

      {/* PROBLEMS */}
      <section className="py-24 bg-black text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full bg-purple-600 blur-3xl"></div>
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-black mb-6">Lo que está matando tu CV</h2>
            <p className="text-2xl text-white/70 max-w-3xl mx-auto">Los ATS no “piensan”. Filtran por patrones, estructura y keywords.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white/5 border border-white/10 rounded-[32px] p-10">
              <h3 className="text-3xl font-black mb-8 text-red-400">Problemas comunes</h3>
              <div className="space-y-5 text-white/70">
                <div>✕ Diseño incompatible ATS</div>
                <div>✕ Keywords incorrectas</div>
                <div>✕ Baja densidad semántica</div>
                <div>✕ Experiencia mal estructurada</div>
                <div>✕ Skills invisibles para IA</div>
                <div>✕ PDFs difíciles de parsear</div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-purple-600 to-blue-500 rounded-[32px] p-10">
              <h3 className="text-3xl font-black mb-8">Lo que hace ruptor</h3>
              <div className="space-y-5 text-white/90">
                <div>✓ Optimiza formato ATS</div>
                <div>✓ Mejora visibilidad IA</div>
                <div>✓ Reescribe keywords estratégicas</div>
                <div>✓ Simula filtros automáticos</div>
                <div>✓ Mejora recruiter matching</div>
                <div>✓ Maximiza posibilidades reales</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-28">
        <div className="max-w-5xl mx-auto px-6">
          <div className="rounded-[40px] p-14 bg-gradient-to-br from-purple-600 to-blue-500 text-white text-center shadow-2xl">
            <h2 className="text-5xl font-black mb-6">Descubre por qué te rechaza la IA.</h2>
            <p className="text-xl text-white/80 max-w-2xl mx-auto mb-10">Analiza tu CV gratis y entiende cómo te ven realmente los ATS modernos.</p>
            <button onClick={() => setShowModal(true)} className="px-10 py-5 bg-white text-black rounded-2xl text-lg font-bold hover:scale-105 transition">
              Escanear mi CV
            </button>
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

      {/* MODAL DE ANÁLISIS */}
      {showModal && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{ background: 'linear-gradient(90deg, rgba(124,58,237,0.7), rgba(37,99,235,0.7))', backdropFilter: 'blur(2px)' }}
          onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
        >
          <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl" style={{ height: '85vh', display: 'flex', flexDirection: 'column' }}>
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center z-10 rounded-t-3xl flex-shrink-0">
              <h2 className="text-xl font-bold">{result ? 'Resultados del análisis' : 'Analiza tu CV'}</h2>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700 text-2xl leading-none">×</button>
            </div>
            <div className="overflow-y-auto p-6 flex-1">
              {!result ? (
                <JobForm
                  fileName={fileName}
                  jobDescription={jobDescription}
                  analysisMode={analysisMode}
                  onFileChange={handleFileChange}
                  onJobDescriptionChange={setJobDescription}
                  onModeChange={setAnalysisMode}
                  onSubmit={handleSubmit}
                  onExport={handleExportReport}
                  loading={loading}
                  resultExists={!!result}
                />
              ) : (
                <div className="space-y-6">
                  {/* SCORE PRINCIPAL */}
                  <div className="bg-white/80 backdrop-blur border border-black/5 rounded-3xl p-6 shadow-xl">
                    <ScoreCircle score={result.ats_score} level={result.level} />
                    <p className="text-center text-gray-700 text-lg mt-4">{result.summary}</p>
                    {result.profession_detected && (
                      <div className="mt-4 text-center">
                        <span className="text-sm text-gray-500">🎯 Profesión detectada: </span>
                        <span className="font-semibold">{result.profession_detected.profession?.toUpperCase()}</span>
                        <span className="text-sm text-gray-500 ml-2">· confianza {result.confidence_score}%</span>
                      </div>
                    )}
                    <div className="flex justify-center gap-8 mt-6 pt-4 border-t border-gray-200">
                      <div className="text-center"><div className="text-3xl font-bold text-purple-600">{result.detailed_scores?.semantic || 0}%</div><div className="text-xs text-gray-500">Semántico</div></div>
                      <div className="text-center"><div className="text-3xl font-bold text-purple-600">{result.detailed_scores?.keyword_exact || 0}%</div><div className="text-xs text-gray-500">Cobertura</div></div>
                    </div>
                    {result.detailed_scores && <DetailedScores scores={result.detailed_scores} />}
                  </div>                  
                    
                  {/* Experiencia y Educación */}
                  {(result.experience_match || result.education_match) && (
                    <div className="bg-white/80 backdrop-blur border border-black/5 rounded-3xl p-6 shadow-xl">
                      <h3 className="text-sm uppercase tracking-wider text-gray-500 mb-4">Experiencia y Educación</h3>
                      {result.experience_match && (
                        <div className="mb-4">
                          <div className="flex justify-between text-sm mb-1"><span>Años de experiencia</span><span className="font-semibold">{result.experience_match.detected} / {result.experience_match.required} años</span></div>
                          <div className="w-full bg-gray-200 rounded-full h-2"><div className="bg-purple-600 h-2 rounded-full" style={{ width: `${result.experience_match.match}%` }}></div></div>
                        </div>
                      )}
                      {result.education_match && (
                        <div>
                          <div className="flex justify-between text-sm mb-1"><span>Nivel educativo</span><span className="font-semibold">{result.education_match.detected_level} / {result.education_match.required_level}</span></div>
                          <div className="w-full bg-gray-200 rounded-full h-2"><div className="bg-green-500 h-2 rounded-full" style={{ width: `${result.education_match.match}%` }}></div></div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Recomendaciones */}
                  {result.recommendations && result.recommendations.length > 0 && (
                    <Recommendations recommendations={result.recommendations} onScrollToSuggestions={scrollToSuggestions} />
                  )}

                  {/* Cultura */}
                  {result.culture_suggestions?.length > 0 && (
                    <div className="bg-white/80 backdrop-blur border border-black/5 rounded-3xl p-6 shadow-xl">
                      <h3 className="text-sm uppercase tracking-wider text-gray-500 mb-4">🌱 Valores y cultura de la empresa</h3>
                      <ul className="list-disc pl-5 space-y-2">{result.culture_suggestions.map((item, idx) => <li key={idx} className="text-sm">{item.text}</li>)}</ul>
                    </div>
                  )}

                  {/* Optimizar CV */}
                  {result.ats_score < 65 && (
                    <button onClick={handleOptimizeCV} disabled={loadingOptimizer} style={{ width: '100%', padding: '14px 20px', background: loadingOptimizer ? '#9ca3af' : '#f59e0b', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 600, fontSize: 14, cursor: loadingOptimizer ? 'not-allowed' : 'pointer', transition: 'all 0.2s ease' }}>
                      {loadingOptimizer ? 'Generando optimizaciones...' : '✨ Optimizar Mi CV'}
                    </button>
                  )}

                  {/* Habilidades Técnicas */}
                  {(result.extracted_skills_cv?.length > 0 || result.extracted_skills_job?.length > 0) && (
                    <div className="bg-white/80 backdrop-blur border border-black/5 rounded-3xl p-6 shadow-xl">
                      <div className="mb-4"><div className="text-sm font-medium text-gray-500 mb-2">✅ Tu CV detecta</div><TagList items={result.extracted_skills_cv} color="#10b981" emptyText="No se detectaron skills específicas" /></div>
                      <div><div className="text-sm font-medium text-gray-500 mb-2">🎯 La oferta requiere</div><JobSkillsList cvSkills={result.extracted_skills_cv || []} jobSkills={result.extracted_skills_job || []} /></div>
                    </div>
                  )}

                  {/* Skills sugeridas */}
                  {result.profession_skills_suggestions?.length > 0 && (
                    <div className="bg-white/80 backdrop-blur border border-black/5 rounded-3xl p-6 shadow-xl">
                      <h3 className="text-sm uppercase tracking-wider text-gray-500 mb-4">💡 Skills sugeridas para tu perfil</h3>
                      <TagList items={result.profession_skills_suggestions} color="#f59e0b" />
                    </div>
                  )}

                  {/* Sugerencias (faltantes) */}
                  <div id="suggestions-section">
                    <div className="bg-white/80 backdrop-blur border border-black/5 rounded-3xl p-6 shadow-xl">
                      <h3 className="text-sm uppercase tracking-wider text-gray-500 mb-4">❌ SUGERENCIAS</h3>
                      <MissingTermsWithContext items={result.missing_terms_with_context || result.priority_missing_terms?.map(t => ({ term: t })) || []} />
                    </div>
                  </div>

                  {/* Términos que ya tienes */}
                  <div className="bg-white/80 backdrop-blur border border-black/5 rounded-3xl p-6 shadow-xl">
                    <h3 className="text-sm uppercase tracking-wider text-gray-500 mb-4">Términos que ya tienes</h3>
                    <TagList items={result.matched_terms} color="#10b981" emptyText="No se detectaron coincidencias directas." />
                  </div>

                  {/* Análisis completo (expandible) */}
                  <details className="bg-white/80 backdrop-blur border border-black/5 rounded-3xl p-6 shadow-xl">
                    <summary className="cursor-pointer text-purple-600 font-semibold">🔍 Ver análisis completo de palabras clave</summary>
                    <div className="mt-4 space-y-4">
                      <div><div className="text-sm font-medium text-gray-500 mb-2">Palabras clave del CV</div><TagList items={result.cv_terms} color="#6b7280" /></div>
                      <div><div className="text-sm font-medium text-gray-500 mb-2">Palabras clave de la oferta</div><TagList items={result.job_terms} color="#7c3aed" /></div>
                    </div>
                  </details>

                  {/* Nuevo análisis */}
                  <button onClick={handleNewAnalysis} className="w-full py-3 rounded-xl bg-gray-200 text-gray-800 font-semibold hover:bg-gray-300 transition">Nuevo análisis</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Optimizer Modal */}
      <OptimizerModal show={showOptimizer} data={cvOptimizations} onClose={closeOptimizer} />

      {/* Loading y error */}
      {loading && <LoadingSpinner />}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-100 border border-red-300 text-red-700 px-4 py-2 rounded-lg shadow-lg">
          ⚠️ {error}
        </div>
      )}
    </div>
  );
}