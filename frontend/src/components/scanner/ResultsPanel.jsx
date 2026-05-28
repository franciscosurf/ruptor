// src/components/scanner/ResultsPanel.jsx
import React, { useState } from 'react';
import { ScoreCircle } from '../common/ScoreCircle';
import { TagList } from '../common/TagList';
import { DetailedScores } from '../analysis/DetailedScores';
import { Recommendations } from '../analysis/Recommendations';
import { MissingTermsWithContext } from '../analysis/MissingTermsWithContext';
import { JobSkillsList } from '../analysis/JobSkillsList';

export const ResultsPanel = ({ result }) => {
  const [activeTab, setActiveTab] = useState('recommendations');

  const tabs = [
    { id: 'recommendations', label: '⚡ Mejoras', component: () => <Recommendations recommendations={result?.recommendations || []} /> },
    { id: 'skills', label: '🛠️ Skills', component: () => (
      <>
        <div className="mb-4">
          <div className="text-sm font-medium text-gray-500 mb-2">✅ Tu CV detecta</div>
          <TagList items={result?.extracted_skills_cv || []} color="#10b981" emptyText="Sin skills" />
        </div>
        <div>
          <div className="text-sm font-medium text-gray-500 mb-2">🎯 La oferta requiere</div>
          <JobSkillsList cvSkills={result?.extracted_skills_cv || []} jobSkills={result?.extracted_skills_job || []} />
        </div>
      </>
    ) },
    { id: 'suggestions', label: '❌ Sugerencias', component: () => <MissingTermsWithContext items={result?.missing_terms_with_context || []} /> }
  ];

  return (
    /* 
      SOLUCIÓN EFECTIVA: 
      - 'min-h-0' resetea el min-height por defecto de flexbox.
      - Al ser hijo directo de un contenedor flex, ocupará el 100% del alto disponible sin desbordarlo.
    */
    <div className="w-5/12 flex flex-col bg-white min-h-0">
      
      {/* Bloque del Score - No se encoge (flex-shrink-0) */}
      <div className="p-6 border-b border-gray-100 bg-gray-50 flex-shrink-0">
        <ScoreCircle score={result.ats_score} level={result.level} />
        <p className="mt-4 text-center text-sm font-medium text-gray-600">{result.summary}</p>
        {result.detailed_scores && (
          <div className="mt-5 pt-5 border-t border-gray-100">
            <DetailedScores scores={result.detailed_scores} />
          </div>
        )}
      </div>

      {/* Selector de Pestañas - No se encoge (flex-shrink-0) */}
      <div className="flex border-b border-gray-200 bg-white px-2 flex-shrink-0">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-3 px-2 text-xs font-bold uppercase tracking-wide transition-all border-b-2 text-center ${
              activeTab === tab.id ? 'border-purple-600 text-purple-700 bg-purple-50/50 rounded-t-lg' : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 
        Contenedor de Contenido:
        - 'flex-1' toma todo el espacio restante calculado de forma exacta.
        - 'overflow-y-auto' ahora sí funciona porque el padre sabe dónde termina su límite vertical.
      */}
      <div className="flex-1 overflow-y-auto p-6 bg-white">
        {tabs.find(t => t.id === activeTab)?.component()}
      </div>

    </div>
  );
};