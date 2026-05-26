import React from 'react';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';

export function Header() {
  return (
    <div style={{ textAlign: 'center', marginBottom: 48 }}>
      <div style={{
        display: 'none',
        alignItems: 'center',
        justifyContent: 'center',
        width: 56,
        height: 56,
        background: `linear-gradient(135deg, ${colors.primarySoft} 0%, ${colors.primary}20 100%)`,
        borderRadius: 18,
        marginBottom: 20,
        boxShadow: `0 0 0 4px ${colors.primarySoft}`
      }}>
        
      </div>
      <h1 style={{
        ...typography.h1,
        background: `linear-gradient(135deg, ${colors.text} 0%, ${colors.primary} 100%)`,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text'
      }}>
      
        <img src="/logo.png" alt="Logo" style={{ width: 232, height: 232 }}
          onError={(e) => {
            e.target.style.display = 'none';
            const span = document.createElement('span');
            span.textContent = '📄';
            span.style.fontSize = '28px';
            e.target.parentNode.appendChild(span);
            e.target.remove();
          }}
        />
      
      </h1>
      <p style={{ display:'none', margin: '8px 0 0', color: colors.textMuted, fontSize: 15 }}>Analiza y optimiza tu CV para superar filtros ATS</p>
    </div>
  );
}