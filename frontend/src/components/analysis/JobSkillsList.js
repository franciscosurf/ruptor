import React from 'react';
import { colors } from '../../styles/colors';
import { handleCopy } from '../../utils/copyUtils'; // Asegúrate de que la ruta sea correcta

export function JobSkillsList({ cvSkills, jobSkills }) {
  const cvSkillsSet = new Set(cvSkills.map(s => s.toLowerCase().trim()));

  const handleCopySkill = (skill) => {
    handleCopy(skill);
  };

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {jobSkills.map((skill, idx) => {
        const isOwned = cvSkillsSet.has(skill.toLowerCase().trim());
        const displayText = skill; // Texto a copiar (sin el checkmark)
        return (
          <span
            key={idx}
            onClick={handleCopySkill} // Copia el textContent del span (sin el ✓)
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
          </span>
        );
      })}
    </div>
  );
}
