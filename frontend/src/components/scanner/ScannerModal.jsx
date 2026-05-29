// src/components/scanner/ScannerModal.jsx
import React, { useEffect, useRef } from 'react';
import { CvTemplateEditor } from './strategy/CvTemplateEditor';
import { ResultsPanel } from './ResultsPanel';
import { JobForm } from '../forms/JobForm';
import { useCvData } from './strategy/useCvData';
import { useTemplateExport } from './strategy/useTemplateExport';
import { LoadingSpinner } from '../common/LoadingSpinner';

export const ScannerModal = ({
  show, onClose, result, file, fileName, jobDescription, analysisMode,
  onFileChange, onJobDescriptionChange, onModeChange, onSubmit, loading,
  onReanalyze,
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

  const handleReanalyzeClick = () => {
    if (onReanalyze && cvData) {
      onReanalyze(cvData);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-gray-900/90 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="h-screen bg-white w-full max-w-8xl h-[95vh] rounded-3xl flex flex-col shadow-2xl overflow-hidden border border-white/20">
        
        {/* Topbar */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center z-20 shadow-sm">
          <h2 className="text-xl font-bold text-gray-800">✏️ Editor de Plantillas Inteligentes CV</h2>
          <div className="flex items-center gap-3">
            {result && cvData && (
              <>
                {/* 🆕 BOTÓN NUEVO */}
                <button
                  onClick={handleReanalyzeClick}
                  disabled={loading || isExtracting}
                  className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${
                    loading || isExtracting
                      ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                      : 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100 active:scale-95 shadow-sm'
                  }`}
                >
                  {loading ? '⏳ Analizando...' : '🔄 Reanalizar CV'}
                </button>
                {/* Botón original de descarga */}
                <button
                  onClick={() => exportToPdf(templateRef, fileName)}
                  disabled={isExtracting}
                  className="bg-purple-500  px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-sm active:scale-95 disabled:opacity-50"
                >
                  📥 Descargar PDF
                </button>
              </>
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
            <div className="w-1/2 flex flex-col min-h-0 bg-white relative">
              {loading ? (
                <div className="flex-1 flex items-center justify-center bg-white/90 backdrop-blur-sm z-10 h-full w-full">
                  <LoadingSpinner />
                </div>
              ) : (
                <ResultsPanel result={result} />
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-8 bg-gray-50 flex items-center justify-center relative">
            {loading ? (
              <div className="w-full max-w-2xl bg-white p-12 rounded-2xl shadow-sm border border-gray-200 flex items-center justify-center">
                <LoadingSpinner />
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