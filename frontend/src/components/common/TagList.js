import React from 'react';
import { colors } from '../../styles/colors';
import { handleCopy } from '../../utils/copyUtils';

// Función helper para extraer texto mostrable de un item
const getItemText = (item) => {
  if (typeof item === 'string') return item.replace(/_/g, ' ');
  if (typeof item === 'object' && item !== null) {
    // Prioriza propiedades comunes
    return (item.name || item.skill || item.term || item.text || '').replace(/_/g, ' ');
  }
  return String(item);
};

export function TagList({ items, color = colors.primary, 
  emptyText = 'Ninguno', getDisplayText = getItemText, disableCopy = false }) {
  if (!items?.length) return <span style={{ color: colors.textMuted, fontSize: 14 }}>{emptyText}</span>;
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {items.map((item, idx) => {
        const displayText = getDisplayText(item);
        if (!displayText) return null;
        return (
          <span
            key={idx}
            onClick={disableCopy ? undefined : handleCopy}
            title={`Copiar "${displayText}"`}
            style={{
              padding: '6px 14px',
              borderRadius: 8,
              background: color === colors.primary ? colors.primarySoft : `${color}20`,
              color: color === colors.primary ? colors.primaryDark : color,
              fontSize: 13,
              fontWeight: 500,
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.02)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
              e.currentTarget.style.background = color === colors.primary ? '#e9d5ff' : `${color}40`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.background = color === colors.primary ? colors.primarySoft : `${color}20`;
            }}
          >
            {displayText}
          </span>
        );
      })}
    </div>
  );
}