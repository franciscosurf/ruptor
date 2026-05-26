import React from 'react';
import { colors } from '../../styles/colors';
import { Card } from '../common/Card';

export function JobForm({ fileName, jobDescription, analysisMode, onFileChange, onJobDescriptionChange, onModeChange, onSubmit, onExport, loading, resultExists }) {
  return (
    <Card>
      <div style={{ marginBottom: 24 }}>
        <label style={{ display: 'block', fontWeight: 600, marginBottom: 8, color: colors.text, fontSize: 13 }}>Documento CV</label>
        <div style={{ border: `2px dashed ${colors.borderDark}`, borderRadius: 16, padding: '24px', textAlign: 'center', background: colors.bg, cursor: 'pointer' }}>
          <input type="file" accept=".pdf,.docx,.txt" onChange={onFileChange} style={{ display: 'none' }} id="file-upload" />
          <label htmlFor="file-upload" style={{ cursor: 'pointer' }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>📎</div>
            <div style={{ color: colors.text, marginBottom: 4, fontSize: 14, fontWeight: 500 }}>{fileName || 'Haz clic para subir tu CV'}</div>
            <div style={{ fontSize: 12, color: colors.textMuted }}>PDF, DOCX o TXT</div>
          </label>
        </div>
      </div>

      <div style={{ marginBottom: 24 }}>
        <label style={{ display: 'block', fontWeight: 600, marginBottom: 8, color: colors.text, fontSize: 13 }}>Descripción del puesto</label>
        <textarea value={jobDescription} onChange={(e) => onJobDescriptionChange(e.target.value)} rows={6}
          placeholder="Pega aquí el texto completo de la oferta de trabajo..."
          style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: `1px solid ${colors.borderDark}`, background: colors.bg, color: colors.text, fontSize: 14, resize: 'vertical', fontFamily: 'inherit', outline: 'none' }}
        />
      </div>

      <div style={{ marginBottom: 24 }}>
        <label style={{ display: 'block', fontWeight: 600, marginBottom: 8, color: colors.text, fontSize: 13 }}>Modo de análisis</label>
        <div style={{ display: 'flex', gap: 8 }}>
          {[
            { value: 'strict', label: 'Estricto', desc: 'Máxima precisión' },
            { value: 'balanced', label: 'Balanceado', desc: 'Recomendado' },
            { value: 'flexible', label: 'Flexible', desc: 'Más coincidencias' }
          ].map(option => (
            <button key={option.value} onClick={() => onModeChange(option.value)} style={{
              flex: 1, padding: '12px 16px', background: analysisMode === option.value ? colors.primarySoft : colors.bg,
              border: `1px solid ${analysisMode === option.value ? colors.primary : colors.borderDark}`, borderRadius: 12, cursor: 'pointer'
            }}>
              <div style={{ fontWeight: 600, fontSize: 13, color: analysisMode === option.value ? colors.primaryDark : colors.text }}>{option.label}</div>
              <div style={{ fontSize: 10, color: colors.textMuted, marginTop: 2 }}>{option.desc}</div>
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12 }}>
        <button onClick={onSubmit} disabled={loading} style={{
          flex: 2, padding: '14px 20px', background: loading ? colors.textMuted : colors.primary, color: 'white', border: 'none', borderRadius: 12, fontWeight: 600, fontSize: 14, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1
        }}>{loading ? 'Analizando...' : 'Analizar CV'}</button>

        <button onClick={onExport} disabled={!resultExists} style={{
          flex: 1, padding: '14px 20px', background: resultExists ? colors.success : colors.borderDark, color: resultExists ? 'white' : colors.textMuted, border: 'none', borderRadius: 12, fontWeight: 600, fontSize: 14, cursor: resultExists ? 'pointer' : 'not-allowed', opacity: resultExists ? 1 : 0.6
        }}>Exportar</button>
      </div>
    </Card>
  );
}