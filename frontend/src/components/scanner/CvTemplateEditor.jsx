// src/components/scanner/strategy/CvTemplateEditor.jsx
import React, { useEffect, useRef } from 'react';
import './FocusMode.css';

// Componente inteligente que auto-ajusta su altura
const AutoTextarea = ({ value, onChange, placeholder, className, activeFocus, renderHighlightedText }) => {
  const textareaRef = useRef(null);

  useEffect(() => {
    // Solo recalculamos la altura si es un textarea (cuando NO hay focus)
    if (textareaRef.current && !activeFocus) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [value, activeFocus]);

  // MODO FOCUS: Renderiza un DIV que acepta etiquetas HTML (spans)
  if (activeFocus) {
    return (
      <div
        // CLONAMOS las clases exactas de tu textarea original para evitar saltos visuales
        className={`w-full outline-none overflow-hidden bg-transparent rounded p-1 transition-colors ${className}`}
        style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}
      >
        {renderHighlightedText ? renderHighlightedText(value) : value}
      </div>
    );
  }

  // MODO NORMAL: Tu textarea original, intacto.
  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      spellCheck="false"
      // Tus clases originales exactas
      className={`w-full outline-none resize-none overflow-hidden bg-transparent focus:bg-purple-50/30 transition-colors rounded p-1 ${className}`}
      style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}
    />
  );
};

export const CvTemplateEditor = ({ cvData, updateSection, templateRef, activeFocus, focusAchievements }) => {
  if (!cvData) return null;

  // Función segura para resaltar texto en React sin usar dangerouslySetInnerHTML
  const renderHighlightedText = (text) => {
    if (!text || activeFocus !== 'achievements' || !focusAchievements || focusAchievements.length === 0) {
      return text;
    }

    let result = [text];

    focusAchievements.forEach((achievement) => {
      if (!achievement.trim()) return; 

      // Usamos split para buscar el texto exacto (seguro contra caracteres especiales como $ o %)
      result = result.flatMap((part) => {
        if (typeof part !== 'string') return part;

        const parts = part.split(achievement);
        const mappedParts = [];

        parts.forEach((p, index) => {
          mappedParts.push(p);
          if (index < parts.length - 1) {
            mappedParts.push(
              <span key={`${achievement}-${index}`} className="focus-highlight">
                {achievement}
              </span>
            );
          }
        });
        return mappedParts;
      });
    });

    return result;
  };

  return (
    // Agregamos la clase focus-mode-active de forma dinámica al contenedor principal
    <div className={`flex-1 flex flex-col relative bg-gray-200/50 overflow-y-auto items-center p-8 ${activeFocus ? 'focus-mode-active' : ''}`}>
      
      {/* Lienzo A4 (Tus estilos inline originales están intactos) */}
      <div 
        ref={templateRef}
        className="bg-white shadow-2xl font-sans text-gray-800 relative select-text leading-relaxed cv-canvas"
        style={{ width: '210mm', maxWidth: '100%', minHeight: 'max-content', padding: '15mm 20mm', height: '100%' }}
      >
        {/* Encabezado */}
        <div className="border-b-2 border-gray-800 pb-4 mb-6">
          <input
            className="text-4xl font-extrabold w-full outline-none hover:bg-gray-50 focus:bg-purple-50/50 rounded px-1 transition-colors text-gray-900 tracking-tight input-title"
            value={cvData.name}
            onChange={(e) => updateSection('name', null, e.target.value)}
            placeholder="Tu Nombre"
          />
          <input
            className="text-sm text-gray-600 font-medium w-full outline-none mt-2 hover:bg-gray-50 focus:bg-purple-50/50 rounded px-1 input-subtitle"
            value={cvData.contact}
            onChange={(e) => updateSection('contact', null, e.target.value)}
            placeholder="Ciudad • Email • Teléfono"
          />
        </div>

        {/* Resumen (Condicional original respetado) */}
        {cvData.summary && (
          <div className="mb-6 group">
            <h3 className="text-sm font-bold tracking-widest uppercase mb-2 text-gray-900 border-b border-gray-200 pb-1 section-title">Perfil Profesional</h3>
            <AutoTextarea
              className="text-sm text-gray-700 font-sans"
              value={cvData.summary}
              onChange={(e) => updateSection('summary', null, e.target.value)}
              activeFocus={activeFocus}
              renderHighlightedText={renderHighlightedText}
            />
          </div>
        )}

        {/* Liderazgo y Actividades (Condicional original respetado) */}
        {cvData.leadership && (
          <div className="mb-6 group">
            <h3 className="text-sm font-bold tracking-widest uppercase mb-2 text-gray-900 border-b border-gray-200 pb-1 section-title">Liderazgo y Actividades</h3>
            <AutoTextarea
              className="text-sm text-gray-700 font-sans"
              value={cvData.leadership}
              onChange={(e) => updateSection('leadership', null, e.target.value)}
              activeFocus={activeFocus}
              renderHighlightedText={renderHighlightedText}
            />
          </div>
        )}

        {/* Experiencia (Incondicional en tu código original) */}
        <div className="mb-6 group">
          <h3 className="text-sm font-bold tracking-widest uppercase mb-2 text-gray-900 border-b border-gray-200 pb-1 section-title">Experiencia</h3>
          <AutoTextarea
            className="text-sm text-gray-700 font-sans"
            value={cvData.experience}
            onChange={(e) => updateSection('experience', null, e.target.value)}
            activeFocus={activeFocus}
            renderHighlightedText={renderHighlightedText}
          />
        </div>

        {/* Educación */}
        <div className="mb-6 group">
          <h3 className="text-sm font-bold tracking-widest uppercase mb-2 text-gray-900 border-b border-gray-200 pb-1 section-title">Educación</h3>
          <AutoTextarea
            className="text-sm text-gray-700 font-sans"
            value={cvData.education}
            onChange={(e) => updateSection('education', null, e.target.value)}
            activeFocus={activeFocus}
            renderHighlightedText={renderHighlightedText}
          />
        </div>

        {/* Habilidades e Intereses */}
        <div className="mb-6 group">
          <h3 className="text-sm font-bold tracking-widest uppercase mb-2 text-gray-900 border-b border-gray-200 pb-1 section-title">Habilidades e Intereses</h3>
          <AutoTextarea
            className="text-sm text-gray-700 font-sans"
            value={cvData.skills}
            onChange={(e) => updateSection('skills', null, e.target.value)}
            activeFocus={activeFocus}
            renderHighlightedText={renderHighlightedText}
          />
        </div>
      </div>
    </div>
  );
};