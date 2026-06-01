import React from 'react';
import { colors } from '../../styles/colors';

export function ScoreCircle({ score, level: _level }) {
  let numericScore = parseFloat(score) || 0;
  numericScore = Math.min(Math.max(numericScore, 0), 100);
  const displayScore = numericScore.toFixed(1);

  // Determinar nivel y emoji basado en el score
  let levelText = '';
  let emoji = '';
  let nextLevelThreshold = null;
  let nextLevelName = '';

  if (numericScore >= 90) {
    levelText = 'ATS Elite';
    emoji = '💎';
    // No hay siguiente nivel
  } else if (numericScore >= 75) {
    levelText = 'ATS Profesional';
    emoji = '🥇';
    nextLevelThreshold = 90;
    nextLevelName = 'ATS Elite';
  } else if (numericScore >= 50) {
    levelText = 'ATS Intermedio';
    emoji = '🥈';
    nextLevelThreshold = 75;
    nextLevelName = 'ATS Professional';
  } else {
    levelText = 'ATS Principiante';
    emoji = '🥉';
    nextLevelThreshold = 50;
    nextLevelName = 'ATS Intermedio';
  }

  // Colores según rangos
  let color;
  let bgSoft;
  if (numericScore >= 90) {
    color = colors.success;
    bgSoft = colors.successSoft;
  } else if (numericScore >= 75) {
    color = colors.primary;
    bgSoft = colors.primarySoft;
  } else if (numericScore >= 50) {
    color = colors.warning;
    bgSoft = colors.warningSoft;
  } else {
    color = colors.danger;
    bgSoft = colors.dangerSoft;
  }

  const pointsToNext = nextLevelThreshold ? Math.ceil(nextLevelThreshold - numericScore) : null;

  return (
    <div style={{ textAlign: 'center', marginBottom: 32 }}>
      <div style={{
        position: 'relative',
        display: 'inline-flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        width: 160, height: 160, borderRadius: '50%',
        background: `conic-gradient(${color} ${numericScore * 3.6}deg, ${colors.borderDark} 0deg)`,
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
            color: color, fontFamily: "'Inter', system-ui, sans-serif",
            letterSpacing: -1
          }}>
            {displayScore}
          </span>
          <span style={{ fontSize: 12, color: colors.textMuted, letterSpacing: 0.5, marginTop: 4, fontWeight: 500 }}>
            ATS SCORE
          </span>
        </div>
      </div>
      <div style={{
        marginTop: 16, display: 'inline-block',
        padding: '6px 18px', borderRadius: 100,
        background: bgSoft, color: 'black',
        fontWeight: 600, fontSize: 12, letterSpacing: 0.3,
      }}>
        {emoji} {levelText}
        <p className="text-xs font-normal text-gray-600 mt-1">{_level}</p>
      </div>

      {/* Mensaje de progreso */}
      {nextLevelThreshold !== null && pointsToNext > 0 && (
        <div style={{
          marginTop: 12,
          fontSize: 13,
          color: colors.textMuted,
          fontWeight: 500,
        }}>
          📈 Te faltan <strong>{pointsToNext}</strong> {pointsToNext === 1 ? 'punto' : 'puntos'} para {nextLevelName}
        </div>
      )}
      {numericScore >= 90 && (
        <div style={{
          marginTop: 12,
          fontSize: 13,
          color: colors.success,
          fontWeight: 500,
        }}>
          🎉 ¡Excelente! Has alcanzado el nivel Elite.
        </div>
      )}
    </div>
  );
}