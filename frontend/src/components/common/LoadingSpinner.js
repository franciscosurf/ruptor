import React from 'react';
import { colors } from '../../styles/colors';

export function LoadingSpinner() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '60px',
      gap: 16
    }}>
      <div style={{
        width: 40, height: 40,
        border: `2px solid ${colors.borderDark}`,
        borderTopColor: colors.primary,
        borderRadius: '50%',
        animation: 'spin 0.6s cubic-bezier(0.4, 0, 0.2, 1) infinite'
      }} />
      <span style={{ color: colors.textMuted, fontSize: 14 }}>Analizando tu CV...</span>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}