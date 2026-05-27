import React from 'react';
import { colors } from '../../styles/colors';

export function DetailedScores({ scores }) {
  if (!scores) return null;
  const metrics = [
    { key: 'semantic', label: 'Semántico', icon: '🎯', desc: 'Coincidencia conceptual' },
    { key: 'keyword_exact', label: 'Keywords Match %', icon: '🔑', desc: 'Keywords de la oferta en tu CV' },
    //{ key: 'keyword_partial', label: 'Parciales', icon: '🔄', desc: 'Términos similares' },
    // { key: 'technical_skills', label: 'Skills', icon: '⚙️', desc: 'Habilidades técnicas' }, // ← Eliminado
    { key: 'recruiter_visibility', label: 'Visibilidad', icon: '👁️', desc: 'Atractivo para reclutador' },
    { key: 'action_verbs', label: 'Verbos de acción', icon: '⚡', desc: 'Uso de verbos de impacto' },
    { key: 'quantified_achievements', label: 'Logros cuantificados', icon: '📊', desc: 'Resultados medibles' }
  ];
  return (
    <div style={{ marginTop: 24 }}>
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: '12px'
      }}>
        {metrics.map(({ key, label, icon, desc }) => (
          scores[key] !== undefined && (
            <div key={key} style={{
              background: colors.bg,
              padding: '14px 12px',
              borderRadius: 16,
              textAlign: 'center',
              border: `1px solid ${colors.border}`,
              transition: 'all 0.2s ease',
              flex: 1
            }}>
              <div style={{ fontSize: 24, marginBottom: 6 }}>{icon}</div>
              <div style={{
                fontSize: 26, fontWeight: 700,
                color: colors.primary,
                fontFamily: "'Inter', system-ui, sans-serif",
                letterSpacing: -0.5
              }}>
                {scores[key]}%
              </div>
              <div style={{ fontSize: 12, fontWeight: 600, color: colors.text, marginTop: 4 }}>{label}</div>
              <div style={{ fontSize: 10, color: colors.textMuted, marginTop: 2 }}>{desc}</div>
            </div>
          )
        ))}
      </div>
    </div>
  );
}