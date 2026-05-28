import React, { useEffect } from 'react';
import { PdfViewer } from './PdfViewer';
import { ResultsPanel } from './ResultsPanel';
import { JobForm } from '../forms/JobForm';

export const ScannerModal = ({
  show,
  onClose,
  result,
  file,
  pdfUrl,
  containerWidth,
  pageRef,
  onPageClick,
  activeEdit,
  onEditBlur,
  onRenderSuccess,
  onClearAllEdits,
  onDownload,
  editsCount,
  fileName,
  jobDescription,
  analysisMode,
  onFileChange,
  onJobDescriptionChange,
  onModeChange,
  onSubmit,
  onExport,
  loading,
}) => {
  if (!show) return null;

  useEffect(() => {
    if (show) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
    else {
      // Si se cierra, restauramos (aunque el cleanup ya lo haría al cambiar show)
      document.body.style.overflow = '';
    }
  }, [show]);

  return (
    /* h-screen para que el modal ocupe toda la pantalla */
    <div className="fixed inset-0 z-50 bg-gray-900/90 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="h-screen bg-white w-full max-w-8xl h-[95vh] rounded-3xl flex flex-col shadow-2xl overflow-hidden border border-white/20">
        {/* Cabecera */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center z-20 shadow-sm">
          <h2 className="text-xl font-bold text-gray-800">✏️ Editor Profesional de CV</h2>
          <div className="flex items-center gap-3">
            {result && file && editsCount > 0 && (
              <button onClick={onClearAllEdits} className="bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-300 transition">
                🗑️ Resetear cambios
              </button>
            )}
            {result && file && (
              <button onClick={onDownload} className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-purple-700 transition shadow flex items-center gap-2">
                ⬇️ Descargar PDF editado
              </button>
            )}
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition flex items-center justify-center">✕</button>
          </div>
        </div>

        {result ? (
          <div className="flex flex-1 overflow-hidden bg-gray-100">
            {/* Panel izquierdo: PDF - 50% */}
            <div className="w-1/2 flex flex-col min-h-0 bg-gray-200/50">
              <PdfViewer
                file={file}
                pdfUrl={pdfUrl}
                containerWidth={containerWidth}
                pageRef={pageRef}
                onPageClick={onPageClick}
                activeEdit={activeEdit}
                onEditBlur={onEditBlur}
                onRenderSuccess={onRenderSuccess}
              />
            </div>
            {/* Panel derecho: Resultados - 50% */}
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
                onExport={onExport}
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