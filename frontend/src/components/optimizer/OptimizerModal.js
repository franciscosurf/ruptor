import React from 'react';
import { colors } from '../../styles/colors';

export function OptimizerModal({ show, data, onClose }) {
  if (!show || !data?.success) return null;
  const optimizations = data.optimizations;
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0, 0, 0, 0.7)', display: 'flex', alignItems: 'center',
      justifyContent: 'center', zIndex: 1000, padding: '20px'
    }}>
      <div style={{
        background: colors.bgCard, borderRadius: 24, maxWidth: 700, width: '100%',
        maxHeight: '85vh', overflow: 'auto', padding: '28px', boxShadow: colors.shadowLg,
        border: `1px solid ${colors.border}`
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: colors.text }}>✨ Optimiza tu CV</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: colors.textMuted }}>✕</button>
        </div>

        <div style={{ background: colors.warningSoft, padding: '14px 18px', borderRadius: 12, marginBottom: 24 }}>
          <span style={{ fontSize: 14, color: colors.text }}>📌 Hemos detectado que tu CV tiene margen de mejora. Usa estas frases para optimizarlo.</span>
        </div>

        {optimizations?.cv_section?.summary && (
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: colors.textMuted, marginBottom: 8, textTransform: 'uppercase' }}>📝 Resumen profesional sugerido</div>
            <div style={{ padding: '14px 16px', background: colors.bg, borderRadius: 12, border: `1px solid ${colors.border}`, fontSize: 14, color: colors.text, lineHeight: 1.5 }}>
              {optimizations.cv_section.summary}
            </div>
            <button onClick={() => navigator.clipboard.writeText(optimizations.cv_section.summary)} style={{
              marginTop: 8, padding: '6px 12px', background: colors.primarySoft, border: 'none', borderRadius: 8, fontSize: 12, color: colors.primary, cursor: 'pointer'
            }}>📋 Copiar</button>
          </div>
        )}

        {optimizations?.phrases?.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: colors.textMuted, marginBottom: 12, textTransform: 'uppercase' }}>🔑 Frases para incluir en tu CV</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {optimizations.phrases.slice(0, 6).map((item, idx) => (
                <div key={idx} style={{ border: `1px solid ${colors.border}`, borderRadius: 12, overflow: 'hidden' }}>
                  <div style={{ padding: '12px 16px', background: colors.primarySoft, fontWeight: 600, fontSize: 14, color: colors.primaryDark }}>{item.term}</div>
                  <div style={{ padding: '12px 16px', background: colors.bg }}>
                    {item.suggestions?.map((phrase, pIdx) => (
                      <div key={pIdx} style={{
                        padding: '8px 0', borderBottom: pIdx < item.suggestions.length - 1 ? `1px solid ${colors.border}` : 'none',
                        fontSize: 13, color: colors.text, lineHeight: 1.4
                      }}>
                        {phrase}
                        <button onClick={() => navigator.clipboard.writeText(phrase)} style={{
                          marginLeft: 12, padding: '2px 8px', background: colors.border, border: 'none', borderRadius: 6, fontSize: 10, cursor: 'pointer'
                        }}>Copiar</button>
                      </div>
                    ))}
                    <div style={{ marginTop: 8, fontSize: 11, color: colors.textMuted }}>📍 Dónde añadirlo: {item.where_to_add}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '12px', background: colors.border, border: 'none', borderRadius: 12, fontWeight: 600, cursor: 'pointer', color: colors.text }}>Cerrar</button>
          <button onClick={() => {
            const allText = optimizations?.phrases?.map(p => p.suggestions?.join('\n')).join('\n\n') || '';
            navigator.clipboard.writeText(allText);
          }} style={{ flex: 1, padding: '12px', background: colors.success, border: 'none', borderRadius: 12, fontWeight: 600, cursor: 'pointer', color: 'white' }}>Copiar todas</button>
        </div>
      </div>
    </div>
  );
}