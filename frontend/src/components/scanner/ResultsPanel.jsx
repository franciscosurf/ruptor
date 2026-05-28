// src/components/scanner/ResultsPanel.jsx
import React, { useState, useEffect } from 'react';
import { ScoreCircle } from '../common/ScoreCircle';
import { TagList } from '../common/TagList';
import { Recommendations } from '../analysis/Recommendations';
import { MissingTermsWithContext } from '../analysis/MissingTermsWithContext';
import { JobSkillsList } from '../analysis/JobSkillsList';
import { colors } from '../../styles/colors'; // Asegúrate de que la ruta sea correcta

const ITEMS_PER_PAGE_REC = 2;
const ITEMS_PER_PAGE_MISSING = 5;

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

// Componente para métricas core (siempre visible)
const CoreMetrics = ({ scores }) => {
  const metrics = [
    { key: 'semantic', label: 'Semántico', icon: '🎯', desc: 'Coincidencia conceptual' },
    { key: 'keyword_exact', label: 'Keywords Match %', icon: '🔑', desc: 'Keywords de la oferta en tu CV' }
  ];
  return (
    <div style={{ marginTop: 24 }}>
      <div style={{
        fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1,
        color: colors.textMuted, marginBottom: 12, borderLeft: `3px solid ${colors.primary}`,
        paddingLeft: 10
      }}>
        Métricas core (filtro máquina IA)
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '12px' }}>
        {metrics.map(({ key, label, icon, desc }) => (
          scores[key] !== undefined && (
            <div key={key} style={{
              background: colors.bg, padding: '14px 12px', borderRadius: 16, textAlign: 'center',
              border: `1px solid ${colors.border}`, flex: 1, minWidth: '120px'
            }}>
              <div style={{ fontSize: 24, marginBottom: 6 }}>{icon}</div>
              <div style={{
                fontSize: 26, fontWeight: 700, color: colors.primary,
                fontFamily: "'Inter', system-ui, sans-serif", letterSpacing: -0.5
              }}>{scores[key]}%</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: colors.text, marginTop: 4 }}>{label}</div>
              <div style={{ fontSize: 10, color: colors.textMuted, marginTop: 2 }}>{desc}</div>
            </div>
          )
        ))}
      </div>
    </div>
  );
};

// Componente para métricas de optimización (barras de progreso)
const OptimizationMetrics = ({ scores }) => {
  const metrics = [
    { key: 'recruiter_visibility', label: 'Visibilidad', icon: '👁️', desc: 'Atractivo para reclutador' },
    { key: 'action_verbs', label: 'Verbos de acción', icon: '⚡', desc: 'Uso de verbos de impacto' },
    { key: 'quantified_achievements', label: 'Logros cuantificados', icon: '📊', desc: 'Resultados medibles' }
  ];
  return (
    <div style={{ marginTop: 24 }}>
      <div style={{
        fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1,
        color: colors.textMuted, marginBottom: 12, borderLeft: `3px solid ${colors.secondary || '#f59e0b'}`,
        paddingLeft: 10
      }}>
        Métricas de Optimización (Filtro Humano)
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {metrics.map(({ key, label, icon, desc }) => {
          const value = scores[key];
          if (value === undefined) return null;
          const isZeroAchievements = key === 'quantified_achievements' && value === 0;
          return (
            <div key={key} style={{ width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 18 }}>{icon}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: colors.text }}>{label}</span>
                  {isZeroAchievements && (
                    <span style={{
                      background: '#f97316', color: 'white', fontSize: 10, fontWeight: 'bold',
                      padding: '2px 8px', borderRadius: 20, marginLeft: 6
                    }}>¡Puntos Fáciles!</span>
                  )}
                </div>
                <span style={{ fontSize: 14, fontWeight: 700, color: colors.primary }}>{value}%</span>
              </div>
              <div style={{ background: colors.border, borderRadius: 10, height: 8, overflow: 'hidden' }}>
                <div style={{ width: `${value}%`, height: '100%', background: colors.primary, borderRadius: 10, transition: 'width 0.3s ease' }} />
              </div>
              <div style={{ fontSize: 10, color: colors.textMuted, marginTop: 4 }}>{desc}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const ResultsPanel = ({ result }) => {
  const [activeTab, setActiveTab] = useState('recommendations');
  const [recommendationsPage, setRecommendationsPage] = useState(0);
  const [suggestionsPage, setSuggestionsPage] = useState(0);
  const [showOptimization, setShowOptimization] = useState(true); // true = mostrar métricas optimización, false = mostrar tabs

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
  ];

  return (
    <div className="w-full flex flex-col bg-white overflow-y-auto">
      {/* Bloque del Score y métricas core (siempre visibles) */}
      <div className="p-6 border-b border-gray-100 bg-gray-50">
        <ScoreCircle score={result.ats_score} level={result.level} />
        <p className="mt-4 text-center text-sm font-medium text-gray-600">{result.summary}</p>
        {result.detailed_scores && <CoreMetrics scores={result.detailed_scores} />}
      </div>

      

      {/* Contenido condicional: Métricas de optimización o Tabs */}
      <div className="flex-1">
        {showOptimization ? (
          <div className="p-6 pt-0 bg-white">
            {result.detailed_scores && <OptimizationMetrics scores={result.detailed_scores} />}
          </div>
        ) : (
          <>
            {/* Selector de pestañas */}
            <div className="flex border-b border-gray-200 bg-white px-2">
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
            <div className="p-6 bg-white">
              {tabs.find(t => t.id === activeTab)?.component()}
            </div>
          </>
        )}
      </div>

      {/* Botón para alternar entre optimización y mejoras */}
      <div className="px-6 pt-4 pb-2 bg-white">
        <button
          onClick={() => setShowOptimization(!showOptimization)}
          className="w-full py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-lg transition shadow-sm"
        >
          {showOptimization ? '📈 Mostrar mejoras y sugerencias' : '📊 Ver métricas de optimización'}
        </button>
      </div>

    </div>
  );
};