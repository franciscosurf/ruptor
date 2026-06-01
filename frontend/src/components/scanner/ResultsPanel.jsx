// src/components/scanner/ResultsPanel.jsx
import React, { useState, useEffect } from 'react';
import { ScoreCircle } from '../common/ScoreCircle';
import { TagList } from '../common/TagList';
import { DetailedScores } from '../analysis/DetailedScores';
import { Recommendations } from '../analysis/Recommendations';
import { MissingTermsWithContext } from '../analysis/MissingTermsWithContext';
import { JobSkillsList } from '../analysis/JobSkillsList';
import { Impact } from '../analysis/Impact';


const ITEMS_PER_PAGE_REC = 2;      // Mejoras: 2 por página
const ITEMS_PER_PAGE_MISSING = 5;  // Sugerencias: 5 por página

const PaginationControls = ({ currentPage, totalPages, onPrev, onNext, startIdx, endIdx, totalItems }) => {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between mb-6 pt-4 border-t border-gray-100">
      <button
        onClick={onPrev}
        disabled={currentPage === 0}
        className={`px-3 py-3 rounded-md text-sm font-medium flex items-center gap-1 ${
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
        className={`px-3 py-3 rounded-md text-sm font-medium flex items-center gap-1 ${
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

export const ResultsPanel = ({ result, activeFocus, onToggleFocus, onSelectSentence  }) => {
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

  // En ResultsPanel, calcula totalPotentialPoints con las nuevas claves
    const totalPotentialPoints  = 
    (result.missing_terms_with_context?.reduce((s,i)=>s+(i.potential_points||0),0)||0) +
    (result.missing_tech_skills_with_points?.reduce((s,i)=>s+(i.potential_points||0),0)||0) +
    (result.action_verbs_metrics?.potential_points||0) +
    (result.quantified_achievements_metrics?.potential_points||0);
  console.log('Total puntos potenciales:', totalPotentialPoints);
  console.log('Remaining points (100 - ats_score):', 100 - result.ats_score);

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
            <TagList items={result?.extracted_skills_cv || []} 
              color="#10b981" emptyText="Sin skills" disableCopy={true} />
          </div>
          <div>
            <div className="text-sm font-medium text-gray-500 mb-2">
              🎯 La oferta requiere ({jobSkills.length})
            </div>
            <JobSkillsList
              cvSkills={result?.extracted_skills_cv || []}
              jobSkills={jobSkills}
              missingSkillsDetails={result?.missing_tech_skills_with_points || []}
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
      component: () => <Impact result={result} activeFocus={activeFocus} onToggleFocus={onToggleFocus} onSelectSentence={onSelectSentence} />
    }
  ];

  // Salvaguarda: Si no hay resultado todavía, no renderizar el panel completo
  if (!result) return null;

  return (
    /* Raíz: ahora con overflow-y-auto para scroll vertical en todo el panel */
    <div className="w-full flex flex-col bg-white overflow-y-auto h-full">
      <div className="p-6 border-b border-gray-100 bg-gray-50 shrink-0">
        {/* Bloque del Score */}
        <ScoreCircle score={result.ats_score} level={result.level} />

        {/* (i) Warning info  */}
        <div className="flex items-start gap-3 rounded-xl border border-violet-200 bg-purple-100 p-4">
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-purple-100 text-purple-600">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div>
            <p className="mt-1 text-sm text-slate-600">
              {result.summary}
            </p>
          </div>
        </div>

        {result.detailed_scores && (
          <div className="mt-1 border-t border-gray-100">
            <DetailedScores scores={result.detailed_scores} />
          </div>
        )}
      </div>

      {totalPotentialPoints > 0 && (
        <div className="bg-yellow-200 p-5 text-center w-full font-sans">
          <h2 className="text-lg font-black text-gray-900 tracking-wide uppercase mb-1">
            Puntos y Misiones de CV
          </h2>
          
          <div className="w-full max-w-md mx-auto bg-gray-100 bg-opacity-75 rounded-full py-1.5 px-4 text-sm text-gray-800">
            {/* <span className="font-bold text-black">0</span> / */} 
            <span className="font-bold text-black">{totalPotentialPoints}</span> puntos por ganar
          </div>
        </div>
        
      )}

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
      <div className="p-6 bg-white flex-1 flex flex-col">
        {tabs.find(t => t.id === activeTab)?.component()}
      </div>
    </div>
  );
};