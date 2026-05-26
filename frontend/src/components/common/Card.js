import React from 'react';
import { colors } from '../../styles/colors';

export function Card({ title, children, style = {} }) {
  return (
    <div style={{
      background: colors.bgCard,
      border: `1px solid ${colors.border}`,
      borderRadius: 24,
      padding: '24px 28px',
      marginBottom: 20,
      boxShadow: colors.shadowMd,
      transition: 'box-shadow 0.2s ease, transform 0.2s ease',
      ...style
    }}>
      {title && (
        <h3 style={{
          margin: '0 0 20px 0',
          fontSize: 13,
          color: colors.textMuted,
          textTransform: 'uppercase',
          letterSpacing: 1,
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: 8
        }}>
          <span style={{
            width: 4, height: 4, background: colors.primary,
            borderRadius: '50%', display: 'inline-block'
          }} />
          {title}
        </h3>
      )}
      {children}
    </div>
  );
}