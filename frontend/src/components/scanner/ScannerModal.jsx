// src/components/scanner/ScannerModal.jsx
import React, { useEffect, useState, useRef } from 'react';
import { CvTemplateEditor } from './CvTemplateEditor';
import { ResultsPanel } from './ResultsPanel';
import { JobForm } from '../forms/JobForm';
import { LoadingSpinner } from './../common/LoadingSpinner';
import { TxtFocusEditor } from './TxtFocusEditor';
import mammoth from 'mammoth';

// --- NUEVO: Subcomponente Editor Ligero para DOCX ---
// Sustituye el componente EditableDocx anterior por este:

const EditableDocx = ({ initialHtml, onUpdate, focusText }) => {
  const editorRef = useRef(null);
  // Guardamos el HTML "limpio" (sin las marcas de resaltado) para cuando el usuario guarde o descargue
  const cleanHtmlRef = useRef(initialHtml);

// --- NUEVO: Evita el pegado con formato (Filtro Anti-Estilos) ---
  const handlePaste = (e) => {
    // 1. Frenamos el pegado por defecto del navegador
    e.preventDefault();

    // 2. Extraemos explícitamente el contenido como TEXTO PLANO
    const text = (e.originalEvent || e).clipboardData.getData('text/plain');

    // 3. Insertamos el texto limpio de forma segura en la posición del cursor
    document.execCommand('insertText', false, text);

    // 4. Forzamos la actualización del estado del documento
    handleInput();
  };

  // --- LÓGICA DE RESALTADO EN HTML (Sin romper estilos ni etiquetas) ---
  const applyHighlightsToHtml = (html, focusData) => {
    if (!focusData || !html) return html;

    // 1. Extraemos y limpiamos asegurando que todo sea texto (Igual que en tu código)
    let textsToFocus = Array.isArray(focusData) ? focusData : [focusData];
    textsToFocus = textsToFocus.map(t => {
      let text = typeof t === 'object' ? (t.text || t.keyword || '') : String(t);
      return text.trim();
    }).filter(Boolean);

    if (textsToFocus.length === 0) return html;

    // 2. Construimos un bloque Regex tolerante a espacios y caracteres especiales
    const regexParts = textsToFocus.map(text => {
      let safeText = text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      return safeText.replace(/\s+/g, '\\s+');
    });
    
    const splitRegex = new RegExp(`(${regexParts.join('|')})`, 'gi');
    const matchRegex = new RegExp(`^(?:${regexParts.join('|')})$`, 'i');

    // 3. Creamos un DOM temporal para recorrer SOLO los nodos de texto (protegiendo el HTML)
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;

    const walker = document.createTreeWalker(tempDiv, NodeFilter.SHOW_TEXT, null, false);
    const textNodes = [];
    let node;
    while ((node = walker.nextNode())) {
      textNodes.push(node);
    }

    // 4. Envolvemos las coincidencias en etiquetas <mark>
    textNodes.forEach(textNode => {
      if (splitRegex.test(textNode.nodeValue)) {
        splitRegex.lastIndex = 0; 
        const fragments = textNode.nodeValue.split(splitRegex);
        const fragmentWrapper = document.createDocumentFragment();

        fragments.forEach(part => {
          if (!part) return;
          if (matchRegex.test(part)) {
            const mark = document.createElement('mark');
            // Usamos clases de Tailwind para darle el estilo visual al foco
            mark.className = 'focus-highlight bg-purple-200/70 text-purple-900 rounded-sm font-semibold transition-all';
            mark.textContent = part;
            fragmentWrapper.appendChild(mark);
          } else {
            fragmentWrapper.appendChild(document.createTextNode(part));
          }
        });
        
        textNode.parentNode.replaceChild(fragmentWrapper, textNode);
      }
    });

    return tempDiv.innerHTML;
  };

  // --- LÓGICA DE LIMPIEZA ---
  // Elimina las etiquetas <mark> antes de enviar el HTML al estado principal (para que no se guarden en la descarga)
  const removeHighlightsFromHtml = (html) => {
    if (!html.includes('focus-highlight')) return html;
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    const marks = tempDiv.querySelectorAll('mark.focus-highlight');
    marks.forEach(mark => {
      const textNode = document.createTextNode(mark.textContent);
      mark.parentNode.replaceChild(textNode, mark);
    });
    return tempDiv.innerHTML;
  };

  // 1. Carga Inicial
  useEffect(() => {
    if (editorRef.current && initialHtml && !editorRef.current.innerHTML) {
      cleanHtmlRef.current = initialHtml;
      editorRef.current.innerHTML = applyHighlightsToHtml(initialHtml, focusText);
    }
  }, [initialHtml]);

  // 2. Reaccionar cuando el usuario hace clic en el botón de la IA (focusText cambia)
  useEffect(() => {
    if (!editorRef.current) return;
    // Aplicamos los highlights sobre la versión LIMPIA más reciente (protege las ediciones del usuario)
    editorRef.current.innerHTML = applyHighlightsToHtml(cleanHtmlRef.current, focusText);
  }, [focusText]);

  // 3. Capturar lo que el usuario escribe
  const handleInput = () => {
    if (editorRef.current) {
      const currentHtml = editorRef.current.innerHTML;
      // Quitamos visualmente las marcas en background para guardar un documento limpio
      const cleanedHtml = removeHighlightsFromHtml(currentHtml);
      cleanHtmlRef.current = cleanedHtml;
      
      onUpdate({
        html: cleanedHtml,
        text: editorRef.current.innerText
      });
    }
  };

  const execCommand = (command) => {
    document.execCommand(command, false, null);
    editorRef.current.focus();
    handleInput(); 
  };

  return (
    <div className="flex flex-col h-full bg-white relative">
      {/* Barra de herramientas */}
      <div className="flex items-center gap-2 p-2 border-b border-gray-200 bg-gray-50 shrink-0 sticky top-0 z-10">
        <button onClick={() => execCommand('bold')} className="p-1.5 hover:bg-gray-200 rounded font-bold" title="Negrita">B</button>
        <button onClick={() => execCommand('italic')} className="p-1.5 hover:bg-gray-200 rounded italic" title="Cursiva">I</button>
        <button onClick={() => execCommand('underline')} className="p-1.5 hover:bg-gray-200 rounded underline" title="Subrayado">U</button>
        <div className="w-px h-4 bg-gray-300 mx-1"></div>
        <button onClick={() => execCommand('insertUnorderedList')} className="p-1.5 hover:bg-gray-200 rounded" title="Lista de viñetas">• Lista</button>
      </div>
      
      {/* Área de texto editable */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onPaste={handlePaste}
        spellCheck="false"
        className="prose max-w-none p-8 flex-1 overflow-y-auto outline-none focus:ring-inset focus:ring-2 focus:ring-purple-200 transition-all docx-preview leading-relaxed text-gray-800"
      />
    </div>
  );
};

export const ScannerModal = ({
  show, onClose, result, file, fileName, jobDescription, analysisMode,
  onFileChange, onJobDescriptionChange, onModeChange, onSubmit, loading,
  onReanalyze, cvData, isExtracting, updateSection, templateRef, onDownload
}) => {
  // Estados para TXT
  const [txtContent, setTxtContent] = useState('');
  // Estados para DOCX (HTML editable y texto plano)
  const [docxHtml, setDocxHtml] = useState('');
  const [docxPlainText, setDocxPlainText] = useState('');
  const [isExtractingDocx, setIsExtractingDocx] = useState(false);

  const [activeFocus, setActiveFocus] = useState(null);

  const isDocxFile = file && (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || file.name?.toLowerCase().endsWith('.docx'));
  const isTextFile = file && (file.type === 'text/plain' || file.name?.toLowerCase().endsWith('.txt'));

  let textToHighlight = null;
  if (activeFocus === 'achievements') {
    textToHighlight = result?.focus_achievements; 
  }

  // --- TXT: leer como texto plano ---
  useEffect(() => {
    if (isTextFile && show && file) {
      const reader = new FileReader();
      reader.onload = (e) => setTxtContent(e.target.result);
      reader.onerror = () => setTxtContent("Error al leer el archivo de texto plano.");
      reader.readAsText(file, 'UTF-8');
    }
  }, [file, isTextFile, show]);

  // --- DOCX: extraer HTML con mammoth ---
  useEffect(() => {
    if (isDocxFile && show && file) {
      setIsExtractingDocx(true);
      
      const reader = new FileReader();
      reader.onload = async (e) => {
        const arrayBuffer = e.target.result;
        try {
          // Extraemos HTML inicial; el texto plano lo manejará ahora nuestro componente editable
          const htmlResult = await mammoth.convertToHtml({ arrayBuffer });
          setDocxHtml(htmlResult.value);
          
          // Generamos un DOM temporal solo para sacar el texto inicial
          const tempDiv = document.createElement("div");
          tempDiv.innerHTML = htmlResult.value;
          setDocxPlainText(tempDiv.innerText);
        } catch (err) {
          console.error("Error al procesar DOCX:", err);
          setDocxHtml("<p>Error al procesar el documento. Intenta con otro archivo.</p>");
          setDocxPlainText("");
        } finally {
          setIsExtractingDocx(false);
        }
      };
      reader.onerror = () => {
        setDocxHtml("<p>No se pudo leer el archivo.</p>");
        setIsExtractingDocx(false);
      };
      reader.readAsArrayBuffer(file);
    }
  }, [file, isDocxFile, show]);

  // Efecto para el scroll global
  useEffect(() => {
    if (!show) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = originalOverflow; };
  }, [show]);

  if (!show) return null;

  // --- MANEJADORES ---
  const handleDownloadClick = () => {
    if (isDocxFile) {
      // TRUCO AVANZADO: Envolvemos el HTML editado en etiquetas de Office para que Word lo lea nativamente como documento.
      const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>CV Optimizado</title></head><body>";
      const footer = "</body></html>";
      const sourceHTML = header + docxHtml + footer;
      
      // Especificamos el MIME type de MS Word
      const blob = new Blob(['\ufeff', sourceHTML], { type: 'application/msword' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      // Guardamos como .doc (más estable para esta conversión desde el frontend)
      link.download = fileName ? fileName.replace('.docx', '_optimizado.doc') : 'cv_optimizado.doc';
      link.click();
      URL.revokeObjectURL(url);
    } else if (isTextFile) {
      const blob = new Blob([txtContent], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName ? fileName.replace('.pdf', '.txt') : 'cv_optimizado.txt';
      link.click();
      URL.revokeObjectURL(url);
    } else if (onDownload) {
      onDownload();
    }
  };

  const handleReanalyzeClick = () => {
    if (onReanalyze) {
      if (isTextFile) {
        onReanalyze(txtContent);
      } else if (isDocxFile && docxPlainText) {
        // La IA recibe el texto limpio con las nuevas ediciones del usuario
        onReanalyze(docxPlainText);
      } else if (cvData) {
        onReanalyze(cvData);
      } else {
        onReanalyze(file);
      }
    }
  };

  // --- RENDERIZADO DE VISTA PREVIA SEGÚN TIPO DE ARCHIVO ---
  const renderPreview = () => {
    if (isTextFile) {
      return (
        <TxtFocusEditor
          value={txtContent}
          onChange={setTxtContent}
          disabled={loading}
          focusText={textToHighlight}
        />
      );
    }

    if (isDocxFile) {
      if (isExtractingDocx) {
        return (
          <div className="flex-1 flex items-center justify-center text-gray-500 font-medium">
            📄 Procesando documento Word...
          </div>
        );
      }
      return (
        <div className="flex-1 flex flex-col h-full bg-white">
          <EditableDocx 
            initialHtml={docxHtml} 
            focusText={textToHighlight} // <--- AÑADIMOS EL PROP AQUÍ
            onUpdate={({ html, text }) => {
              setDocxHtml(html);
              setDocxPlainText(text);
            }} 
          />
        </div>
      );
    }

    if (cvData) {
      return (
        <CvTemplateEditor
          cvData={cvData}
          updateSection={updateSection}
          templateRef={templateRef}
          activeFocus={activeFocus}
          focusAchievements={result?.focus_achievements || []}
        />
      );
    }

    if (isExtracting) {
      return (
        <div className="flex-1 flex items-center justify-center text-gray-500 font-medium">
          🔄 Transcribiendo estructura del documento original...
        </div>
      );
    }

    return (
      <div className="flex-1 p-8 overflow-y-auto flex items-center justify-center bg-gray-100">
        <div className="w-full max-w-lg bg-white rounded-2xl shadow-md border border-gray-200 p-8 text-center">
          <div className="text-4xl mb-3">📂</div>
          <h3 className="text-md font-bold text-gray-700 mb-1">{fileName}</h3>
          <p className="text-xs text-gray-400">Procesando el documento en el servidor para renderizar el contenido...</p>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex bg-black bg-opacity-80 backdrop-filter backdrop-blur-sm animate-fadeIn">
      
      {/* Estilos dinámicos para proteger la apariencia del DOCX editado */}
      <style>{`
        .docx-preview h1 { font-size: 1.2rem; font-weight: bold; margin: 1rem 0; }
        .docx-preview h2 { font-size: 1rem; font-weight: bold; margin: 0.75rem 0; }
        .docx-preview p { margin: 0.5rem 0; line-height: 1.5; }
        .docx-preview ul { margin: 0.5rem 0 0.5rem 1.5rem; list-style-type: disc; }
        .docx-preview ol { margin: 0.5rem 0 0.5rem 1.5rem; list-style-type: decimal; }
        .docx-preview li { margin: 0.25rem 0; }
      `}</style>
      
      <div className="bg-white w-screen h-screen flex flex-col overflow-hidden">
        {/* CABECERA */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🧠</span>
            <div>
              <h2 className="text-lg font-bold text-gray-800">Optimización de CV con IA</h2>
              <p className="text-sm text-gray-400">Ajusta tu perfil en tiempo real según la oferta de empleo</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {result && (
              <>
                <button
                  onClick={handleReanalyzeClick}
                  disabled={loading || isExtracting || isExtractingDocx}
                  className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 transition-all disabled:opacity-50"
                >
                  {loading ? '⏳ Analizando...' : '🔄 Reanalizar CV'}
                </button>
                <button
                  onClick={handleDownloadClick}
                  disabled={isExtracting || isExtractingDocx}
                  className="bg-purple-600 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50"
                >
                  {isTextFile ? '📥 Descargar TXT' : isDocxFile ? '📥 Descargar DOC' : '📥 Descargar PDF'}
                </button>
              </>
            )}
            <button onClick={onClose} className="py-2 px-3 text-gray-400 hover:text-gray-600 border border-gray-300 rounded-md">✕</button>
          </div>
        </div>

        {/* CUERPO PRINCIPAL */}
        {result ? (
          <div className={`flex flex-1 overflow-hidden bg-gray-100 ${activeFocus ? 'focus-mode-active' : ''}`}>
            {/* LADO IZQUIERDO: Vista previa del CV */}
            <div className="w-1/2 flex flex-col min-h-0 border-r border-gray-200">
              {renderPreview()}
            </div>

            {/* LADO DERECHO: Resultados ATS */}
            <div className="w-1/2 flex flex-col min-h-0 bg-white">
              {loading ? (
                <div className="flex-1 flex flex-col items-center justify-center bg-gray-50/50">
                  <LoadingSpinner />
                  <p className="mt-4 text-sm text-gray-500 font-medium animate-pulse">Recalculando métricas ATS...</p>
                </div>
              ) : (
                <ResultsPanel
                  result={result}
                  activeFocus={activeFocus}
                  onToggleFocus={(focusType) => setActiveFocus(activeFocus === focusType ? null : focusType)}
                />
              )}
            </div>
          </div>
        ) : (
          /* FORMULARIO INICIAL */
          <div className="flex-1 overflow-y-auto p-8 bg-gray-50 flex items-center justify-center">
            {loading ? (
              <div className="w-full max-w-2xl bg-white p-16 rounded-2xl shadow-sm border border-gray-200 flex flex-col items-center justify-center">
                <LoadingSpinner />
                <p className="mt-6 text-gray-600 font-medium animate-pulse">La IA está analizando tu perfil contra la oferta...</p>
              </div>
            ) : (
              <div className="w-full max-w-2xl bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
                <JobForm
                  fileName={fileName}
                  jobDescription={jobDescription}
                  analysisMode={analysisMode}
                  onFileChange={onFileChange}
                  onJobDescriptionChange={onJobDescriptionChange}
                  onModeChange={onModeChange}
                  onSubmit={onSubmit}
                  loading={loading}
                  resultExists={!!result}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};