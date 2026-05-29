// src/components/scanner/ScannerModal.jsx
import React, { useEffect, useState } from 'react';
import { CvTemplateEditor } from './strategy/CvTemplateEditor';
import { ResultsPanel } from './ResultsPanel';
import { JobForm } from '../forms/JobForm';
import { LoadingSpinner } from './../common/LoadingSpinner';

export const ScannerModal = ({
  show, onClose, result, file, fileName, jobDescription, analysisMode,
  onFileChange, onJobDescriptionChange, onModeChange, onSubmit, loading,
  onReanalyze,
  // 1. RECUPERAMOS LAS PROPS DEL PADRE (Scanner.js) QUE HABÍA BORRADO POR ERROR
  cvData, isExtracting, updateSection, templateRef, onDownload
}) => {
  // Estado local para editar el archivo de texto plano si aplica
  const [txtContent, setTxtContent] = useState('');

  // Control robusto del tipo de archivo
  const isTextFile = file && (file.type === 'text/plain' || file.name?.toLowerCase().endsWith('.txt'));

  // Efecto para leer el .txt
  useEffect(() => {
    if (isTextFile && show) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setTxtContent(e.target.result);
      };
      reader.onerror = () => {
        setTxtContent("Error al leer el archivo de texto plano.");
      };
      reader.readAsText(file, 'UTF-8');
    }
  }, [file, isTextFile, show]);

  // Manejo del scroll del body
  useEffect(() => {
    if (!show) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = originalOverflow; };
  }, [show]);

  if (!show) return null;

  // Manejo del click en reanalizar
  const handleReanalyzeClick = () => {
    if (onReanalyze) {
      if (isTextFile) {
        onReanalyze(txtContent);
      } else if (cvData) {
        onReanalyze(cvData);
      }
    }
  };

  // 2. NUEVO: MANEJADOR INTELIGENTE DE DESCARGA
  const handleDownloadClick = () => {
    if (isTextFile) {
      // Si es un TXT, generamos un blob con el texto modificado y lo descargamos
      const blob = new Blob([txtContent], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName ? fileName.replace('.pdf', '.txt') : 'cv_optimizado.txt';
      link.click();
      URL.revokeObjectURL(url);
    } else {
      // Si es PDF, usamos la función original de tu Scanner.js conectada al TemplateRef
      if (onDownload) onDownload();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex bg-black bg-opacity-80 backdrop-filter backdrop-blur-sm animate-fadeIn">
      <div className="bg-white w-screen h-screen flex flex-col overflow-hidden">
        
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
                {/* 3. BOTÓN DE DESCARGA ACTUALIZADO */}
                <button
                  onClick={handleDownloadClick}
                  disabled={isExtracting} 
                  className="bg-purple-600 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50"
                >
                  {isTextFile ? '📥 Descargar TXT' : '📥 Descargar PDF'}
                </button>
              </>
            )}
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600">✕</button>
          </div>
        </div>

        {/* CUERPO CENTRAL DEL MODAL */}
        {result ? (
          <div className="flex flex-1 overflow-hidden bg-gray-100">
            
            {/* Contenedor Izquierda */}
            <div className="w-1/2 flex flex-col min-h-0 bg-gray-200/50">
              {isTextFile ? (
                <textarea
                  value={txtContent}
                  onChange={(e) => setTxtContent(e.target.value)}
                  className="flex-1 p-8 bg-white overflow-y-auto text-sm font-mono text-gray-700 resize-none focus:outline-none focus:ring-2 focus:ring-purple-400/50 shadow-inner leading-relaxed"
                  placeholder="Escribe o edita el contenido de tu CV aquí..."
                  disabled={loading}
                />
              ) : isExtracting ? (
                <div className="flex-1 flex items-center justify-center text-gray-500 font-medium">
                  🔄 Transcribiendo estructura del PDF original...
                </div>
              ) : (
                // Pasamos las props del padre al componente interno
                <CvTemplateEditor cvData={cvData} updateSection={updateSection} templateRef={templateRef} />
              )}
            </div>

            {/* Contenedor Derecha */}
            <div className="w-1/2 flex flex-col min-h-0 bg-white border-l border-gray-100">
              {loading ? (
                <div className="flex-1 flex flex-col items-center justify-center bg-gray-50/50">
                  <LoadingSpinner />
                  <p className="mt-4 text-sm text-gray-500 font-medium animate-pulse">Recalculando métricas ATS...</p>
                </div>
              ) : (
                <ResultsPanel result={result} />
              )}
            </div>

          </div>
        ) : (
          /* Formulario de Entrada Inicial */
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