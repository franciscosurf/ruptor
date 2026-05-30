import React, { useRef } from 'react';

export const TxtFocusEditor = ({ value, onChange, disabled, focusText }) => {
  const backdropRef = useRef(null);

  // Sincroniza el scroll del textarea con la capa de fondo
  const handleScroll = (e) => {
    if (backdropRef.current) {
      backdropRef.current.scrollTop = e.target.scrollTop;
      backdropRef.current.scrollLeft = e.target.scrollLeft;
    }
  };

  const renderHighlights = () => {
    if (!focusText || !value) return value;

    // 1. Aceptamos tanto un string individual como un array de strings (logros múltiples)
    let textsToFocus = Array.isArray(focusText) ? focusText : [focusText];
    
    // Extraemos y limpiamos asegurando que todo sea texto
    textsToFocus = textsToFocus.map(t => {
      let text = typeof t === 'object' ? (t.text || t.keyword || '') : String(t);
      return text.trim();
    }).filter(Boolean);

    if (textsToFocus.length === 0) return value;

    // 2. Construimos un bloque Regex super-robusto para todas las frases
    const regexParts = textsToFocus.map(text => {
      // Escapamos caracteres especiales (como los dobles puntos ".." o los "%")
      let safeText = text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      // Convertimos los espacios en comodines para tolerar saltos de línea y dobles espacios
      return safeText.replace(/\s+/g, '\\s+');
    });
    
    // Unimos todas las frases con el operador OR (|) y creamos grupo capturador
    const splitRegex = new RegExp(`(${regexParts.join('|')})`, 'gi');
    
    // 3. Dividimos el texto real del CV usando el Regex
    const parts = value.split(splitRegex);

    // Creamos un Regex secundario solo para comprobar si un trozo es una coincidencia
    const matchRegex = new RegExp(`^(?:${regexParts.join('|')})$`, 'i');

    return parts.map((part, i) => {
      if (!part) return null;
      
      // Si este trozo exacto encaja con nuestra búsqueda, le ponemos la clase
      if (matchRegex.test(part)) {
        return (
          // Mantenemos text-transparent para que el texto de fondo no se pise con el del textarea
          <mark key={i} className="focus-highlight text-transparent rounded-sm">
            {part}
          </mark>
        );
      }
      // Si no es coincidencia, se renderiza transparente y normal
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <div className="relative flex-1 w-full bg-white overflow-hidden shadow-inner">
      
      {/* CAPA FANTASMA */}
      <div 
        ref={backdropRef}
        className="absolute inset-0 p-8 w-full h-full overflow-y-auto whitespace-pre-wrap break-words font-mono text-sm leading-relaxed text-transparent pointer-events-none"
        aria-hidden="true"
      >
        {renderHighlights()}
      </div>

      {/* TEXTAREA REAL */}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onScroll={handleScroll}
        disabled={disabled}
        spellCheck="false"
        placeholder="Escribe o edita el contenido de tu CV aquí..."
        className="absolute inset-0 w-full h-full p-8 overflow-y-auto whitespace-pre-wrap break-words resize-none font-mono text-sm text-gray-700 bg-transparent caret-gray-900 leading-relaxed focus:outline-none focus:ring-2 focus:ring-purple-400/50"
      />
    </div>
  );
};