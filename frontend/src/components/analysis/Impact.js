// src/components/analysis/Impact.jsx
import React from 'react';

export const Impact = ({ result, activeFocus, onToggleFocus, onSelectSentence }) => {
  const achievementsScore = result?.quantified_achievements_metrics?.score ?? 0;
  const verbsScore = result?.action_verbs_metrics?.score ?? 0;
  const hasAchievements = (result?.quantified_achievements_metrics?.sentences?.length ?? 0) > 0;
  const sentences = result?.quantified_achievements_metrics?.sentences || [];

  const exampleVerbs = ['Lideré', 'Optimicé', 'Diseñé', 'Implementé', 'Desarrollé'];

  const handleSentenceClick = (sentence) => {
    if (onSelectSentence) {
      onSelectSentence(sentence);
    }
    console.log(sentences);
  };

  return (
    <div className="space-y-6">
      {/* TÍTULO PRINCIPAL - SIEMPRE VISIBLE */}
      <div className="border-b border-gray-200 pb-2">
        <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">
          IMPACTO: <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-600">DEMUESTRA TU VALOR</span>
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Convierte tus responsabilidades en logros medibles y utiliza verbos de acción que conecten con el reclutador.
        </p>
      </div>

      {/* BOTÓN DE ENFOQUE - SIEMPRE VISIBLE (usa sentences) */}
      <button
        onClick={() => onToggleFocus('achievements')}
        className={`bg-purple-500 w-full px-4 py-2 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
          activeFocus === 'achievements'
            ? 'bg-purple-700 text-white hover:bg-purple-800'
            : !hasAchievements
            ? 'bg-red-600 text-white hover:bg-red-700 animate-pulse'
            : 'bg-amber-600 text-white hover:bg-amber-700'
        }`}
      >
        {!hasAchievements && activeFocus !== 'achievements'
          ? '⚠️ 0 Logros Detectados. Ver por qué.'
          : activeFocus === 'achievements'
          ? '👁️ Quitar Filtro de Logros'
          : '🎯 Enfocarse en Logros'}
      </button>

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
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="bg-blue-50 px-5 py-3 border-b border-blue-100 flex justify-between items-center">
          <h3 className="text-sm font-bold text-amber-900 flex items-center gap-2">
            <span>📊</span> Logros Cuantificables
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
                    // CAMBIO: Condicionamos las clases para que use .focus-highlight si el modo está activo
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
            </div>
          ) : (
            <div className="text-center py-2">
              <p className="text-sm text-red-600 font-medium">No se han detectado logros cuantificados en tu CV.</p>
            </div>
          )}

          {/* Bloque "¿POR QUÉ ES IMPORTANTE?" */}
          <div className="mt-5 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg p-4 border border-indigo-100">
            <h4 className="text-sm font-bold text-indigo-900 uppercase tracking-wide flex items-center gap-2">
              ¿POR QUÉ ES IMPORTANTE?
            </h4>
            <p className="text-sm text-gray-700 mt-1">
              Los CVs con logros reciben <strong className="text-indigo-700">3.5x más entrevistas</strong>.
            </p>
            <p className="text-sm text-gray-700 mt-1">
              Ejemplos:
            </p>
            <div className="grid grid-cols-3 gap-3 mt-4">
              <div className="bg-white rounded-lg p-2 text-center shadow-sm border border-gray-200">
                <div className="text-xl font-black text-purple-600">45%</div>
                <div className="text-[10px] text-gray-500">Reducción tiempo de respuesta</div>
              </div>
              <div className="bg-white rounded-lg p-2 text-center shadow-sm border border-gray-200">
                <div className="text-xl font-black text-purple-600">12K+</div>
                <div className="text-[10px] text-gray-500">Usuarios activos gestionados</div>
              </div>
              <div className="bg-white rounded-lg p-2 text-center shadow-sm border border-gray-200">
                <div className="text-xl font-black text-purple-600">30%</div>
                <div className="text-[10px] text-gray-500">Mejora en rendimiento</div>
              </div>
            </div>
          </div>

          {/* Tips de mejora */}
          {result?.quantified_achievements_metrics?.tips?.length > 0 && (
            <div className="mt-4 pt-3 border-t border-gray-100">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">💡 Consejos para añadir logros:</h4>
              <ul className="list-disc pl-4 mt-2 space-y-1 text-xs text-gray-600">
                {result.quantified_achievements_metrics.tips.map((tip, idx) => (
                  <li key={idx}>{tip}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* MÓDULO: VERBOS DE ACCIÓN */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="bg-blue-50 px-5 py-3 border-b border-blue-100 flex justify-between items-center">
          <h3 className="text-sm font-bold text-blue-900 flex items-center gap-2">
            <span>⚡</span> Verbos de Acción
          </h3>
          <span className="bg-white text-blue-800 font-bold px-2.5 py-0.5 rounded-full text-xs border border-blue-200 shadow-sm">
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
              ? 'Tu CV utiliza un lenguaje pasivo. Los verbos de acción aumentan el impacto.'
              : 'Buen uso de verbos de acción. Sigue mejorando.'}
          </p>

          <div className="mt-4 grid grid-cols-2 sm:grid-cols-5 gap-2 bg-gray-50 p-3 rounded-lg border border-gray-200">
            {exampleVerbs.map(verb => (
              <div key={verb} className="text-center text-sm font-mono text-gray-700 bg-white rounded-md py-1 px-2 shadow-sm border">
                {verb}
              </div>
            ))}
          </div>

          {result?.action_verbs_metrics?.detected?.length > 0 && (
            <div className="mt-4 pt-3 border-t border-gray-100">
              <span className="text-xs font-semibold text-green-700 uppercase tracking-wide">🔍 Verbos detectados en tu CV:</span>
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
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">📌 Recomendaciones ATS:</h4>
              <ul className="list-disc pl-4 mt-2 space-y-1 text-xs text-gray-600">
                {result.action_verbs_metrics.tips.map((tip, idx) => (
                  <li key={idx}>{tip}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};