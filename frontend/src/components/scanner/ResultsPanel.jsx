// src/components/scanner/ResultsPanel.jsx
import React, { useState, useEffect } from 'react';
import { ScoreCircle } from '../common/ScoreCircle';
import { TagList } from '../common/TagList';
import { DetailedScores } from '../analysis/DetailedScores';
import { Recommendations } from '../analysis/Recommendations';
import { MissingTermsWithContext } from '../analysis/MissingTermsWithContext';
import { JobSkillsList } from '../analysis/JobSkillsList';

const ITEMS_PER_PAGE_REC = 2;      // Mejoras: 2 por página
const ITEMS_PER_PAGE_MISSING = 5;  // Sugerencias: 5 por página

const PaginationControls = ({ currentPage, totalPages, onPrev, onNext, startIdx, endIdx, totalItems }) => {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
      <button
        onClick={onPrev}
        disabled={currentPage === 0}
        className={`px-3 py-1 rounded-md text-sm font-medium flex items-center gap-1 ${
          currentPage === 0
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
        }`}
      >
        ◀ Anterior
      </button>
      <span className="text-sm text-gray-500">
        {startIdx + 1} - {Math.min(endIdx, totalItems)} de {totalItems}
      </span>
      <button
        onClick={onNext}
        disabled={currentPage === totalPages - 1}
        className={`px-3 py-1 rounded-md text-sm font-medium flex items-center gap-1 ${
          currentPage === totalPages - 1
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
        }`}
      >
        Siguiente ▶
      </button>
    </div>
  );
};

