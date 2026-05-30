import React from 'react';
import { colors } from '../../styles/colors';

export function ScoreCircle({ score, level }) {

  score = Math.round(score) || 0;

  const color = score >= 75 ? colors.success 
              : score >= 55 ? colors.primary 
              : score >= 35 ? colors.warningDark 
              : colors.danger;
  const bgSoft = score >= 75 ? colors.successSoft 
              : score >= 55 ? colors.primarySoft 
              : score >= 35 ? colors.warningSoft 
              : colors.dangerSoft;

  return (
    <div style={{ textAlign: 'center', marginBottom: 32 }}>
      <div style={{
        position: 'relative',
        display: 'inline-flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        width: 160, height: 160, borderRadius: '50%',
        background: `conic-gradient(${color} ${score * 3.6}deg, ${colors.borderDark} 0deg)`,
        padding: 6,
      }}>
        <div style={{
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          width: '100%', height: '100%', borderRadius: '50%',
          background: colors.bgCard,
        }}>
          <span style={{
            fontSize: 54, fontWeight: 700,
            color: colors.warning, fontFamily: "'Inter', system-ui, sans-serif",
            letterSpacing: -1
          }}>
            {score}
          </span>
          <span style={{ fontSize: 12, color: colors.textMuted, letterSpacing: 0.5, marginTop: 4, fontWeight: 500 }}>
            ATS SCORE
          </span>
        </div>
      </div>
      <div style={{
        marginTop: 16, display: 'inline-block',
        padding: '6px 18px', borderRadius: 100,
        background: bgSoft, color,
        fontWeight: 600, fontSize: 12, letterSpacing: 0.3,
      }}>
        {level}
      </div>
    </div>
  );
}