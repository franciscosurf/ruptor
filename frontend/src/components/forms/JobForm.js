import React, { useState } from 'react';
import { colors } from '../../styles/colors';
import { Card } from '../common/Card';

export function JobForm({
  fileName,
  jobDescription,
  onFileChange,
  onJobDescriptionChange,
  loading,
  onSubmit
}) {
  const [pasteLoading, setPasteLoading] = useState(false);
  const [fileInputKey, setFileInputKey] = useState(Date.now());
  const [isDragOver, setIsDragOver] = useState(false);

  const handlePasteFromClipboard = async () => {
    try {
      setPasteLoading(true);
      const text = await navigator.clipboard.readText();
      if (text) {
        onJobDescriptionChange(text);
      } else {
        alert('No hay texto en el portapapeles');
      }
    } catch (err) {
      console.error('Error al leer el portapapeles:', err);
      alert('No se pudo leer el portapapeles. Asegúrate de dar los permisos.');
    } finally {
      setPasteLoading(false);
    }
  };

  const handleClearFile = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onFileChange({ target: { files: null } });
    setFileInputKey(Date.now());
  };

  return (
    <Card style={{ padding: '24px', borderRadius: '16px', border: '1px solid #f3f4f6', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}>
      
      {/* PASO 1: SUBIR CV */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <span style={{
            background: '#8b5cf6',
            color: 'white',
            width: '22px',
            height: '22px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '11px',
            fontWeight: '700'
          }}>1</span>
          <label style={{ fontWeight: '600', color: '#1f2937', fontSize: '14px' }}>
            Sube tu CV
          </label>
        </div>

        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragOver(false);
            if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
              onFileChange({ target: { files: e.dataTransfer.files } });
            }
          }}
          style={{
            border: `2px dashed ${fileName ? '#10b981' : isDragOver ? '#8b5cf6' : '#e5e7eb'}`,
            borderRadius: '12px',
            padding: '32px 24px',
            textAlign: 'center',
            background: fileName ? '#f0fdf4' : isDragOver ? '#f5f3ff' : '#fafafa',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            cursor: 'pointer',
            position: 'relative'
          }}
        >
          <input
            key={fileInputKey}
            type="file"
            accept=".pdf,.docx,.txt"
            onChange={onFileChange}
            style={{ display: 'none' }}
            id="file-upload"
          />
          
          <label htmlFor="file-upload" style={{ cursor: 'pointer', display: 'block' }}>
            {/* Icono dinámico según el estado */}
            <div style={{ fontSize: '38px', marginBottom: '12px', transform: isDragOver ? 'scale(1.1)' : 'scale(1)', transition: 'transform 0.2s' }}>
              {fileName ? '📄' : '📤'}
            </div>
            
            {!fileName ? (
              <>
                <div style={{ color: '#374151', marginBottom: '4px', fontSize: '14px', fontWeight: '600' }}>
                  Arrastra y suelta tu CV aquí <span style={{ color: '#8b5cf6', fontWeight: 'normal' }}>o selecciona un archivo</span>
                </div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>Formatos soportados: PDF, DOCX, TXT</div>
              </>
            ) : (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'white', padding: '8px 14px', borderRadius: '20px', border: '1px solid #e5e7eb', boxShadow: '0 1px 2px rgb(0 0 0 / 0.05)' }}>
                <span style={{ color: '#10b981', fontWeight: 'bold', fontSize: '13px' }}>✓</span>
                <span style={{ color: '#111827', fontSize: '13px', fontWeight: '500', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {fileName}
                </span>
                <button
                  onClick={handleClearFile}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#9ca3af',
                    cursor: 'pointer',
                    fontSize: '14px',
                    padding: '2px 4px',
                    marginLeft: '4px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#9ca3af'}
                  title="Eliminar archivo"
                >
                  ✕
                </button>
              </div>
            )}
          </label>
        </div>
      </div>

      {/* PASO 2: OFERTA DE TRABAJO */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <span style={{
            background: '#8b5cf6',
            color: 'white',
            width: '22px',
            height: '22px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '11px',
            fontWeight: '700'
          }}>2</span>
          <label style={{ fontWeight: '600', color: '#1f2937', fontSize: '14px' }}>
            Pega la descripción del puesto
          </label>
        </div>

        <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e5e7eb' }}>
          <textarea
            value={jobDescription}
            onChange={(e) => {
              if (e.target.value.length <= 5000) {
                onJobDescriptionChange(e.target.value);
              }
            }}
            rows={5}
            placeholder="Pega aquí el texto completo de la oferta de trabajo (requisitos, responsabilidades...)"
            style={{
              width: '100%',
              padding: '16px',
              paddingBottom: '44px', // Espacio para el badge inferior derecho
              background: '#ffffff',
              color: '#374151',
              fontSize: '13.5px',
              lineHeight: '1.5',
              resize: 'none',
              fontFamily: 'inherit',
              border: 'none',
              outline: 'none'
            }}
          />
          
          {/* Botón Flotante de Pegar (Arriba a la derecha para no estorbar el texto) */}
          <button
            onClick={handlePasteFromClipboard}
            disabled={pasteLoading}
            style={{
              position: 'absolute',
              right: '12px',
              top: '12px',
              padding: '6px 12px',
              background: '#f5f3ff',
              border: '1px solid #ddd6fe',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: '600',
              color: '#6d28d9',
              cursor: pasteLoading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
            onMouseEnter={(e) => { if(!pasteLoading) e.currentTarget.style.background = '#ede9fe'; }}
            onMouseLeave={(e) => { if(!pasteLoading) e.currentTarget.style.background = '#f5f3ff'; }}
          >
            {pasteLoading ? 'Pegando...' : '📋 Pegar'}
          </button>

          {/* Contador de caracteres integrado sutilmente */}
          <div style={{
            position: 'absolute',
            bottom: '12px',
            right: '12px',
            fontSize: '11px',
            color: '#9ca3af',
            background: 'rgba(255, 255, 255, 0.9)',
            padding: '2px 6px',
            borderRadius: '4px'
          }}>
            {jobDescription.length} / 5000
          </div>
        </div>
        
        {/* Pequeño tip de ayuda inferior idéntico al de tu captura */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', background: '#f9fafb', padding: '12px 14px', borderRadius: '8px', marginTop: '12px', border: '1px solid #f3f4f6' }}>
          <span style={{ fontSize: '14px' }}>💡</span>
          <p style={{ margin: 0, fontSize: '12px', color: '#6b7280', lineHeight: '1.4' }}>
            <strong style={{ color: '#4b5563' }}>Consejo:</strong> Copia y pega toda la descripción, incluyendo requisitos, responsabilidades y habilidades deseadas para un análisis óptimo.
          </p>
        </div>
      </div>

      {/* PASO 3: ACCIÓN PRINCIPAL */}
      <button
        onClick={onSubmit}
        disabled={loading || !jobDescription || !fileName}
        style={{
          width: '100%',
          padding: '14px 20px',
          background: loading ? '#9ca3af' : (!jobDescription || !fileName) ? '#c0a5ff' : '#7c3aed',
          color: 'white',
          border: 'none',
          borderRadius: '12px',
          fontWeight: '600',
          fontSize: '14px',
          cursor: (loading || !jobDescription || !fileName) ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          boxShadow: (!loading && jobDescription && fileName) ? '0 4px 12px rgba(124, 58, 237, 0.25)' : 'none'
        }}
        onMouseEnter={(e) => { if(!loading && jobDescription && fileName) e.currentTarget.style.background = '#6d28d9'; }}
        onMouseLeave={(e) => { if(!loading && jobDescription && fileName) e.currentTarget.style.background = '#7c3aed'; }}
      >
        <span>{loading ? '⚡ Procesando...' : 'Analizar CV ✨'}</span>
      </button>
    </Card>
  );
}