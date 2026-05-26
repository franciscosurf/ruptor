import React, { useState, useEffect } from 'react';
import { useAnalysis } from './hooks/useAnalysis';
import { useOptimizer } from './hooks/useOptimizer';
import { colors } from './styles/colors';
import { ScoreCircle } from './components/common/ScoreCircle';
import { Card } from './components/common/Card';
import { TagList } from './components/common/TagList';
import { LoadingSpinner } from './components/common/LoadingSpinner';
import { DetailedScores } from './components/analysis/DetailedScores';
import { Recommendations } from './components/analysis/Recommendations';
import { MissingTermsWithContext } from './components/analysis/MissingTermsWithContext';
import { JobSkillsList } from './components/analysis/JobSkillsList';
import { Header } from './components/analysis/Header';
import { JobForm } from './components/forms/JobForm';
import { OptimizerModal } from './components/optimizer/OptimizerModal';

export default function App() {
  const {
    file, fileName, jobDescription, analysisMode, result, loading, error,
    handleFileChange, setJobDescription, setAnalysisMode, handleSubmit, handleExportReport,
    setResult   // nuevo: permite resetear el resultado
  } = useAnalysis();

  const { showOptimizer, cvOptimizations, loadingOptimizer, handleOptimizeCV, closeOptimizer } = useOptimizer(file, jobDescription);

  const [showForm, setShowForm] = useState(true);

  // Ocultar formulario cuando hay un resultado (análisis completado)
  useEffect(() => {
    if (result) {
      setShowForm(false);
    }
  }, [result]);

  const handleNewAnalysis = () => {
    setShowForm(true);
    setResult(null); // Limpia el resultado para que desaparezcan los datos previos
    // Opcional: resetear también el archivo y la descripción? Se mantienen para comodidad.
  };

  return (
    <div style={{ minHeight: '100vh', background: colors.bgCard, fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", color: colors.text }}>
      <div style={{ maxWidth: 880, margin: '0 auto', padding: '48px 24px' }}>
        <Header />

        {showForm && (
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
        )}

        {/* Botón para mostrar el formulario nuevamente, solo cuando hay resultado y el formulario está oculto */}
        {result && !showForm && (
          <button
            onClick={handleNewAnalysis}
            style={{
              width: '100%',
              padding: '12px 0',
              marginBottom: 20,
              background: colors.primary,
              color: 'white',
              border: 'none',
              borderRadius: 12,
              fontWeight: 600,
              fontSize: 14,
              cursor: 'pointer',
              transition: 'background 0.2s ease'
            }}
          >
            🔍 Analizar otro CV
          </button>
        )}

        {error && (
          <div style={{ padding: '14px 20px', borderRadius: 12, marginBottom: 20, background: colors.dangerSoft, border: `1px solid ${colors.danger}30`, color: colors.danger, fontSize: 13, fontWeight: 500 }}>
            ⚠️ {error}
          </div>
        )}

        {loading && <LoadingSpinner />}

        {result && !loading && (
          <>
            <Card>
              <ScoreCircle score={result.ats_score} level={result.level} />
              <p style={{ textAlign: 'center', margin: '0 auto', color: colors.text, fontSize: 14, lineHeight: 1.5, maxWidth: 450 }}>{result.summary}</p>

              {result.profession_detected && (
                <div style={{ marginTop: 20, textAlign: 'center', padding: '10px 16px', background: colors.primarySoft, borderRadius: 12, display: 'inline-block', width: 'auto', margin: '20px auto 0' }}>
                  <span style={{ fontSize: 12, color: colors.textMuted }}>🎯 Profesión detectada: </span>
                  <span style={{ fontWeight: 600, color: colors.primaryDark }}>{result.profession_detected.profession?.toUpperCase()}</span>
                  <span style={{ fontSize: 11, color: colors.textMuted, marginLeft: 8 }}>· confianza {result.confidence_score}%</span>
                </div>
              )}

              <div style={{ display: 'flex', gap: 24, marginTop: 24, justifyContent: 'center', paddingTop: 20, borderTop: `1px solid ${colors.border}` }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 28, fontWeight: 700, color: colors.primary }}>{result.detailed_scores?.semantic || 0}%</div>
                  <div style={{ fontSize: 11, color: colors.textMuted }}>Semántico</div>
                </div>
                <div style={{ width: 1, background: colors.border }} />
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 28, fontWeight: 700, color: colors.primary }}>{result.detailed_scores?.keyword_exact || 0}%</div>
                  <div style={{ fontSize: 11, color: colors.textMuted }}>Cobertura</div>
                </div>
              </div>
              {result.detailed_scores && <DetailedScores scores={result.detailed_scores} />}
            </Card>

            {(result.experience_match || result.education_match) && (
              <Card title="Experiencia y Educación">
                {result.experience_match && (
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                      <span style={{ color: colors.textMuted, fontSize: 13 }}>Años de experiencia</span>
                      <span style={{ fontWeight: 600 }}>{result.experience_match.detected} / {result.experience_match.required} años</span>
                    </div>
                    <div style={{ background: colors.border, borderRadius: 100, height: 6, overflow: 'hidden' }}>
                      <div style={{ width: `${result.experience_match.match}%`, background: colors.primary, height: '100%', borderRadius: 100, transition: 'width 0.3s ease' }} />
                    </div>
                  </div>
                )}
                {result.education_match && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                      <span style={{ color: colors.textMuted, fontSize: 13 }}>Nivel educativo</span>
                      <span style={{ fontWeight: 600 }}>{result.education_match.detected_level} / {result.education_match.required_level}</span>
                    </div>
                    <div style={{ background: colors.border, borderRadius: 100, height: 6, overflow: 'hidden' }}>
                      <div style={{ width: `${result.education_match.match}%`, background: colors.success, height: '100%', borderRadius: 100, transition: 'width 0.3s ease' }} />
                    </div>
                  </div>
                )}
              </Card>
            )}

            {result.recommendations && result.recommendations.length > 0 && <Recommendations recommendations={result.recommendations} />}

            {result.culture_suggestions?.length > 0 && (
              <Card title="🌱 Valores y cultura de la empresa">
                <ul style={{ margin: 0, paddingLeft: 20 }}>
                  {result.culture_suggestions.map((item, idx) => (
                    <li key={idx} style={{ marginBottom: 8, fontSize: 13 }}>
                      {item.text}
                    </li>
                  ))}
                </ul>
              </Card>
            )}
            
            {result.ats_score < 65 && (
              <button onClick={handleOptimizeCV} disabled={loadingOptimizer} style={{
                width: '100%', padding: '14px 20px', background: loadingOptimizer ? colors.textMuted : colors.warning, color: 'white', border: 'none', borderRadius: 12, fontWeight: 600, fontSize: 14, cursor: loadingOptimizer ? 'not-allowed' : 'pointer', marginBottom: 20
              }}>
                {loadingOptimizer ? 'Generando optimizaciones...' : '✨ Optimizar Mi CV'}
              </button>
            )}

            {(result.extracted_skills_cv?.length > 0 || result.extracted_skills_job?.length > 0) && (
              <Card title="Habilidades Técnicas">
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 10, color: colors.textMuted }}>✅ Tu CV detecta</div>
                  <TagList items={result.extracted_skills_cv} color={colors.success} emptyText="No se detectaron skills específicas" />
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 10, color: colors.textMuted }}>🎯 La oferta requiere</div>
                  <JobSkillsList cvSkills={result.extracted_skills_cv || []} jobSkills={result.extracted_skills_job || []} />
                </div>
              </Card>
            )}

            {result.profession_skills_suggestions?.length > 0 && (
              <Card title="💡 Skills sugeridas para tu perfil">
                <TagList items={result.profession_skills_suggestions} color={colors.warning} />
              </Card>
            )}

            <Card title="❌SUGERENCIAS">
              <MissingTermsWithContext items={result.missing_terms_with_context || result.priority_missing_terms?.map(t => ({ term: t })) || []} />
            </Card>

            <Card title="Términos que ya tienes">
              <TagList items={result.matched_terms} color={colors.success} emptyText="No se detectaron coincidencias directas." />
            </Card>

            <details style={{ marginTop: 12 }}>
              <summary style={{ cursor: 'pointer', color: colors.primary, fontWeight: 500, padding: '12px 0', fontSize: 13, listStyle: 'none' }}>🔍 Ver análisis completo de palabras clave</summary>
              <div style={{ marginTop: 16 }}>
                <Card title="Palabras clave del CV">
                  <TagList items={result.cv_terms} color={colors.textMuted} />
                </Card>
                <Card title="Palabras clave de la oferta">
                  <TagList items={result.job_terms} color={colors.primary} />
                </Card>
              </div>
            </details>
          </>
        )}
      </div>
      <OptimizerModal show={showOptimizer} data={cvOptimizations} onClose={closeOptimizer} />
    </div>
  );
}