export const ResultsPanel = ({ result }) => {
  const [activeTab, setActiveTab] = useState('recommendations');
  const [recommendationsPage, setRecommendationsPage] = useState(0);
  const [suggestionsPage, setSuggestionsPage] = useState(0);

  // Reiniciar páginas al cambiar de pestaña
  useEffect(() => {
    if (activeTab === 'recommendations') setRecommendationsPage(0);
    if (activeTab === 'suggestions') setSuggestionsPage(0);
  }, [activeTab]);

  const recommendations = result?.recommendations || [];
  const totalRecPages = Math.ceil(recommendations.length / ITEMS_PER_PAGE_REC);
  const paginatedRecommendations = recommendations.slice(
    recommendationsPage * ITEMS_PER_PAGE_REC,
    (recommendationsPage + 1) * ITEMS_PER_PAGE_REC
  );

  const missingTerms = result?.missing_terms_with_context || [];
  const totalMissingPages = Math.ceil(missingTerms.length / ITEMS_PER_PAGE_MISSING);
  const paginatedMissingTerms = missingTerms.slice(
    suggestionsPage * ITEMS_PER_PAGE_MISSING,
    (suggestionsPage + 1) * ITEMS_PER_PAGE_MISSING
  );

  const jobSkills = result?.extracted_skills_job || [];

  const tabs = [
    {
      id: 'recommendations',
      label: '⚡ Mejoras',
      component: () => (
        <>
          <Recommendations recommendations={paginatedRecommendations} />
          <PaginationControls
            currentPage={recommendationsPage}
            totalPages={totalRecPages}
            onPrev={() => setRecommendationsPage(p => p - 1)}
            onNext={() => setRecommendationsPage(p => p + 1)}
            startIdx={recommendationsPage * ITEMS_PER_PAGE_REC}
            endIdx={(recommendationsPage + 1) * ITEMS_PER_PAGE_REC}
            totalItems={recommendations.length}
          />
        </>
      ),
    },
    {
      id: 'skills',
      label: '🛠️ Skills',
      component: () => (
        <>
          <div className="mb-4">
            <div className="text-sm font-medium text-gray-500 mb-2">
              ✅ Tu CV detecta ({result?.extracted_skills_cv?.length || 0})
            </div>
            <TagList items={result?.extracted_skills_cv || []} color="#10b981" emptyText="Sin skills" />
          </div>
          <div>
            <div className="text-sm font-medium text-gray-500 mb-2">
              🎯 La oferta requiere ({jobSkills.length})
            </div>
            <JobSkillsList
              cvSkills={result?.extracted_skills_cv || []}
              jobSkills={jobSkills}
            />
          </div>
        </>
      ),
    },
    {
      id: 'suggestions',
      label: '❌ Sugerencias',
      component: () => (
        <>
          <MissingTermsWithContext items={paginatedMissingTerms} />
          <PaginationControls
            currentPage={suggestionsPage}
            totalPages={totalMissingPages}
            onPrev={() => setSuggestionsPage(p => p - 1)}
            onNext={() => setSuggestionsPage(p => p + 1)}
            startIdx={suggestionsPage * ITEMS_PER_PAGE_MISSING}
            endIdx={(suggestionsPage + 1) * ITEMS_PER_PAGE_MISSING}
            totalItems={missingTerms.length}
          />
        </>
      ),
    },
    // NUEVA PESTAÑA: IMPACTO Y VERBOS DE ACCIÓN
    {
      id: 'impact',
      label: '🚀 Impacto',
      component: () => (
        <div className="space-y-6">
          {/* MÓDULO VERBOS DE ACCIÓN */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <div className="bg-blue-50 px-4 py-3 border-b border-blue-100 flex justify-between items-center">
              <h3 className="text-sm font-bold flex items-center gap-2 text-blue-900">
                <span>⚡</span> Verbos de Acción
              </h3>
              <span className="bg-white text-blue-800 font-bold px-2 py-0.5 rounded text-xs border border-blue-200">
                {result?.action_verbs_metrics?.score ?? 0}%
              </span>
            </div>
            
            <div className="p-4">
              {/* Recomendaciones dinámicas enviadas por el Backend */}
              <div>
                <h4 className="font-semibold text-gray-700 text-xs uppercase tracking-wide">Consejos del ATS:</h4>
                <ul className="list-disc pl-4 mt-2 space-y-1 text-sm text-gray-600">
                  {result?.action_verbs_metrics?.tips?.map((tip, idx) => (
                    <li key={idx}>{tip}</li>
                  ))}
                </ul>
              </div>

              {/* Verbos detectados */}
              {result?.action_verbs_metrics?.detected?.length > 0 && (
                <div className="mt-4 pt-3 border-t border-gray-100">
                  <span className="text-xs font-semibold text-green-700 uppercase tracking-wide">Verbos legítimos detectados:</span>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {result.action_verbs_metrics.detected.map((verb, idx) => (
                      <span key={idx} className="bg-green-50 text-green-700 text-[11px] px-2 py-1 rounded font-medium border border-green-200">
                        {verb}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* MÓDULO LOGROS CUANTIFICABLES */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <div className="bg-amber-50 px-4 py-3 border-b border-amber-100 flex justify-between items-center">
              <h3 className="text-sm font-bold flex items-center gap-2 text-amber-900">
                <span>📊</span> Logros Cuantificables
              </h3>
              <span className="bg-white text-amber-800 font-bold px-2 py-0.5 rounded text-xs border border-amber-200">
                {result?.quantified_achievements_metrics?.score ?? 0}%
              </span>
            </div>

            <div className="p-4">
              {/* Recomendaciones de impacto */}
              <div>
                <h4 className="font-semibold text-gray-700 text-xs uppercase tracking-wide">Estrategia de Impacto:</h4>
                <div className="mt-2 space-y-1.5">
                  {result?.quantified_achievements_metrics?.tips?.map((tip, idx) => (
                    <p key={idx} className="text-xs text-amber-900 bg-amber-50/50 p-2 rounded-r border-l-2 border-amber-500">
                      {tip}
                    </p>
                  ))}
                </div>
              </div>

              {/* Oraciones exactas validadas */}
              {result?.quantified_achievements_metrics?.sentences?.length > 0 && (
                <div className="mt-4 pt-3 border-t border-gray-100">
                  <h4 className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-2">Métricas duras identificadas:</h4>
                  <div className="space-y-1.5">
                    {result.quantified_achievements_metrics.sentences.map((sentence, idx) => (
                      <p key={idx} className="text-[11px] leading-relaxed bg-gray-50 p-2 rounded border border-gray-200 italic text-gray-700">
                        "{sentence}"
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )
    }
  ];

  // Salvaguarda: Si no hay resultado todavía, no renderizar el panel completo
  if (!result) return null;

  return (
    /* Raíz: ahora con overflow-y-auto para scroll vertical en todo el panel */
    <div className="w-full flex flex-col bg-white overflow-y-auto h-full">
      {/* Bloque del Score */}
      <div className="p-6 border-b border-gray-100 bg-gray-50 shrink-0">
        <ScoreCircle score={result.ats_score} level={result.level} />
        <p className="mt-4 text-center text-sm font-medium text-gray-600">{result.summary}</p>
        {result.detailed_scores && (
          <div className="mt-5 pt-5 border-t border-gray-100">
            <DetailedScores scores={result.detailed_scores} />
          </div>
        )}
      </div>

      {/* Selector de Pestañas */}
      <div className="flex border-b border-gray-200 bg-white px-2 shrink-0">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-3 px-1 text-[10px] sm:text-xs font-bold uppercase tracking-wide transition-all border-b-2 text-center ${
              activeTab === tab.id
                ? 'border-purple-600 text-purple-700 bg-purple-50/50 rounded-t-lg'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Contenido de la pestaña activa (sin overflow propio, fluye con el scroll del padre) */}
      <div className="p-6 bg-white flex-1">
        {tabs.find(t => t.id === activeTab)?.component()}
      </div>
    </div>
  );
};