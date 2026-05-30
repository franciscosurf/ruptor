import React, { useState } from 'react';
import { colors } from '../../styles/colors';

export function MissingTermsWithContext({ items }) {
  const [expandedTerm, setExpandedTerm] = useState(null);

  if (!items?.length) {
    return <span style={{ color: colors.textMuted, fontSize: 14 }}>🎉 ¡Ninguno! Tu CV cubre perfectamente la oferta.</span>;
  }

  const toggleTerm = (term) => {
    setExpandedTerm(expandedTerm === term ? null : term);
  };

  // Determina si el elemento debe ser expandible
  const isExpandable = (item) => {
    const hasDifferentContext = item.context && item.context !== item.term;
    const isLongTerm = item.term.length > 60;
    return hasDifferentContext || isLongTerm;
  };

  // Obtiene el contenido a mostrar en el panel expandido
  const getExpandContent = (item) => {
    if (item.context && item.context !== item.term) {
      return { type: 'context', content: item.context };
    }
    return { type: 'term', content: item.term };
  };

  return (
    <div data-missing-terms="" style={{ display: 'flex', flex:'1',flexDirection: 'column', gap: 12 }}>
      <p>Revisa y considera añadir las siguientes sugerencias en tu CV.</p>

      {items.map((item, idx) => {
        const expandable = isExpandable(item);
        const isExpanded = expandedTerm === item.term;
        const expandContent = getExpandContent(item);

        return (
          <div key={idx} style={{ border: `1px solid ${colors.border}`, borderRadius: 12, overflow: 'hidden', transition: 'all 0.2s ease' }}>
            {/* Cabecera - solo clickeable si es expandible */}
            <div
              onClick={expandable ? () => toggleTerm(item.term) : undefined}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                background: colors.dangerSoft,
                cursor: expandable ? 'pointer' : 'default',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
                <span style={{ fontSize: 16 }}>⚠️</span>
                <span
                  style={{
                    fontWeight: 600,
                    fontSize: 14,
                    color: colors.danger,
                    display: 'inline-block',
                    maxWidth: '100%',
                    flex: 1,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {item.term}
                </span>
                <span
                  style={{
                    fontSize: 11,
                    background: colors.danger + '20',
                    padding: '2px 8px',
                    borderRadius: 20,
                    color: colors.danger,
                    flexShrink: 0,
                  }}
                >
                  score: {item.score?.toFixed(2) || 'N/A'}
                </span>
              </div>
              {/* Flecha solo si es expandible */}
              {expandable && (
                <span
                  style={{
                    fontSize: 12,
                    color: colors.textMuted,
                    transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s ease',
                    marginLeft: 8,
                  }}
                >
                  ▼
                </span>
              )}
            </div>

            {/* Panel expandido */}
            {expandable && isExpanded && (
              <div style={{ padding: '16px', background: colors.bg, borderTop: `1px solid ${colors.border}` }}>
                <div style={{ fontSize: 11, color: colors.textMuted, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  {expandContent.type === 'context' ? '📍 Contexto en la oferta' : '📝 Término completo'}
                </div>
                <div
                  style={{
                    fontSize: 13,
                    color: colors.text,
                    lineHeight: 1.5,
                    padding: '10px 12px',
                    background: colors.bgCard,
                    borderRadius: 8,
                    borderLeft: `3px solid ${colors.danger}`,
                    ...(expandContent.type === 'context' ? { fontStyle: 'italic' } : {}),
                  }}
                >
                  "{expandContent.content}"
                </div>
                {item.semantic_score !== undefined && (
                  <div style={{ marginTop: 10, fontSize: 11, color: colors.textMuted }}>
                    🔍 Similitud semántica con tu CV: {Math.round(item.semantic_score * 100)}%
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}