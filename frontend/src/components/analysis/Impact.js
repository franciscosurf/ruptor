// src/components/analysis/Impact.jsx
import React, { useState } from 'react';
import { copyText } from '../../utils/copyUtils';

export const Impact = ({ result, activeFocus, onToggleFocus, onSelectSentence }) => {
  const achievementsScore = result?.quantified_achievements_metrics?.score ?? 0;
  const verbsScore = result?.action_verbs_metrics?.score ?? 0;
  const hasAchievements = (result?.quantified_achievements_metrics?.sentences?.length ?? 0) > 0;
  const sentences = result?.quantified_achievements_metrics?.sentences || [];

  const exampleVerbs = ['Lideré', 'Optimicé', 'Diseñé', 'Implementé', 'Desarrollé'];
  const [showVerboseDetails, setShowVerboseDetails] = useState(false);

  const handleSentenceClick = (sentence) => {
    if (onSelectSentence) {
      onSelectSentence(sentence);
    }
  };

  return (
    <div className="space-y-6 border-2-lowpurple">
      {/* TÍTULO PRINCIPAL */}
      <div className="rounded-t-2xl bg-gradient-to-r from-purple-600 to-purple-500 px-6 py-5">
        <div className="flex items-start">
          <div className="mr-3 flex-shrink-0">
            <svg className="text-yellow-500 w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-bold uppercase tracking-wide text-white">
              Impacto: Demuestra tu valor
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-purple-100">
              Convierte tus responsabilidades en logros medibles y utiliza
              verbos de acción que conecten con el reclutador.
            </p>
          </div>
        </div>
      </div>

      <div className="px-5 py-5">
        {/* Tarjeta de gamificación cuando no hay logros y el foco está activo */}
        {activeFocus === 'achievements' && !hasAchievements && (
          <div className="bg-gradient-to-br from-purple-700 via-indigo-800 to-indigo-900 text-white rounded-xl p-5 shadow-xl border border-purple-400/30 relative overflow-hidden animate-fade-in">
            <div className="absolute -top-10 -right-10 w-24 h-24 bg-purple-500/30 rounded-full blur-xl animate-pulse" />
            <div className="flex items-start gap-3">
              <span className="text-3xl animate-bounce">🚀</span>
              <div>
                <h4 className="font-extrabold text-white bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-100 text-base tracking-wide">
                  ¡Misión: Desbloquear Impacto!
                </h4>
                <p className="text-sm text-indigo-100/90 mt-1">
                  No tienes logros cuantificados. <span className="text-amber-300 font-bold">Los reclutadores no te ven.</span>
                </p>
                <div className="bg-white/10 rounded-lg p-3 mt-3 border border-white/20 text-xs text-amber-200 font-mono">
                  🎯 RETO: Edita tu experiencia actual e inyecta al menos un dato numérico (%, €, usuarios, etc.).
                </div>
                <p className="text-xs text-indigo-200/70 mt-2 italic">
                  Al guardar el cambio, tu ATS Score subirá al instante.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* MÓDULO: LOGROS CUANTIFICABLES */}
        <div className="bg-tab rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="bg-tab px-5 py-3 border-b border-blue-100 flex justify-between items-center">
            <h3 className="text-lg font-bold text-amber-900 flex items-center gap-2">
              <span className="hidden">📊</span> Logros Cuantificables
            </h3>
            <span className="bg-white text-amber-800 font-bold px-2.5 py-0.5 rounded-full text-xs border border-amber-200 shadow-sm">
              {achievementsScore}% detectado
            </span>
          </div>
          <div className="p-5">
            {hasAchievements ? (
              <div className="space-y-3">
                <p className="text-sm text-gray-700 font-medium">✅ Logros detectados (click para resaltar):</p>
                <div className="space-y-2">
                  {sentences.map((sentence, idx) => (
                    <div
                      key={idx}
                      onClick={() => onToggleFocus('achievements')}
                      className={`p-3 rounded-lg border-l-4 text-sm italic cursor-pointer transition-colors ${
                        activeFocus === 'achievements'
                          ? 'focus-highlight bg-purple-100 border-purple-500 text-purple-900 font-semibold'
                          : 'bg-green-50 border-green-500 text-gray-700 hover:bg-green-100'
                      }`}
                    >
                      “{sentence}”
                    </div>
                  ))}
                </div>
                {/* Botón de enfoque (solo si hay logros) */}
                <button
                  onClick={() => onToggleFocus('achievements')}
                  className={`w-full mt-3 px-4 py-2 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
                    activeFocus === 'achievements'
                      ? 'bg-purple-700 text-white hover:bg-purple-800'
                      : 'bg-yellow-600 text-white hover:bg-amber-700'
                  }`}
                >
                  {activeFocus === 'achievements'
                    ? '👁️ Quitar Filtro de Logros'
                    : '🎯 Enfocarse en Logros'}
                </button>
              </div>
            ) : (
              <div className="flex items-start gap-3 rounded-xl border border-violet-200 bg-red-100 p-4">
                <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-red-600 font-medium">No se han detectado logros cuantificados en tu CV.</p>
                </div>
              </div>
            )}

            {/* Bloque "¿POR QUÉ ES IMPORTANTE?" */}
            <div className="mt-5 rounded-lg p-4 border border-indigo-100 bg-tag">
              <h4 className="text-sm font-bold text-indigo-900 uppercase tracking-wide flex items-center gap-2">
                ¿POR QUÉ ES IMPORTANTE?
              </h4>
              <p className="text-sm text-gray-700 mt-1">
                Los CVs con logros reciben <strong className="text-indigo-700">3.5x más entrevistas</strong>.
              </p>
              <h4 className="text-sm font-bold text-indigo-900 uppercase tracking-wide flex items-center gap-2 mt-2">
                EJEMPLOS:
              </h4>
              <div className="grid grid-cols-3 gap-3 mt-4">
                <div
                  onClick={() => copyText('45% Reducción tiempo de respuesta')}
                  title="Haz clic para copiar este ejemplo"
                  className="cursor-pointer hover:bg-purple-100 bg-white rounded-lg p-2 text-center shadow-sm border border-gray-200 transition-colors"
                >
                  <div className="text-xl font-black text-purple-600">45%</div>
                  <div className="text-[10px] text-gray-500">Reducción tiempo de respuesta</div>
                </div>
                <div
                  onClick={() => copyText('12K+ Usuarios activos gestionados')}
                  title="Haz clic para copiar este ejemplo"
                  className="cursor-pointer hover:bg-purple-100 bg-white rounded-lg p-2 text-center shadow-sm border border-gray-200 transition-colors"
                >
                  <div className="text-xl font-black text-purple-600">12K+</div>
                  <div className="text-[10px] text-gray-500">Usuarios activos gestionados</div>
                </div>
                <div
                  onClick={() => copyText('30% Mejora en rendimiento')}
                  title="Haz clic para copiar este ejemplo"
                  className="cursor-pointer hover:bg-purple-100 bg-white rounded-lg p-2 text-center shadow-sm border border-gray-200 transition-colors"
                >
                  <div className="text-xl font-black text-purple-600">30%</div>
                  <div className="text-[10px] text-gray-500">Mejora en rendimiento</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* MÓDULO: VERBOS DE ACCIÓN */}
        <div className="bg-tab mt-5 rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="bg-tab px-5 py-3 border-b border-blue-100 flex justify-between items-center">
            <h3 className="text-lg font-bold text-amber-900 flex items-center gap-2">
              <span className="hidden">⚡</span> Verbos de Acción
            </h3>
            <span className="bg-white text-amber-900 font-bold px-2.5 py-0.5 rounded-full text-xs border border-blue-200 shadow-sm">
              {verbsScore}% usado
            </span>
          </div>
          <div className="p-5">
            <div className="flex items-baseline justify-between">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">USO RECOMENDADO</span>
              <span className="text-xs text-gray-400">vs. lenguaje pasivo</span>
            </div>
            <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.min(verbsScore, 100)}%` }} />
            </div>
            <p className="text-sm text-gray-700 mt-3">
              {verbsScore < 50
                ? 'Los verbos de acción aumentan el impacto.'
                : 'Buen uso de verbos de acción. Sigue mejorando.'}
            </p>

            <div className="mt-4 grid grid-cols-2 sm:grid-cols-5 gap-2 bg-gray-50 p-3 rounded-lg border border-gray-200">
              {exampleVerbs.map(verb => (
                <div
                  key={verb}
                  onClick={() => copyText(verb)}
                  title={`Copiar "${verb}"`}
                  className="text-center text-sm font-mono text-gray-700 bg-white rounded-md py-1 px-2 shadow-sm border cursor-pointer hover:bg-purple-50 hover:border-purple-300 transition-colors"
                >
                  {verb}
                </div>
              ))}
            </div>

            {/* Botón Ver más */}
            {(result?.action_verbs_metrics?.detected?.length > 0 || result?.action_verbs_metrics?.tips?.length > 0) && (
              <button
                onClick={() => setShowVerboseDetails(!showVerboseDetails)}
                className="mt-3 text-xs font-medium text-purple-700 bg-purple-50 border border-purple-200 rounded-full px-3 py-1.5 hover:bg-purple-100 hover:border-purple-300 transition-all flex items-center justify-center gap-1.5 mx-auto w-fit"
              >
                {showVerboseDetails ? (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                    </svg>
                    <span>Ver menos</span>
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                    <span>Ver más</span>
                  </>
                )}
              </button>
            )}

            {/* Contenido extra */}
            {showVerboseDetails && (
              <>
                {result?.action_verbs_metrics?.detected?.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-gray-100">
                    <span className="text-xs font-semibold text-green-700 uppercase tracking-wide">
                      🔍 Verbos detectados en tu CV:
                    </span>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {result.action_verbs_metrics.detected.map((verb, idx) => (
                        <span key={idx} className="bg-green-50 text-green-700 text-xs px-2 py-1 rounded-md border border-green-200">
                          {verb}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {result?.action_verbs_metrics?.tips?.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-gray-100">
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      📌 Recomendaciones ATS:
                    </h4>
                    <ul className="list-disc pl-4 mt-2 space-y-1 text-xs text-gray-600">
                      {result.action_verbs_metrics.tips.map((tip, idx) => (
                        <li key={idx}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};