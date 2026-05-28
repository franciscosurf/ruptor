// src/components/scanner/PdfViewer.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Document, Page } from 'react-pdf';

export const PdfViewer = ({
  file,
  pdfUrl,
  onPageClick,
  activeEdit,
  onEditBlur,
  onRenderSuccess,
}) => {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pdfError, setPdfError] = useState(false);
  const [availableWidth, setAvailableWidth] = useState(undefined);
  const wrapperRef = useRef(null);

  // Medir el ancho del contenedor para que el PDF ocupe el 100%
  useEffect(() => {
    if (!wrapperRef.current) return;

    const updateWidth = () => {
      if (wrapperRef.current) {
        // Restamos un pequeño padding si es necesario (por ejemplo, 16px por los lados)
        const width = wrapperRef.current.clientWidth - 32; // 16px left+right padding del contenedor
        setAvailableWidth(width > 0 ? width : undefined);
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  const goToPrevPage = () => setPageNumber(Math.max(1, pageNumber - 1));
  const goToNextPage = () => setPageNumber(Math.min(numPages, pageNumber + 1));

  const handleClick = (e) => {
    const span = e.target.closest('span');
    if (!span || !span.closest('.react-pdf__Page__textContent')) return;

    const spans = Array.from(wrapperRef.current.querySelectorAll('.react-pdf__Page__textContent span'));
    const spanIndex = spans.indexOf(span);
    if (spanIndex === -1) return;

    const pageRect = wrapperRef.current.querySelector('.react-pdf__Page')?.getBoundingClientRect();
    if (!pageRect) return;
    const spanRect = span.getBoundingClientRect();
    const computedStyle = window.getComputedStyle(span);
    const rgbColor = computedStyle.color;
    const match = rgbColor.match(/\d+/g);
    const fontColor = match ? { r: parseInt(match[0])/255, g: parseInt(match[1])/255, b: parseInt(match[2])/255 } : { r: 0, g: 0, b: 0 };

    onPageClick({
      index: spanIndex,
      pageNum: pageNumber,
      initialText: span.textContent,
      leftPx: spanRect.left - pageRect.left,
      topPx: spanRect.top - pageRect.top,
      widthPx: spanRect.width,
      heightPx: spanRect.height,
      fontSizePx: parseFloat(computedStyle.fontSize),
      fontFamily: computedStyle.fontFamily,
      fontWeight: computedStyle.fontWeight,
      fontColor,
    });
  };

  if (!file || pdfError) {
    return <div className="text-gray-500 text-sm bg-white p-6 rounded shadow">Error al cargar el PDF o formato no soportado.</div>;
  }

  return (
    <div className="flex-1 flex flex-col relative bg-gray-200/50">
      <div className="p-3 border-b border-gray-200 bg-white flex justify-between items-center z-10 shadow-sm">
        <span className="text-sm font-semibold text-gray-700 bg-purple-50 text-purple-700 px-3 py-1 rounded-full">
          ✨ Haz clic en cualquier texto para editarlo
        </span>
        {numPages && (
          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-md border border-gray-200">
            <button onClick={goToPrevPage} className="px-2 bg-white rounded text-xs hover:bg-gray-50">◀</button>
            <span className="text-xs font-medium px-2">{pageNumber} / {numPages}</span>
            <button onClick={goToNextPage} className="px-2 bg-white rounded text-xs hover:bg-gray-50">▶</button>
          </div>
        )}
      </div>
      <div className="flex-1 overflow-y-auto p-8 flex justify-center relative" ref={wrapperRef}>
        <div className="relative shadow-2xl bg-white select-none transition-all" onClick={handleClick}>
          <Document
            file={pdfUrl}
            onLoadSuccess={({ numPages }) => setNumPages(numPages)}
            onLoadError={() => setPdfError(true)}
          >
            <Page
              pageNumber={pageNumber}
              width={availableWidth}
              renderTextLayer={true}
              renderAnnotationLayer={false}
              onTextLayerRenderSuccess={onRenderSuccess}
            />
          </Document>
          {activeEdit && (
            <textarea
              autoFocus
              defaultValue={activeEdit.initialText}
              onBlur={onEditBlur}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) e.target.blur(); }}
              className="absolute z-50 bg-white border-2 border-purple-500 shadow-lg outline-none resize-none overflow-auto rounded-md font-sans p-1"
              style={{
                top: `${activeEdit.topPx - 2}px`,
                left: `${activeEdit.leftPx - 2}px`,
                width: `${Math.max(activeEdit.widthPx + 20, 140)}px`,
                minHeight: `${Math.max(activeEdit.heightPx + 10, 32)}px`,
                fontSize: `${activeEdit.fontSizePx}px`,
                fontFamily: activeEdit.fontFamily,
                fontWeight: activeEdit.fontWeight,
                color: '#000',
                lineHeight: '1.3',
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};