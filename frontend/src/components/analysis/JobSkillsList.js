import React from 'react';
import { colors } from '../../styles/colors';

export function JobSkillsList({ cvSkills, jobSkills }) {
  const cvSkillsSet = new Set(cvSkills.map(s => s.toLowerCase().trim()));
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {jobSkills.map((skill, idx) => {
        const isOwned = cvSkillsSet.has(skill.toLowerCase().trim());
        return (
          <span key={idx} style={{
            padding: '6px 14px', borderRadius: 8,
            background: isOwned ? colors.successSoft : colors.primarySoft,
            color: isOwned ? colors.success : colors.primaryDark,
            fontSize: 13, fontWeight: 500,
            border: `1px solid ${isOwned ? colors.success : colors.primary}`,
            transition: 'all 0.2s ease',
          }}>
            {skill}{isOwned && ' ✓'}
          </span>
        );
      })}
    </div>
  );
}