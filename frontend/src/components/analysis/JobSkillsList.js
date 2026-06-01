import React from 'react';
import { colors } from '../../styles/colors';
import { copyText } from '../../utils/copyUtils'; // 👈 importamos copyText

export function JobSkillsList({ cvSkills, jobSkills, missingSkillsDetails = [] }) {
  const cvSkillsSet = new Set(cvSkills.map(s => s.toLowerCase().trim()));
  
  // Mapa de puntos para skills faltantes
  const pointsMap = new Map();
  missingSkillsDetails.forEach(item => {
    pointsMap.set(item.skill.toLowerCase().trim(), item.potential_points);
  });

  // Función de copia directa usando copyText
  const handleCopySkill = (skill) => {
    copyText(skill);
  };

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {jobSkills.map((skill, idx) => {
        const isOwned = cvSkillsSet.has(skill.toLowerCase().trim());
        const points = pointsMap.get(skill.toLowerCase().trim()) || null;
        return (
          <span
            key={idx}
            onClick={() => handleCopySkill(skill)}
            title={`Copiar "${skill}"`}
            style={{
              padding: '6px 14px',
              borderRadius: 8,
              background: isOwned ? colors.successSoft : colors.primarySoft,
              color: isOwned ? colors.success : colors.primaryDark,
              fontSize: 13,
              fontWeight: 500,
              border: `1px solid ${isOwned ? colors.success : colors.primary}`,
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.02)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
              e.currentTarget.style.background = isOwned ? '#d1fae5' : '#e9d5ff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.background = isOwned ? colors.successSoft : colors.primarySoft;
            }}
          >
            {skill}{isOwned && ' ✓'}
            {!isOwned && points !== null && (
              <span style={{ marginLeft: 8, background: '#fde047', padding: '2px 6px', borderRadius: 12, fontSize: 10 }}>
                +{points} pts
              </span>
            )}
          </span>
        );
      })}
    </div>
  );
}