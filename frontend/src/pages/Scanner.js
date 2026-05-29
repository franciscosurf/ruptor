// src/pages/Scanner.js
import React, { useState, useEffect, useRef } from 'react';
import { useAnalysis } from '../hooks/useAnalysis';
import { useOptimizer } from '../hooks/useOptimizer';

// NUEVOS ESTRATEGIA HOOKS (Conversion-First)
import { useCvData } from '../components/scanner/strategy/useCvData';
import { useTemplateExport } from '../components/scanner/strategy/useTemplateExport';

import { HeroSection, HowItWorks, Footer, ScannerModal } from '../components/scanner';
import { OptimizerModal } from '../components/optimizer/OptimizerModal';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Header } from '../components/layout/Header';  

const cvDataToPlainText = (cvData) => {
  if (!cvData) return '';
  const sections = [
    { title: 'NOMBRE', content: cvData.name },
    { title: 'CONTACTO', content: cvData.contact },
    { title: 'PERFIL PROFESIONAL', content: cvData.summary },
    { title: 'LIDERAZGO Y ACTIVIDADES', content: cvData.leadership },
    { title: 'EXPERIENCIA', content: cvData.experience },
    { title: 'EDUCACIÓN', content: cvData.education },
    { title: 'HABILIDADES E INTERESES', content: cvData.skills },
  ];
  return sections
    .filter(s => s.content && s.content.trim())
    .map(s => `${s.title}\n${s.content}\n`)
    .join('\n');
};

export default function Scanner() {
  const editorRef = useRef(null);
  // Preservamos lógica nativa de análisis de IA
  const {
    file, fileName, jobDescription, analysisMode, result, loading,
    handleFileChange, setJobDescription, setAnalysisMode, handleSubmit, 
    handleExportReport, analyzeWithCvText,
  } = useAnalysis();

  // Preservamos lógica nativa del optimizador
  const { showOptimizer, cvOptimizations, closeOptimizer } = useOptimizer(file, jobDescription);

  const [showModal, setShowModal] = useState(false);
  
  // Referencia física para la captura del lienzo A4
  const templateRef = useRef(null);

  // Instanciamos la nueva estrategia de datos y exportación
  const { cvData, loadPdf, isExtracting, updateSection } = useCvData();
  const { exportToPdf } = useTemplateExport();

  // Escuchar cuando el usuario carga un archivo para iniciar la extracción en segundo plano
  useEffect(() => {
    if (file && file.type === 'application/pdf') {
      loadPdf(file);
    }
  }, [file, loadPdf]);

  const closeModal = () => setShowModal(false);

  // Manejador modificado para descargar mediante captura HTML
  const handleDownload = () => exportToPdf(templateRef, fileName);

  // Manejador para reanalizar con el CV editado
  const handleReanalyze = async (editedCvData) => {
    if (!editedCvData) return;
    const cvText = cvDataToPlainText(editedCvData);
    await analyzeWithCvText(cvText, jobDescription, analysisMode);
  };

  return (
    <div className="overflow-x-hidden bg-white" >
      <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet" />
      <style>{`
        body { font-family: 'Inter', sans-serif; color: #0b1020; }
        .gradient-text { background: linear-gradient(90deg,#7c3aed,#2563eb); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .grid-bg { background-image: linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px); background-size: 40px 40px; }
        .hero-glow { position: absolute; width: 700px; height: 700px; border-radius: 999px; background: radial-gradient(circle, rgba(99,102,241,0.18), transparent 70%); top: -300px; right: -250px; }
      `}</style>
      
      <Header />
      <HeroSection onStart={() => setShowModal(true)} />
      <HowItWorks />
      <Footer />

      {/* Cargamos las nuevas props sanitarias limpias de bugs */}
      <ScannerModal
        show={showModal}
        onClose={closeModal}
        result={result}
        file={file}
        cvData={cvData}
        isExtracting={isExtracting}
        updateSection={updateSection}
        templateRef={templateRef}
        onDownload={handleDownload}
        fileName={fileName}
        jobDescription={jobDescription}
        analysisMode={analysisMode}
        onFileChange={handleFileChange}
        onJobDescriptionChange={setJobDescription}
        onModeChange={setAnalysisMode}
        onSubmit={handleSubmit}
        onExport={handleExportReport}
        loading={loading}
        //ref={editorRef}
        onReanalyze={handleReanalyze} 
      />

      <OptimizerModal show={showOptimizer} data={cvOptimizations} onClose={closeOptimizer} />
      {loading && <LoadingSpinner />}
    </div>
  );
}