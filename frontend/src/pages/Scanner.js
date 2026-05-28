// src/pages/Scanner.js
import React, { useState, useEffect, useRef } from 'react';
import { useAnalysis } from '../hooks/useAnalysis';
import { useOptimizer } from '../hooks/useOptimizer';
import { usePdfEditor } from '../components/scanner/usePdfEditor';
import { usePdfExport } from '../components/scanner/usePdfExport';
import { HeroSection, HowItWorks, Footer, ScannerModal } from '../components/scanner';
import { OptimizerModal } from '../components/optimizer/OptimizerModal';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Header } from '../components/layout/Header';  
import { pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/TextLayer.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

export default function Scanner() {
  const {
    file, fileName, jobDescription, analysisMode, result, loading,
    handleFileChange, setJobDescription, setAnalysisMode, handleSubmit, handleExportReport,
  } = useAnalysis();

  const { showOptimizer, cvOptimizations, closeOptimizer } = useOptimizer(file, jobDescription);

  const [showModal, setShowModal] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const pdfUrlRef = useRef(null);
  const containerWidth = 450;

  const {
    edits,
    activeEdit,
    pageRef,
    handlePageClick,
    handleEditBlur,
    clearAllEdits,
    onRenderTextLayerSuccess,
  } = usePdfEditor(containerWidth);

  const { exportPdf } = usePdfExport(containerWidth);

  // Manejar URL del PDF
  useEffect(() => {
    if (file && file.type === 'application/pdf' && !pdfUrlRef.current) {
      const url = URL.createObjectURL(file);
      pdfUrlRef.current = url;
      setPdfUrl(url);
    }
    return () => {
      if (pdfUrlRef.current) {
        URL.revokeObjectURL(pdfUrlRef.current);
        pdfUrlRef.current = null;
      }
    };
  }, [file]);

  const closeModal = () => setShowModal(false);

  const handleDownload = () => exportPdf(file, edits, fileName);

  return (
    <div className="overflow-x-hidden bg-white">
      <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet" />
      <style>{`
        body { font-family: 'Inter', sans-serif; color: #0b1020; }
        .gradient-text { background: linear-gradient(90deg,#7c3aed,#2563eb); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .grid-bg { background-image: linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px); background-size: 40px 40px; }
        .hero-glow { position: absolute; width: 700px; height: 700px; border-radius: 999px; background: radial-gradient(circle, rgba(99,102,241,0.18), transparent 70%); top: -300px; right: -250px; }
        .editable-pdf-text { cursor: text !important; border-radius: 2px; transition: all 0.2s ease; }
        .editable-pdf-text:hover { background-color: rgba(124, 58, 237, 0.15) !important; box-shadow: 0 0 0 2px rgba(124, 58, 237, 0.5); }
        .react-pdf__Page__textContent { z-index: 10 !important; }
        .react-pdf__Page canvas { border-radius: 4px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
      `}</style>
      <Header />
      <HeroSection onStart={() => setShowModal(true)} />
      <HowItWorks />
      <Footer />

      <ScannerModal
        show={showModal}
        onClose={closeModal}
        result={result}
        file={file}
        pdfUrl={pdfUrl}
        containerWidth={containerWidth}
        pageRef={pageRef}
        onPageClick={handlePageClick}
        activeEdit={activeEdit}
        onEditBlur={handleEditBlur}
        onRenderSuccess={onRenderTextLayerSuccess}
        onClearAllEdits={clearAllEdits}
        onDownload={handleDownload}
        editsCount={Object.keys(edits).length}
        fileName={fileName}
        jobDescription={jobDescription}
        analysisMode={analysisMode}
        onFileChange={handleFileChange}
        onJobDescriptionChange={setJobDescription}
        onModeChange={setAnalysisMode}
        onSubmit={handleSubmit}
        onExport={handleExportReport}
        loading={loading}
      />

      <OptimizerModal show={showOptimizer} data={cvOptimizations} onClose={closeOptimizer} />
      {loading && <LoadingSpinner />}
    </div>
  );
}