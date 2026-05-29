// src/components/scanner/ScannerModal.jsx
import React, { useEffect, useRef, useState } from 'react';
import { CvTemplateEditor } from './strategy/CvTemplateEditor';
import { ResultsPanel } from './ResultsPanel';
import { JobForm } from '../forms/JobForm';
import { useCvData } from './strategy/useCvData';
import { useTemplateExport } from './strategy/useTemplateExport';

export const ScannerModal = ({
  show, onClose, result, file, fileName, jobDescription, analysisMode,
  onFileChange, onJobDescriptionChange, onModeChange, onSubmit, loading,
  onReanalyze,
}) => {
  const templateRef = useRef(null);
  const { cvData, loadPdf, isExtracting, updateSection } = useCvData();
  const { exportToPdf } = useTemplateExport();

  // 1. ESTADO PARA GUARDAR Y EDITAR EL TEXTO DEL ARCHIVO .TXT
  const [txtContent, setTxtContent] = useState('');

  // Control robusto para saber si es un archivo de texto plano
  const isTextFile = file && (file.type === 'text/plain' || file.name?.toLowerCase().endsWith('.txt'));

  // 2. EFECTO PARA LEER EL .TXT SI EL USUARIO SUBE UNO
  useEffect(() => {
    if (isTextFile && show) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setTxtContent(e.target.result);
      };
      reader.onerror = () => {
        setTxtContent("Error al leer el archivo de texto plano.");
      };
      reader.readAsText(file, 'UTF-8'); // Forzamos UTF-8 para tildes y caracteres especiales
    }
  }, [file, isTextFile, show]);

  // 3. SOLO EXTRAER PDF SI NO ES UN ARCHIVO DE TEXTO
  useEffect(() => {
    if (file && show && !isTextFile) {
      loadPdf(file);
    }
  }, [file, show, loadPdf, isTextFile]);

  useEffect(() => {
    if (!show) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden'; // Solo bloquea el scroll
    return () => { document.body.style.overflow = originalOverflow; };
  }, [show]);

  if (!show) return null;

  // 4. CONTROLAR EL REANÁLISIS SEGÚN EL TIPO DE ARCHIVO
  const handleReanalyzeClick = () => {
    if (onReanalyze) {
      if (isTextFile) {
        onReanalyze(txtContent); // Mandamos el texto modificado en el textarea
      } else if (cvData) {
        onReanalyze(cvData);     // Mandamos el objeto estructurado del PDF
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 backdrop-filter backdrop-blur-sm">
      <div className="bg-white w-full h-[92vh] max-w-7xl max-h-[80rem] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-100">
        
        {/* CABECERA DEL MODAL */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🧠</span>
            <div>
              <h2 className="text-lg font-bold text-gray-800">Optimización de CV con IA</h2>
              <p className="text-xs text-gray-400">Ajusta tu perfil en tiempo real según la oferta de empleo</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {result && (
              <>
              <button
                onClick={handleReanalyzeClick}
                disabled={loading || isExtracting}
                className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 transition-all disabled:opacity-50"
              >
                {loading ? '⏳ Analizando...' : '🔄 Reanalizar CV'}
              </button>
              <button
                onClick={() => exportToPdf(templateRef, fileName)}
                disabled={isExtracting || isTextFile} // Deshabilitamos exportación visual si es TXT puro
                className="px-4 py-2 bg-purple-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50"
              >
                📥 Descargar PDF
              </button>
              </>
            )}
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600">✕</button>
          </div>
        </div>

        {/* CUERPO CENTRAL DEL MODAL */}
        {result ? (
          <div className="flex flex-1 overflow-hidden bg-gray-100">
            
            {/* Contenedor Izquierda (Editor HTML o Textarea editable del archivo .txt) */}
            <div className="w-1/2 flex flex-col min-h-0 bg-gray-200/50">
              {isTextFile ? (
                // 5. SOLUCIÓN: TEXTAREA CONTROLADO Y TOTALMENTE EDITABLE
                <textarea
                  value={txtContent}
                  onChange={(e) => setTxtContent(e.target.value)}
                  className="flex-1 p-8 bg-white overflow-y-auto text-sm font-mono text-gray-700 resize-none focus:outline-none focus:ring-2 focus:ring-purple-400/50 shadow-inner leading-relaxed"
                  placeholder="Escribe o edita el contenido de tu CV aquí..."
                />
              ) : isExtracting ? (
                <div className="flex-1 flex items-center justify-center text-gray-500 font-medium">
                  🔄 Transcribiendo estructura del PDF original...
                </div>
              ) : (
                <CvTemplateEditor cvData={cvData} updateSection={updateSection} templateRef={templateRef} />
              )}
            </div>

            {/* Contenedor Feedback IA (Derecha) */}
            <div className="w-1/2 flex flex-col min-h-0 bg-white">
              <ResultsPanel result={result} />
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-8 bg-gray-50 flex items-center justify-center">
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
          </div>
        )}
      </div>
    </div>
  );
};