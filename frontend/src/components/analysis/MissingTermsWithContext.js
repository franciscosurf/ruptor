import React, { useState } from 'react';
import { colors } from '../../styles/colors';

export function MissingTermsWithContext({ items }) {
  const [expandedTerm, setExpandedTerm] = useState(null);
  if (!items?.length) {
    return <span style={{ color: colors.textMuted, fontSize: 14 }}>🎉 ¡Ninguno! Tu CV cubre perfectamente la oferta.</span>;
  }
  const toggleTerm = (term) => setExpandedTerm(expandedTerm === term ? null : term);
  return (
    
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

      <p>Revisa y considera añadir las siguientes sugerencias en tu CV.</p>

      {items.map((item, idx) => (
        <div key={idx} style={{ border: `1px solid ${colors.border}`, borderRadius: 12, overflow: 'hidden', transition: 'all 0.2s ease' }}>
          <div onClick={() => toggleTerm(item.term)} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '12px 16px', background: colors.dangerSoft, cursor: 'pointer'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 16 }}>⚠️</span>
              <span style={{ 
                fontWeight: 600, 
                fontSize: 14, 
                color: colors.danger,
                display: 'inline-block',
                maxWidth: '100%',
                width: '610px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {item.term}
              </span>
              <span style={{ fontSize: 11, background: colors.danger + '20', padding: '2px 8px', borderRadius: 20, color: colors.danger }}>
                score: {item.score?.toFixed(2) || 'N/A'}
              </span>
            </div>
            <span style={{ fontSize: 12, color: colors.textMuted, transform: expandedTerm === item.term ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }}>
              ▼
            </span>
          </div>
          {expandedTerm === item.term && (
            <div style={{ padding: '16px', background: colors.bg, borderTop: `1px solid ${colors.border}` }}>
              <div style={{ fontSize: 11, color: colors.textMuted, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                📍 Contexto en la oferta
              </div>
              <div style={{ fontSize: 13, color: colors.text, lineHeight: 1.5, padding: '10px 12px', background: colors.bgCard, borderRadius: 8, borderLeft: `3px solid ${colors.danger}`, fontStyle: 'italic' }}>
                "{item.context || 'No se encontró contexto específico'}"
              </div>
              {item.semantic_score !== undefined && (
                <div style={{ marginTop: 10, fontSize: 11, color: colors.textMuted }}>
                  🔍 Similitud semántica con tu CV: {Math.round(item.semantic_score * 100)}%
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}