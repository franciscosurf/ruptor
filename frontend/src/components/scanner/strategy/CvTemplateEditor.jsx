// src/components/scanner/strategy/CvTemplateEditor.jsx
import React, { useEffect, useRef } from 'react';

// Componente inteligente que auto-ajusta su altura como un documento real
// AutoTextarea
const AutoTextarea = ({ value, onChange, placeholder, className }) => {
  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [value]);

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      spellCheck="false"
      // w-full + outline-none + overflow-hidden lo hace invisible hasta que interactúas
      className={`w-full outline-none resize-none overflow-hidden bg-transparent focus:bg-purple-50/30 transition-colors rounded p-1 ${className}`}
      // white-space: pre-wrap es el truco para que respete espacios extra y tabulaciones
      style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}
    />
  );
};

export const CvTemplateEditor = ({ cvData, updateSection, templateRef }) => {
  if (!cvData) return null;

  return (
    <div className="flex-1 flex flex-col relative bg-gray-200/50 overflow-y-auto items-center p-8">
      
      {/* Lienzo A4 */}
      <div 
        ref={templateRef}
        className="bg-white shadow-2xl font-sans text-gray-800 relative select-text leading-relaxed"
        style={{ width: '210mm', minHeight: 'max-content', padding: '15mm 20mm',height: '100%', }}
      >
        {/* Encabezado */}
        <div className="border-b-2 border-gray-800 pb-4 mb-6">
          <input
            className="text-4xl font-extrabold w-full outline-none hover:bg-gray-50 focus:bg-purple-50/50 rounded px-1 transition-colors text-gray-900 tracking-tight"
            value={cvData.name}
            onChange={(e) => updateSection('name', null, e.target.value)}
            placeholder="Tu Nombre"
          />
          <input
            className="text-sm text-gray-600 font-medium w-full outline-none mt-2 hover:bg-gray-50 focus:bg-purple-50/50 rounded px-1"
            value={cvData.contact}
            onChange={(e) => updateSection('contact', null, e.target.value)}
            placeholder="Ciudad • Email • Teléfono"
          />
        </div>

        {/* Resumen */}
        {cvData.summary && (
          <div className="mb-6 group">
            <h3 className="text-sm font-bold tracking-widest uppercase mb-2 text-gray-900 border-b border-gray-200 pb-1">Perfil Profesional</h3>
            <AutoTextarea
              className="text-sm text-gray-700 font-sans"
              value={cvData.summary}
              onChange={(e) => updateSection('summary', null, e.target.value)}
            />
          </div>
        )}

        {/* Liderazgo y Actividades (Sección específica detectada en tu CV) */}
        {cvData.leadership && (
          <div className="mb-6 group">
            <h3 className="text-sm font-bold tracking-widest uppercase mb-2 text-gray-900 border-b border-gray-200 pb-1">Liderazgo y Actividades</h3>
            <AutoTextarea
              className="text-sm text-gray-700 font-sans"
              value={cvData.leadership}
              onChange={(e) => updateSection('leadership', null, e.target.value)}
            />
          </div>
        )}

        {/* Experiencia */}
        <div className="mb-6 group">
          <h3 className="text-sm font-bold tracking-widest uppercase mb-2 text-gray-900 border-b border-gray-200 pb-1">Experiencia</h3>
          <AutoTextarea
            className="text-sm text-gray-700 font-sans"
            value={cvData.experience}
            onChange={(e) => updateSection('experience', null, e.target.value)}
          />
        </div>

        {/* Educación */}
        <div className="mb-6 group">
          <h3 className="text-sm font-bold tracking-widest uppercase mb-2 text-gray-900 border-b border-gray-200 pb-1">Educación</h3>
          <AutoTextarea
            className="text-sm text-gray-700 font-sans"
            value={cvData.education}
            onChange={(e) => updateSection('education', null, e.target.value)}
          />
        </div>

        {/* Habilidades e Intereses */}
        <div className="mb-6 group">
          <h3 className="text-sm font-bold tracking-widest uppercase mb-2 text-gray-900 border-b border-gray-200 pb-1">Habilidades e Intereses</h3>
          <AutoTextarea
            className="text-sm text-gray-700 font-sans"
            value={cvData.skills}
            onChange={(e) => updateSection('skills', null, e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};