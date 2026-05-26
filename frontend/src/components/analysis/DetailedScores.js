import React from 'react';
import { colors } from '../../styles/colors';

export function DetailedScores({ scores }) {
  if (!scores) return null;
  const metrics = [
    { key: 'semantic', label: 'Semántico', icon: '🎯', desc: 'Coincidencia conceptual' },
    { key: 'keyword_exact', label: 'Keywords', icon: '🔑', desc: 'Términos exactos' },
    { key: 'technical_skills', label: 'Skills', icon: '⚙️', desc: 'Habilidades técnicas' },
    { key: 'recruiter_visibility', label: 'Visibilidad', icon: '👁️', desc: 'Atractivo para recruiter' } // nueva

  ];
  return (
    <div style={{ marginTop: 24 }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: 12
      }}>
        {metrics.map(({ key, label, icon, desc }) => (
          scores[key] !== undefined && (
            <div key={key} style={{
              background: colors.bg,
              padding: '14px 12px',
              borderRadius: 16,
              textAlign: 'center',
              border: `1px solid ${colors.border}`,
              transition: 'all 0.2s ease'
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