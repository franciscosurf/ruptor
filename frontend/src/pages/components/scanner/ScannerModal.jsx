// src/components/scanner/ScannerModal.jsx
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { API_BASE_URL, ENDPOINTS } from '../../../constants/endpoints';
import { CvTemplateEditor } from '../../../components/scanner/CvTemplateEditor';
import { TxtFocusEditor } from '../../../components/scanner/TxtFocusEditor';
import { ResultsPanel } from '../../../components/scanner/ResultsPanel';
import { JobForm } from '../../../components/forms/JobForm';
import { LoadingSpinner } from '../../../components/common/LoadingSpinner';
import mammoth from 'mammoth';
import { useTemplateExport } from '../../../components/scanner/strategy/useTemplateExport';

// Subcomponente Editor Ligero para DOCX ---
const EditableDocx = ({ initialHtml, onUpdate, focusText }) => {
  const editorRef = useRef(null);
  const cleanHtmlRef = useRef(initialHtml);

  const handlePaste = (e) => {
    e.preventDefault();
    const text = (e.originalEvent || e).clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
    handleInput();
  };

  const applyHighlightsToHtml = (html, focusData) => {
    if (!focusData || !html) return html;
    let textsToFocus = Array.isArray(focusData) ? focusData : [focusData];
    textsToFocus = textsToFocus.map(t => {
      let text = typeof t === 'object' ? (t.text || t.keyword || '') : String(t);
      return text.trim();
    }).filter(Boolean);
    if (textsToFocus.length === 0) return html;

    const regexParts = textsToFocus.map(text => {
      let safeText = text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      return safeText.replace(/\s+/g, '\\s+');
    });
    const splitRegex = new RegExp(`(${regexParts.join('|')})`, 'gi');
    const matchRegex = new RegExp(`^(?:${regexParts.join('|')})$`, 'i');

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    const walker = document.createTreeWalker(tempDiv, NodeFilter.SHOW_TEXT, null, false);
    const textNodes = [];
    let node;
    while ((node = walker.nextNode())) textNodes.push(node);

    textNodes.forEach(textNode => {
      if (splitRegex.test(textNode.nodeValue)) {
        splitRegex.lastIndex = 0;
        const fragments = textNode.nodeValue.split(splitRegex);
        const fragmentWrapper = document.createDocumentFragment();
        fragments.forEach(part => {
          if (!part) return;
          if (matchRegex.test(part)) {
            const mark = document.createElement('mark');
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

  useEffect(() => {
    if (editorRef.current && initialHtml && !editorRef.current.innerHTML) {
      cleanHtmlRef.current = initialHtml;
      editorRef.current.innerHTML = applyHighlightsToHtml(initialHtml, focusText);
    }
  }, [initialHtml]);

  useEffect(() => {
    if (!editorRef.current) return;
    editorRef.current.innerHTML = applyHighlightsToHtml(cleanHtmlRef.current, focusText);
  }, [focusText]);

  const handleInput = () => {
    if (editorRef.current) {
      const currentHtml = editorRef.current.innerHTML;
      const cleanedHtml = removeHighlightsFromHtml(currentHtml);
      cleanHtmlRef.current = cleanedHtml;
      onUpdate({ html: cleanedHtml, text: editorRef.current.innerText });
    }
  };

  const execCommand = (command) => {
    document.execCommand(command, false, null);
    editorRef.current.focus();
    handleInput();
  };

  return (
    <div className="flex flex-col h-full relative editable-docx" style={{ background: 'var(--bgPrimary)' }}>
      <div className="flex items-center gap-2 p-2 border-b shrink-0 sticky top-0 z-10" style={{ borderBottomColor: 'var(--borderColor)', background: 'var(--bgSurface)' }}>
        <button onClick={() => execCommand('bold')} className="p-1.5 hover:bg-gray-200 rounded font-bold" style={{ color: 'var(--textPrimary)' }}>B</button>
        <button onClick={() => execCommand('italic')} className="p-1.5 hover:bg-gray-200 rounded italic" style={{ color: 'var(--textPrimary)' }}>I</button>
        <button onClick={() => execCommand('underline')} className="p-1.5 hover:bg-gray-200 rounded underline" style={{ color: 'var(--textPrimary)' }}>U</button>
        <div className="w-px h-4 bg-gray-300 mx-1" style={{ background: 'var(--borderColor)' }}></div>
        <button onClick={() => execCommand('insertUnorderedList')} className="p-1.5 hover:bg-gray-200 rounded" style={{ color: 'var(--textPrimary)' }}>• Lista</button>
      </div>
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onPaste={handlePaste}
        spellCheck="false"
        className="prose max-w-none p-8 flex-1 overflow-y-auto outline-none focus:ring-inset focus:ring-2 focus:ring-purple-200 transition-all docx-preview leading-relaxed"
        style={{ color: 'var(--textPrimary)' }}
      />
    </div>
  );
};

export const ScannerModal = ({
  show, onClose, result, file, fileName, jobDescription, analysisMode,
  onFileChange, onJobDescriptionChange, onModeChange, onSubmit, loading,
  onReanalyze, cvData, isExtracting, updateSection, templateRef, onDownload
}) => {
  const { exportToPdf, isExporting } = useTemplateExport();
  const [reportDownloading, setReportDownloading] = useState(false);

  const handleDownloadPdf = async () => {
    const success = await exportToPdf(cvData, fileName);
    if (success) console.log('PDF generado correctamente');
  };

  const handleDownloadReport = async () => {
    if (!result) return;
    setReportDownloading(true);
    try {
      const response = await fetch(`${API_BASE_URL}${ENDPOINTS.DOWNLOAD_PDF_REPORT}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: result })
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Error al generar el informe');
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      let baseName = fileName ? fileName.replace(/\.[^/.]+$/, '') : 'informe';
      baseName = baseName.replace(/[^a-zA-Z0-9áéíóúüñÁÉÍÓÚÜÑ]/g, '_');
      const now = new Date();
      const dateStr = now.toISOString().slice(0,19).replace(/[-:]/g, '').replace('T', '_');
      a.download = `informe_ATS_${baseName}_${dateStr}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error descargando el informe:', error);
      alert('No se pudo generar el informe. Inténtalo de nuevo.');
    } finally {
      setReportDownloading(false);
    }
  };

  const [txtContent, setTxtContent] = useState('');
  const [docxHtml, setDocxHtml] = useState('');
  const [docxPlainText, setDocxPlainText] = useState('');
  const [isExtractingDocx, setIsExtractingDocx] = useState(false);
  const [activeFocus, setActiveFocus] = useState(null);
  const [selectedSentence, setSelectedSentence] = useState(null);

  const isDocxFile = file && (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || file.name?.toLowerCase().endsWith('.docx'));
  const isTextFile = file && (file.type === 'text/plain' || file.name?.toLowerCase().endsWith('.txt'));

  // Debounce automático
  const lastReanalyzedTextRef = useRef(null);
  const getCurrentCVText = useCallback(() => {
    if (isTextFile) return txtContent;
    if (isDocxFile) return docxPlainText;
    if (cvData) return typeof cvData === 'object' ? Object.values(cvData).join('\n') : cvData;
    return null;
  }, [isTextFile, txtContent, isDocxFile, docxPlainText, cvData]);

  useEffect(() => {
    if (show && result && !lastReanalyzedTextRef.current) {
      lastReanalyzedTextRef.current = getCurrentCVText();
    }
    if (!show) lastReanalyzedTextRef.current = null;
  }, [show, result, getCurrentCVText]);

  useEffect(() => {
    if (!show || !result || loading) return;
    const currentText = getCurrentCVText();
    if (!currentText || currentText === lastReanalyzedTextRef.current) return;
    const timer = setTimeout(() => {
      lastReanalyzedTextRef.current = currentText;
      if (onReanalyze) {
        if (isTextFile) onReanalyze(txtContent);
        else if (isDocxFile && docxPlainText) onReanalyze(docxPlainText);
        else if (cvData) onReanalyze(cvData);
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [show, result, loading, txtContent, docxPlainText, cvData, getCurrentCVText, isTextFile, isDocxFile, onReanalyze]);

  let textToHighlight = null;
  if (activeFocus === 'achievements') {
    let rawSentences = result?.quantified_achievements_metrics?.sentences || [];
    textToHighlight = rawSentences.map(s => typeof s === 'string' ? s : (s.text || s.keyword || '')).filter(Boolean);
  }

  useEffect(() => {
    if (isTextFile && show && file) {
      const reader = new FileReader();
      reader.onload = (e) => setTxtContent(e.target.result);
      reader.onerror = () => setTxtContent("Error al leer el archivo de texto plano.");
      reader.readAsText(file, 'UTF-8');
    }
  }, [file, isTextFile, show]);

  useEffect(() => {
    if (isDocxFile && show && file) {
      setIsExtractingDocx(true);
      const reader = new FileReader();
      reader.onload = async (e) => {
        const arrayBuffer = e.target.result;
        try {
          const htmlResult = await mammoth.convertToHtml({ arrayBuffer });
          setDocxHtml(htmlResult.value);
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

  useEffect(() => {
    if (!show) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = originalOverflow; };
  }, [show]);

  if (!show) return null;

  const handleDownloadClick = () => {
    if (isDocxFile) {
      const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>CV Optimizado</title></head><body>";
      const footer = "</body></html>";
      const sourceHTML = header + docxHtml + footer;
      const blob = new Blob(['\ufeff', sourceHTML], { type: 'application/msword' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
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
      if (isTextFile) onReanalyze(txtContent);
      else if (isDocxFile && docxPlainText) onReanalyze(docxPlainText);
      else if (cvData) onReanalyze(cvData);
      else onReanalyze(file);
    }
  };

  const renderPreview = () => {
    if (isTextFile) {
      return (
        <TxtFocusEditor
          value={txtContent}
          onChange={setTxtContent}
          disabled={loading}
          focusText={textToHighlight}
          selectedSentence={selectedSentence}
        />
      );
    }
    if (isDocxFile) {
      if (isExtractingDocx) return <div className="flex-1 flex items-center justify-center font-medium" style={{ color: 'var(--textSecondary)' }}>📄 Procesando documento Word...</div>;
      return (
        <div className="flex-1 flex flex-col h-full">
          <EditableDocx
            initialHtml={docxHtml}
            focusText={textToHighlight}
            onUpdate={({ html, text }) => { setDocxHtml(html); setDocxPlainText(text); }}
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
          focusAchievements={textToHighlight}
          selectedSentence={selectedSentence}
        />
      );
    }
    if (isExtracting) return <div className="flex-1 flex items-center justify-center font-medium" style={{ color: 'var(--textSecondary)' }}>🔄 Transcribiendo estructura del documento original...</div>;
    return (
      <div className="flex-1 p-8 overflow-y-auto flex items-center justify-center bg-gray-100" style={{ background: 'var(--bgSurface)' }}>
        <div className="w-full max-w-lg rounded-2xl shadow-md p-8 text-center" style={{ background: 'var(--cardBg)', border: `1px solid var(--borderColor)` }}>
          <div className="text-4xl mb-3">📂</div>
          <h3 className="text-md font-bold mb-1" style={{ color: 'var(--textPrimary)' }}>{fileName}</h3>
          <p className="text-xs" style={{ color: 'var(--textTertiary)' }}>Procesando el documento en el servidor para renderizar el contenido...</p>
        </div>
      </div>
    );
  };

  const handleSelectSentence = (sentence) => {
    setSelectedSentence(sentence);
    setTimeout(() => {
      const highlightedElement = document.querySelector('.focus-highlight-single');
      if (highlightedElement) highlightedElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 60);
  };

  return (
    <div className="fixed inset-0 z-50 flex bg-black bg-opacity-80 backdrop-filter backdrop-blur-sm animate-fadeIn">
      <style>{`
        .docx-preview h1 { font-size: 1.2rem; font-weight: bold; margin: 1rem 0; }
        .docx-preview h2 { font-size: 1rem; font-weight: bold; margin: 0.75rem 0; }
        .docx-preview p { margin: 0.5rem 0; line-height: 1.5; }
        .docx-preview ul { margin: 0.5rem 0 0.5rem 1.5rem; list-style-type: disc; }
        .docx-preview ol { margin: 0.5rem 0 0.5rem 1.5rem; list-style-type: decimal; }
        .docx-preview li { margin: 0.25rem 0; }
      `}</style>

      <div className="w-screen h-screen flex flex-col overflow-hidden" style={{ background: 'var(--bgPrimary)' }}>
        {/* CABECERA */}
        <div className="flex items-center justify-between px-6 py-4 border-b shrink-0" style={{ borderBottomColor: 'var(--borderColor)', background: 'var(--bgSurface)' }}>
          <div className="flex items-center gap-3">
            <span className="text-2xl">🧠</span>
            <div>
              <h2 className="text-lg font-bold" style={{ color: 'var(--textPrimary)' }}>Optimización de CV con IA</h2>
              <p className="text-sm" style={{ color: 'var(--textTertiary)' }}>Ajusta tu perfil en tiempo real según la oferta de empleo</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {result && (
              <>
                <button
                  onClick={handleReanalyzeClick}
                  disabled={loading || isExtracting || isExtractingDocx}
                  className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all disabled:opacity-50"
                  style={{ background: 'var(--bgSurface)', color: 'var(--textPrimary)', borderColor: 'var(--borderColor)' }}
                >
                  {loading ? '⏳ Analizando...' : '🔄 Reanalizar CV'}
                </button>
                <button
                  onClick={handleDownloadReport}
                  disabled={loading || isExtracting || isExtractingDocx || reportDownloading}
                  className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all disabled:opacity-50"
                  style={{ background: 'var(--bgSurface)', color: 'var(--textPrimary)', borderColor: 'var(--borderColor)' }}
                >
                  {reportDownloading ? '⏳ Generando...' : '📄 Descargar Informe'}
                </button>
                <button
                  onClick={() => {
                    if (isTextFile || isDocxFile) handleDownloadClick();
                    else handleDownloadPdf();
                  }}
                  disabled={isExtracting || isExtractingDocx || isExporting}
                  className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 text-white"
                  style={{ background: 'linear-gradient(90deg, var(--gradientFrom), var(--gradientTo))' }}
                >
                  {isExporting
                    ? '⏳ Generando PDF...'
                    : isTextFile ? '📥 Descargar TXT'
                    : isDocxFile ? '📥 Descargar DOC'
                    : '📥 Descargar PDF'}
                </button>
              </>
            )}
            <button onClick={onClose} className="py-2 px-3 rounded-md" style={{ color: 'var(--textTertiary)', border: `1px solid var(--borderColor)`, background: 'var(--bgSurface)' }}>✕</button>
          </div>
        </div>

        {result ? (
          <div className={`flex flex-1 overflow-hidden ${activeFocus ? 'focus-mode-active' : ''}`} style={{ background: 'var(--bgSurface)' }}>
            <div className="w-1/2 flex flex-col min-h-0 border-r" style={{ borderRightColor: 'var(--borderColor)' }}>
              {renderPreview()}
            </div>
            <div className="w-1/2 flex flex-col min-h-0" style={{ background: 'var(--bgPrimary)' }}>
              {loading ? (
                <div className="flex-1 flex flex-col items-center justify-center" style={{ background: 'var(--bgSurface)' }}>
                  <LoadingSpinner />
                  <p className="mt-4 text-sm font-medium animate-pulse" style={{ color: 'var(--textSecondary)' }}>Recalculando métricas ATS...</p>
                </div>
              ) : (
                <ResultsPanel
                  result={result}
                  activeFocus={activeFocus}
                  onToggleFocus={(focusType) => {
                    setActiveFocus(activeFocus === focusType ? null : focusType);
                    setSelectedSentence(null);
                  }}
                  onSelectSentence={handleSelectSentence}
                />
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-8 flex items-center justify-center" style={{ background: 'var(--bgSurface)' }}>
            {loading ? (
              <div className="w-full max-w-2xl p-16 rounded-2xl shadow-sm flex flex-col items-center justify-center" style={{ background: 'var(--cardBg)', border: `1px solid var(--borderColor)` }}>
                <LoadingSpinner />
                <p className="mt-6 font-medium animate-pulse" style={{ color: 'var(--textSecondary)' }}>La IA está analizando tu perfil contra la oferta...</p>
              </div>
            ) : (
              <div className="w-full max-w-2xl p-8 rounded-2xl shadow-sm" style={{ background: 'var(--cardBg)', border: `1px solid var(--borderColor)` }}>
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