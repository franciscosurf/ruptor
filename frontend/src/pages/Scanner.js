import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAnalysis } from '../hooks/useAnalysis';
import { useOptimizer } from '../hooks/useOptimizer';
import { ScoreCircle } from '../components/common/ScoreCircle';
import { TagList } from '../components/common/TagList';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { DetailedScores } from '../components/analysis/DetailedScores';
import { Recommendations } from '../components/analysis/Recommendations';
import { MissingTermsWithContext } from '../components/analysis/MissingTermsWithContext';
import { JobSkillsList } from '../components/analysis/JobSkillsList';
import { OptimizerModal } from '../components/optimizer/OptimizerModal';
import { JobForm } from '../components/forms/JobForm';
import { Header } from '../components/layout/Header';

// Dependencias PDF
import { Document, Page, pdfjs } from 'react-pdf';
import { PDFDocument, rgb } from 'pdf-lib';
import 'react-pdf/dist/Page/TextLayer.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';

// Configuración del Worker de PDF.js
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

export default function Scanner() {
  const {
    file, fileName, jobDescription, analysisMode, result, loading, error,
    handleFileChange, setJobDescription, setAnalysisMode, handleSubmit, handleExportReport,
    setResult
  } = useAnalysis();

  const { showOptimizer, cvOptimizations, closeOptimizer } = useOptimizer(file, jobDescription);

  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState('recommendations');

  // Estados del Visor PDF
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pdfError, setPdfError] = useState(false);
  const pdfUrlRef = useRef(null);

  // --- ESTADOS DE EDICIÓN PROFESIONAL (In-place editing) ---
  const [edits, setEdits] = useState({}); // { spanIndex: { text: "Nuevo", pdfX: 10, pdfY: 20, width: 50, height: 10 } }
  const [activeEdit, setActiveEdit] = useState(null);
  const pageRef = useRef(null);

  // Limpiar memoria
  useEffect(() => {
    return () => {
      if (pdfUrlRef.current) URL.revokeObjectURL(pdfUrlRef.current);
    };
  }, []);

  const closeModal = () => {
    setShowModal(false);
    setPageNumber(1);
    setNumPages(null);
    setPdfError(false);
    setEdits({});
    if (pdfUrlRef.current) {
      URL.revokeObjectURL(pdfUrlRef.current);
      pdfUrlRef.current = null;
    }
  };

  const goToPrevPage = () => setPageNumber(Math.max(1, pageNumber - 1));
  const goToNextPage = () => setPageNumber(Math.min(numPages, pageNumber + 1));

  const pdfFileUrl = file && file.type === 'application/pdf' && !pdfUrlRef.current
    ? URL.createObjectURL(file)
    : pdfUrlRef.current;

  if (file && file.type === 'application/pdf' && !pdfUrlRef.current) {
    pdfUrlRef.current = pdfFileUrl;
  }

  // --- LÓGICA DE EDICIÓN EN LA CAPA DE TEXTO ---
  const handlePageClick = (e) => {
    const span = e.target.closest('span');
    if (!span || !span.closest('.react-pdf__Page__textContent')) return;

    const spans = Array.from(pageRef.current.querySelectorAll('.react-pdf__Page__textContent span'));
    const spanIndex = spans.indexOf(span);

    const pageRect = pageRef.current.getBoundingClientRect();
    const spanRect = span.getBoundingClientRect();
    const computedStyle = window.getComputedStyle(span);

    // Guardar también las proporciones para el PDF final (pdf-lib usa puntos, no píxeles HTML)
    // El ancho de renderizado en React es 450px. Un A4 estándar en PDF mide aprox 595.28 puntos de ancho.
    const scaleFactor = 595.28 / 450; 

    setActiveEdit({
      index: spanIndex,
      initialText: edits[spanIndex] ? edits[spanIndex].text : span.textContent,
      top: spanRect.top - pageRect.top,
      left: spanRect.left - pageRect.left,
      width: spanRect.width,
      height: spanRect.height,
      fontSize: computedStyle.fontSize,
      fontFamily: computedStyle.fontFamily,
      // Guardamos la coordenada equivalente para pdf-lib (Eje Y invertido se calculará en la descarga)
      pdfX: (spanRect.left - pageRect.left) * scaleFactor,
      pdfY: (spanRect.top - pageRect.top) * scaleFactor,
      pdfWidth: spanRect.width * scaleFactor,
      pdfHeight: spanRect.height * scaleFactor,
    });
  };

  const handleEditBlur = (e) => {
    if (activeEdit) {
      const newText = e.target.value;
      if (newText !== activeEdit.initialText) {
        setEdits(prev => ({
          ...prev,
          [activeEdit.index]: {
            text: newText,
            pdfX: activeEdit.pdfX,
            pdfY: activeEdit.pdfY,
            pdfWidth: activeEdit.pdfWidth,
            pdfHeight: activeEdit.pdfHeight
          }
        }));
      }
      setActiveEdit(null);
    }
  };

  const onRenderTextLayerSuccess = () => {
    if (!pageRef.current) return;
    const spans = Array.from(pageRef.current.querySelectorAll('.react-pdf__Page__textContent span'));
    
    spans.forEach((span, index) => {
      span.classList.add('editable-pdf-text');
      
      if (edits[index]) {
        span.textContent = edits[index].text;
        span.style.color = '#7c3aed'; // Resalta visualmente el texto modificado
        span.style.fontWeight = 'bold';
      }
    });
  };

  // --- EXPORTACIÓN DEL PDF MODIFICADO ---
  const handleDownloadModifiedPDF = async () => {
    if (!file) return;

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pages = pdfDoc.getPages();
      const currentPage = pages[pageNumber - 1]; 
      const { height } = currentPage.getSize();

      // Aplicar cada edición al archivo binario
      Object.values(edits).forEach(edit => {
        // 1. Dibujar rectángulo blanco para borrar el texto antiguo
        // (En PDF el eje Y empieza abajo, así que restamos la coordenada Y calculada desde arriba)
        currentPage.drawRectangle({
          x: edit.pdfX,
          y: height - edit.pdfY - edit.pdfHeight, 
          width: edit.pdfWidth + 20, // Margen de seguridad
          height: edit.pdfHeight + 2,
          color: rgb(1, 1, 1), 
        });

        // 2. Escribir el nuevo texto encima
        currentPage.drawText(edit.text, {
          x: edit.pdfX,
          y: height - edit.pdfY - edit.pdfHeight + 2, // Ajuste de línea base
          size: 11, // Tamaño aproximado (se podría calcular desde el CSS font-size)
          color: rgb(0.2, 0.2, 0.2), 
        });
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `CV_Optimizado_${fileName}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);

    } catch (error) {
      console.error("Error al generar el PDF:", error);
      alert("Hubo un error al generar tu PDF optimizado.");
    }
  };

  // Pestañas Laterales
  const tabs = [
    { id: 'recommendations', label: '⚡ Mejoras', component: () => <Recommendations recommendations={result?.recommendations || []} /> },
    { id: 'skills', label: '🛠️ Skills', component: () => (
      <>
        <div className="mb-4">
          <div className="text-sm font-medium text-gray-500 mb-2">✅ Tu CV detecta</div>
          <TagList items={result?.extracted_skills_cv || []} color="#10b981" emptyText="Sin skills" />
        </div>
        <div>
          <div className="text-sm font-medium text-gray-500 mb-2">🎯 La oferta requiere</div>
          <JobSkillsList cvSkills={result?.extracted_skills_cv || []} jobSkills={result?.extracted_skills_job || []} />
        </div>
      </>
    ) },
    { id: 'suggestions', label: '❌ Sugerencias', component: () => <MissingTermsWithContext items={result?.missing_terms_with_context || []} /> }
  ];

  return (
    <div className="overflow-x-hidden bg-white">
      <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet" />
      <style>{`
        body { font-family: 'Inter', sans-serif; color: #0b1020; }
        .gradient-text { background: linear-gradient(90deg,#7c3aed,#2563eb); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .grid-bg { background-image: linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px); background-size: 40px 40px; }
        .hero-glow { position: absolute; width: 700px; height: 700px; border-radius: 999px; background: radial-gradient(circle, rgba(99,102,241,0.18), transparent 70%); top: -300px; right: -250px; }
        
        /* Estilos críticos para el TextLayer Editable */
        .editable-pdf-text { cursor: text !important; border-radius: 2px; transition: all 0.2s; }
        .editable-pdf-text:hover { background-color: rgba(124, 58, 237, 0.2) !important; box-shadow: 0 0 0 2px rgba(124, 58, 237, 0.4); }
        .react-pdf__Page__textContent { z-index: 10 !important; }
        .react-pdf__Page canvas { border-radius: 4px; }
      `}</style>

      <Header />

      {/* --- HERO SECTION --- */}
      <section className="relative overflow-hidden grid-bg">
        <div className="hero-glow"></div>
        <div className="max-w-7xl mx-auto px-6 py-28 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 bg-black/5 rounded-full px-4 py-2 mb-8 mx-auto">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            <span className="text-sm font-medium">Editor In-Place ATS</span>
          </div>
          <h1 className="text-6xl md:text-7xl font-black tracking-tight leading-none mb-8 max-w-4xl mx-auto">
            Descubre cómo <span className="gradient-text"> te filtra</span> la IA.
          </h1>
          <p className="text-xl md:text-2xl text-black/60 leading-relaxed mb-10 max-w-2xl mx-auto">
            Tu CV probablemente está siendo rechazado antes de que un humano lo vea. Analiza y edita tu candidatura con ruptor.
          </p>
          <button onClick={() => setShowModal(true)} className="px-10 py-5 rounded-2xl bg-black text-white text-lg font-bold hover:scale-105 transition shadow-2xl">
            Subir mi CV y Analizar
          </button>
        </div>
      </section>

      {/* --- CÓMO FUNCIONA --- */}
      <section className="py-28 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <span className="gradient-text font-bold uppercase tracking-widest text-sm">Cómo funciona</span>
            <h2 className="text-5xl font-black mt-4 mb-6">Simulamos ATS reales</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-[32px] p-10 shadow-xl border border-gray-100">
              <h3 className="text-2xl font-black mb-4">1. Subes tu CV</h3>
              <p className="text-gray-600">Procesamos tu documento PDF nativo y analizamos la estructura.</p>
            </div>
            <div className="bg-white rounded-[32px] p-10 shadow-xl border border-gray-100">
              <h3 className="text-2xl font-black mb-4">2. La IA evalúa</h3>
              <p className="text-gray-600">Simulamos filtros automáticos y extraemos las keywords faltantes.</p>
            </div>
            <div className="bg-white rounded-[32px] p-10 shadow-xl border border-gray-100">
              <h3 className="text-2xl font-black mb-4">3. Editas in-place</h3>
              <p className="text-gray-600">Haz clic sobre cualquier palabra de tu CV, edítala y descárgalo.</p>
            </div>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="border-t border-gray-200 py-10 bg-white">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="font-bold text-lg">⚡ ruptor</span>
          </div>
          <p className="text-gray-400 text-sm">© 2026 ruptor — Supera el filtro.</p>
        </div>
      </footer>

      {/* --- MODAL PRINCIPAL (DASHBOARD SAAS) --- */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-gray-900/90 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-7xl h-[95vh] rounded-3xl flex flex-col shadow-2xl overflow-hidden border border-white/20">
            
            {/* Cabecera del Modal */}
            <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center z-20 shadow-sm">
              <h2 className="text-xl font-bold text-gray-800">⚡ Editor Inteligente</h2>
              <div className="flex items-center gap-4">
                {result && file && (
                  <button 
                    onClick={handleDownloadModifiedPDF}
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-purple-700 transition shadow flex items-center gap-2"
                  >
                    ⬇ Descargar Cambios
                  </button>
                )}
                <button onClick={closeModal} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition flex items-center justify-center">✕</button>
              </div>
            </div>

            {result ? (
              <div className="flex flex-1 overflow-hidden bg-gray-100">
                
                {/* === COLUMNA IZQUIERDA: VISOR PDF EDITABLE === */}
                <div className="w-7/12 border-r border-gray-200 flex flex-col relative bg-gray-200/50">
                  <div className="p-3 border-b border-gray-200 bg-white flex justify-between items-center z-10 shadow-sm">
                    <span className="text-sm font-semibold text-gray-700 bg-purple-50 text-purple-700 px-3 py-1 rounded-full">
                      ✨ Haz clic en cualquier texto del CV para editarlo
                    </span>
                    {numPages && (
                      <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-md border border-gray-200">
                        <button onClick={goToPrevPage} className="px-2 bg-white rounded text-xs hover:bg-gray-50">◀</button>
                        <span className="text-xs font-medium px-2">{pageNumber} / {numPages}</span>
                        <button onClick={goToNextPage} className="px-2 bg-white rounded text-xs hover:bg-gray-50">▶</button>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 overflow-y-auto p-8 flex justify-center relative">
                    {file && !pdfError ? (
                      <div 
                        className="relative shadow-2xl bg-white select-none transition-all" 
                        ref={pageRef}
                        onClick={handlePageClick}
                      >
                        {/* Renderizado de react-pdf */}
                        <Document
                          file={pdfFileUrl}
                          onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                          onLoadError={() => setPdfError(true)}
                        >
                          <Page 
                            pageNumber={pageNumber} 
                            width={450} 
                            renderTextLayer={true} 
                            renderAnnotationLayer={false}
                            onTextLayerRenderSuccess={onRenderTextLayerSuccess}
                          />
                        </Document>

                        {/* Input Flotante para la edición (aparece al hacer clic) */}
                        {activeEdit && (
                          <textarea
                            autoFocus
                            defaultValue={activeEdit.initialText}
                            onBlur={handleEditBlur}
                            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) e.target.blur(); }}
                            className="absolute z-50 bg-white border border-purple-500 shadow-lg outline-none resize-none overflow-hidden rounded-sm"
                            style={{
                              top: `${activeEdit.top - 2}px`,
                              left: `${activeEdit.left - 2}px`,
                              width: `${Math.max(activeEdit.width + 30, 120)}px`, 
                              height: `${Math.max(activeEdit.height + 10, 24)}px`,
                              fontSize: activeEdit.fontSize,
                              fontFamily: activeEdit.fontFamily,
                              color: '#000',
                              lineHeight: '1.2',
                              padding: '2px'
                            }}
                          />
                        )}
                      </div>
                    ) : (
                      <div className="text-gray-500 text-sm bg-white p-6 rounded shadow">Error al cargar el PDF.</div>
                    )}
                  </div>
                </div>

                {/* === COLUMNA DERECHA: RESULTADOS IA === */}
                <div className="w-5/12 flex flex-col bg-white">
                  <div className="p-6 border-b border-gray-100 bg-gray-50 flex-shrink-0">
                    <ScoreCircle score={result.ats_score} level={result.level} />
                    <p className="mt-4 text-center text-sm font-medium text-gray-600">{result.summary}</p>
                    {result.detailed_scores && (
                      <div className="mt-5 pt-5 border-t border-gray-200">
                        <DetailedScores scores={result.detailed_scores} />
                      </div>
                    )}
                  </div>
                  <div className="flex border-b border-gray-200 bg-white px-2">
                    {tabs.map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex-1 py-3 px-2 text-xs font-bold uppercase tracking-wide transition-all border-b-2 text-center ${
                          activeTab === tab.id ? 'border-purple-600 text-purple-700 bg-purple-50/50 rounded-t-lg' : 'border-transparent text-gray-400 hover:text-gray-600'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                  <div className="flex-1 overflow-y-auto p-6 bg-white">
                    {tabs.find(t => t.id === activeTab)?.component()}
                  </div>
                </div>

              </div>
            ) : (
              <div className="flex-1 overflow-y-auto p-8 bg-gray-50 flex items-center justify-center">
                <div className="w-full max-w-2xl bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
                  <JobForm
                    fileName={fileName}
                    jobDescription={jobDescription}
                    analysisMode={analysisMode}
                    onFileChange={handleFileChange}
                    onJobDescriptionChange={setJobDescription}
                    onModeChange={setAnalysisMode}
                    onSubmit={handleSubmit}
                    onExport={handleExportReport}
                    loading={loading}
                    resultExists={!!result}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      <OptimizerModal show={showOptimizer} data={cvOptimizations} onClose={closeOptimizer} />
      {loading && <LoadingSpinner />}
    </div>
  );
}