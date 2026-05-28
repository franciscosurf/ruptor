// src/components/analysis/DetailedScores.jsx
import React from 'react';
import { colors } from '../../styles/colors';

export function DetailedScores({ scores }) {
  if (!scores) return null;

  // Métricas principales (formato grande)
  const primaryMetrics = [
    { key: 'semantic', label: 'Semántico', icon: '🎯', desc: 'Coincidencia conceptual' },
    { key: 'keyword_exact', label: 'Keywords Match %', icon: '🔑', desc: 'Keywords de la oferta en tu CV' }
  ];

  // Métricas secundarias (barras de progreso)
  const secondaryMetrics = [
    { key: 'recruiter_visibility', label: 'Visibilidad', icon: '👁️', desc: 'Atractivo para reclutador' },
    { key: 'action_verbs', label: 'Verbos de acción', icon: '⚡', desc: 'Uso de verbos de impacto' },
    { key: 'quantified_achievements', label: 'Logros cuantificados', icon: '📊', desc: 'Resultados medibles' }
  ];

  return (
    <div style={{ marginTop: 24 }}>
      {/* Métricas Core (IA) */}
      <div style={{ marginBottom: 24 }}>
        <div style={{
          fontSize: 13,
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: 1,
          color: colors.textMuted,
          marginBottom: 12,
          borderLeft: `3px solid ${colors.primary}`,
          paddingLeft: 10
        }}>
          Métricas core (filtro máquina IA)
        </div>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '12px'
        }}>
          {primaryMetrics.map(({ key, label, icon, desc }) => (
            scores[key] !== undefined && (
              <div key={key} style={{
                background: colors.bg,
                padding: '14px 12px',
                borderRadius: 16,
                textAlign: 'center',
                border: `1px solid ${colors.border}`,
                transition: 'all 0.2s ease',
                flex: 1,
                minWidth: '120px'
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

      {/* Métricas de Optimización (Humano) con barras de progreso */}
      <div>
        <div style={{
          fontSize: 13,
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: 1,
          color: colors.textMuted,
          marginBottom: 12,
          borderLeft: `3px solid ${colors.secondary || '#f59e0b'}`,
          paddingLeft: 10
        }}>
          Métricas de Optimización (Filtro Humano)
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {secondaryMetrics.map(({ key, label, icon, desc }) => {
            const value = scores[key];
            if (value === undefined) return null;
            const percentage = value;
            const isZeroAchievements = key === 'quantified_achievements' && percentage === 0;

            return (
              <div key={key} style={{ width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 18 }}>{icon}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: colors.text }}>{label}</span>
                    {isZeroAchievements && (
                      <span style={{
                        background: '#f97316', // Orange
                        color: 'white',
                        fontSize: 10,
                        fontWeight: 'bold',
                        padding: '2px 8px',
                        borderRadius: 20,
                        marginLeft: 6
                      }}>
                        ¡Puntos Fáciles!
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 700, color: colors.primary }}>{percentage}%</span>
                </div>
                <div style={{
                  background: colors.border,
                  borderRadius: 10,
                  height: 8,
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${percentage}%`,
                    height: '100%',
                    background: colors.primary,
                    borderRadius: 10,
                    transition: 'width 0.3s ease'
                  }} />
                </div>
                <div style={{ fontSize: 10, color: colors.textMuted, marginTop: 4 }}>{desc}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}