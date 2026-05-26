import React from 'react';
import { colors } from '../../styles/colors';

export function TagList({ items, color = colors.primary, emptyText = 'Ninguno' }) {
  if (!items?.length) return <span style={{ color: colors.textMuted, fontSize: 14 }}>{emptyText}</span>;
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {items.map((t, i) => (
        <span key={i} style={{
          padding: '6px 14px', borderRadius: 8,
          background: color === colors.primary ? colors.primarySoft : color + '10',
          color: color === colors.primary ? colors.primaryDark : color,
          fontSize: 13, fontWeight: 500,
          transition: 'all 0.2s ease',
        }}>
          {typeof t === 'string' ? t.replace(/_/g, ' ') : t.term?.replace(/_/g, ' ') || JSON.stringify(t)}
        </span>
      ))}
    </div>
  );
}