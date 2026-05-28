// src/components/scanner/ScannerModal.jsx
import React, { useEffect, useRef } from 'react';
import { CvTemplateEditor } from './strategy/CvTemplateEditor';
import { ResultsPanel } from './ResultsPanel';
import { JobForm } from '../forms/JobForm';
import { useCvData } from './strategy/useCvData';
import { useTemplateExport } from './strategy/useTemplateExport';

export const ScannerModal = ({
  show, onClose, result, file, fileName, jobDescription, analysisMode,
  onFileChange, onJobDescriptionChange, onModeChange, onSubmit, loading,
}) => {
  const templateRef = useRef(null);
  const { cvData, loadPdf, isExtracting, updateSection } = useCvData();
  const { exportToPdf } = useTemplateExport();

  useEffect(() => {
    if (file && show) {
      loadPdf(file);
    }
  }, [file, show, loadPdf]);

  useEffect(() => {
    if (!show) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = originalOverflow; };
  }, [show]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 bg-gray-900/90 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="h-screen bg-white w-full max-w-8xl h-[95vh] rounded-3xl flex flex-col shadow-2xl overflow-hidden border border-white/20">
        
        {/* Topbar */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center z-20 shadow-sm">
          <h2 className="text-xl font-bold text-gray-800">✏️ Editor de Plantillas Inteligentes CV</h2>
          <div className="flex items-center gap-3">
            {result && cvData && (
              <button 
                onClick={() => exportToPdf(templateRef, fileName)} 
                className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-purple-700 transition shadow flex items-center gap-2"
              >
                ⬇️ Descargar PDF Maquetado
              </button>
            )}
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition flex items-center justify-center">✕</button>
          </div>
        </div>

        {result ? (
          <div className="flex flex-1 overflow-hidden bg-gray-100">
            {/* Contenedor Editor HTML */}
            <div className="w-1/2 flex flex-col min-h-0 bg-gray-200/50">
              {isExtracting ? (
                <div className="flex-1 flex items-center justify-center text-gray-500 font-medium">
                  🔄 Transcribiendo estructura del PDF original...
                </div>
              ) : (
                <CvTemplateEditor cvData={cvData} updateSection={updateSection} templateRef={templateRef} />
              )}
            </div>
            {/* Contenedor Feedback IA */}
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