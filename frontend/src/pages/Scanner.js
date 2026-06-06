// src/pages/Scanner.js
import React, { useState, useEffect, useRef } from 'react';
import { useAnalysis } from '../hooks/useAnalysis';
import { useCvData } from '../components/scanner/strategy/useCvData';
import { useTemplateExport } from '../components/scanner/strategy/useTemplateExport';
import { Header } from './components/layout/Header';
import { HeroSection } from './components/scanner/HeroSection';
import { HowItWorks } from './components/scanner/HowItWorks';
import { Footer } from './components/scanner/Footer';
import { ScannerModal } from './components/scanner/ScannerModal';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ThemeProvider, useTheme } from '../contexts/ThemeContext';
import '../styles/themes.css';

const cvDataToPlainText = (cvData) => { /* ... misma función ... */ };

// Componente interno que aplica el tema y las variables CSS
const ThemedScanner = () => {
  const { theme, currentTheme } = useTheme();

  // Inyectar variables CSS globales al cargar el tema
  useEffect(() => {
    const root = document.documentElement;
    Object.entries(theme).forEach(([key, value]) => {
      root.style.setProperty(`--${key}`, value);
    });
    document.body.className = `theme-${currentTheme}`;
  }, [theme, currentTheme]);

  // Resto de la lógica original del Scanner
  const editorRef = useRef(null);
  const {
    file, fileName, jobDescription, analysisMode, result, loading,
    handleFileChange, setJobDescription, setAnalysisMode, handleSubmit,
    analyzeWithCvText, resetAnalysis,
  } = useAnalysis();

  const [showModal, setShowModal] = useState(false);
  const templateRef = useRef(null);
  const { cvData, loadPdf, isExtracting, updateSection } = useCvData();
  const { exportToPdf } = useTemplateExport();

  useEffect(() => {
    if (file && file.type === 'application/pdf') loadPdf(file);
  }, [file, loadPdf]);

  const closeModal = () => setShowModal(false);
  const handleDownload = () => exportToPdf(templateRef, fileName);
  const handleReanalyze = async (editedData) => { /* ... */ };
  const handleStartAnalysis = () => { resetAnalysis(); setShowModal(true); };

  return (
    <div className="overflow-x-hidden" style={{ background: 'var(--bgPrimary)', color: 'var(--textPrimary)' }}>
      <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet" />
      <style>{`
        body { font-family: 'Inter', sans-serif; background: var(--bgPrimary); color: var(--textPrimary); }
        .gradient-text { background: linear-gradient(90deg, var(--gradientFrom), var(--gradientTo)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .grid-bg { background-image: linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px); background-size: 40px 40px; }
        .hero-glow { position: absolute; width: 700px; height: 700px; border-radius: 999px; background: radial-gradient(circle, var(--heroGlow), transparent 70%); top: -300px; right: -250px; }
      `}</style>

      <Header />
      <HeroSection onStart={handleStartAnalysis} />
      <HowItWorks />
      <Footer />

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
        loading={loading}
        onReanalyze={handleReanalyze}
      />
    </div>
  );
};

export default function Scanner() {
  return (
    <ThemeProvider>
      <ThemedScanner />
    </ThemeProvider>
  );
}