import React from 'react';
import { colors } from '../../styles/colors';
import { Card } from '../common/Card';
import { TagList } from '../common/TagList';

export function Recommendations({ recommendations }) {
  if (!recommendations?.length) return null;
  const priorityConfig = {
    Alta: { icon: '⚡', color: colors.danger, bg: colors.dangerSoft },
    Media: { icon: '📌', color: colors.warning, bg: colors.warningSoft },
    Baja: { icon: '💡', color: colors.primary, bg: colors.primarySoft }
  };
  return (
    <Card title="Recomendaciones">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {recommendations.map((rec, idx) => {
          const config = priorityConfig[rec.priority] || priorityConfig.Media;
          return (
            <div key={idx} style={{
              padding: '16px 20px',
              borderRadius: 16,
              background: config.bg,
              borderLeft: `3px solid ${config.color}`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                <span style={{ fontSize: 18 }}>{config.icon}</span>
                <span style={{ fontWeight: 600, fontSize: 14, color: colors.text, flex: 1 }}>{rec.action}</span>
                <span style={{
                  padding: '4px 10px',
                  borderRadius: 100,
                  background: config.color,
                  color: 'white',
                  fontSize: 10,
                  fontWeight: 600
                }}>
                  {rec.priority}
                </span>
              </div>
              {rec.examples && rec.examples.length > 0 && (
                <div style={{ marginTop: 8, marginLeft: 30 }}>
                  <span style={{ fontSize: 11, color: colors.textMuted }}>Ejemplos: </span>
                  <TagList items={rec.examples.slice(0, 3)} color={config.color} />
                </div>
              )}
              <div style={{ marginTop: 8, marginLeft: 30 }}>
                <span style={{ fontSize: 12, color: config.color }}>→ {rec.impact}</span>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}