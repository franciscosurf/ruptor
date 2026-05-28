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

// Componente de controles de paginación (reutilizable)
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

  // Datos paginados para Mejoras
  const recommendations = result?.recommendations || [];
  const totalRecPages = Math.ceil(recommendations.length / ITEMS_PER_PAGE_REC);
  const paginatedRecommendations = recommendations.slice(
    recommendationsPage * ITEMS_PER_PAGE_REC,
    (recommendationsPage + 1) * ITEMS_PER_PAGE_REC
  );

  // Datos paginados para Sugerencias
  const missingTerms = result?.missing_terms_with_context || [];
  const totalMissingPages = Math.ceil(missingTerms.length / ITEMS_PER_PAGE_MISSING);
  const paginatedMissingTerms = missingTerms.slice(
    suggestionsPage * ITEMS_PER_PAGE_MISSING,
    (suggestionsPage + 1) * ITEMS_PER_PAGE_MISSING
  );

  // Skills: sin paginación, se muestran todos
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
              jobSkills={jobSkills}  // Todos, sin paginar
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
  ];

  return (
    <div className="w-12/12 flex flex-col bg-white min-h-0">
      {/* Bloque del Score */}
      <div className="p-6 border-b border-gray-100 bg-gray-50 flex-shrink-0">
        <ScoreCircle score={result.ats_score} level={result.level} />
        <p className="mt-4 text-center text-sm font-medium text-gray-600">{result.summary}</p>
        {result.detailed_scores && (
          <div className="mt-2 border-t border-gray-100">
            <DetailedScores scores={result.detailed_scores} />
          </div>
        )}
      </div>

      {/* Selector de Pestañas */}
      <div className="flex border-b border-gray-200 bg-white px-2 flex-shrink-0">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-3 px-2 text-xs font-bold uppercase tracking-wide transition-all border-b-2 text-center ${
              activeTab === tab.id
                ? 'border-purple-600 text-purple-700 bg-purple-50/50 rounded-t-lg'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Contenido de la pestaña activa */}
      <div className="flex-1 overflow-y-auto p-6 bg-white">
        {tabs.find(t => t.id === activeTab)?.component()}
      </div>
    </div>
  );
};