// src/hooks/usePdfExport.js
import { useState } from 'react';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export const usePdfExport = (containerWidth = 450) => {
  const [unicodeFont, setUnicodeFont] = useState(null);

  const getStandardFontName = (fontFamily) => {
    const family = fontFamily.toLowerCase();
    if (family.includes('helvetica') || family.includes('arial') || family.includes('sans-serif')) return StandardFonts.Helvetica;
    if (family.includes('times') || family.includes('serif')) return StandardFonts.TimesRoman;
    if (family.includes('courier') || family.includes('monospace')) return StandardFonts.Courier;
    return StandardFonts.Helvetica;
  };

  const sanitizeForStandardFont = (text) => {
    return text.replace(/[●•▪▸➢➤✓✅✗✘]/g, (match) => {
      switch (match) {
        case '●': case '•': case '▪': return '-';
        case '▸': case '➢': case '➤': return '>';
        case '✓': case '✅': return '[✓]';
        case '✗': case '✘': return '[✗]';
        default: return '?';
      }
    });
  };

  const loadUnicodeFont = async (pdfDoc) => {
    if (unicodeFont) return unicodeFont;
    const fontUrl = 'https://cdn.jsdelivr.net/npm/noto-sans@1.0.0/fonts/NotoSans-Regular.ttf';
    try {
      const fontBytes = await fetch(fontUrl).then(res => res.arrayBuffer());
      const font = await pdfDoc.embedFont(fontBytes);
      setUnicodeFont(font);
      return font;
    } catch (error) {
      console.warn('No se pudo cargar la fuente Unicode', error);
      return null;
    }
  };

  const applyEditsToPdf = async (pdfDoc, editsList) => {
    const pages = pdfDoc.getPages();
    const editsByPage = {};
    Object.values(editsList).forEach(edit => {
      if (!editsByPage[edit.pageNum]) editsByPage[edit.pageNum] = [];
      editsByPage[edit.pageNum].push(edit);
    });

    const unicodeFontObj = await loadUnicodeFont(pdfDoc);
    const useUnicode = unicodeFontObj !== null;

    for (const [pageNumStr, pageEdits] of Object.entries(editsByPage)) {
      const pageNum = parseInt(pageNumStr);
      const pageIndex = pageNum - 1;
      if (pageIndex < 0 || pageIndex >= pages.length) continue;
      const page = pages[pageIndex];
      const { width: pageWidthPoints, height: pageHeightPoints } = page.getSize();
      const scale = pageWidthPoints / containerWidth;

      for (const edit of pageEdits) {
        const pdfX = edit.leftPx * scale;
        const pdfY_top = edit.topPx * scale;
        const pdfWidth = Math.max(edit.widthPx * scale, 10);
        const pdfHeight = edit.heightPx * scale;

        // Rectángulo blanco para tapar el texto original (con un pequeño margen)
        page.drawRectangle({
          x: pdfX - 1,
          y: pageHeightPoints - pdfY_top - pdfHeight - 1,
          width: pdfWidth + 2,
          height: pdfHeight + 2,
          color: rgb(1, 1, 1),
          borderWidth: 0,
        });

        // Calcular el tamaño de fuente a partir de la altura de la caja (más fiable)
        // La fuente suele ocupar ~75% de la altura de línea
        let fontSizePoints = pdfHeight * 0.75;
        if (useUnicode) fontSizePoints *= 1.05; // pequeño ajuste para Noto Sans

        // Fuente y texto
        let font;
        let finalText = edit.text;
        if (useUnicode) {
          font = unicodeFontObj;
        } else {
          const fontName = getStandardFontName(edit.fontFamily);
          font = await pdfDoc.embedStandardFont(fontName);
          finalText = sanitizeForStandardFont(finalText);
        }

        const { r, g, b } = edit.fontColor;
        const lines = finalText.split('\n');
        
        // Posicionar la línea base a 2 puntos del borde inferior (como en el código original)
        let currentY = pageHeightPoints - pdfY_top - pdfHeight + 2;
        const lineHeightPoints = fontSizePoints * 1.2;

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          if (line.trim() === '' && lines.length === 1) continue;
          page.drawText(line, {
            x: pdfX,
            y: currentY - (i * lineHeightPoints),
            size: fontSizePoints,
            font: font,
            color: rgb(r, g, b),
          });
        }
      }
    }
    return await pdfDoc.save();
  };

  const exportPdf = async (file, edits, fileName) => {
    if (!file || Object.keys(edits).length === 0) {
      alert('No hay cambios para guardar. Edita algún texto del CV primero.');
      return false;
    }
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const modifiedPdfBytes = await applyEditsToPdf(pdfDoc, edits);
      const blob = new Blob([modifiedPdfBytes], { type: 'application/pdf' });
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `CV_Optimizado_${fileName || 'documento'}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);
      alert('✅ PDF guardado correctamente con todos los cambios aplicados.');
      return true;
    } catch (error) {
      console.error("Error al generar el PDF:", error);
      alert("Hubo un error al generar tu PDF optimizado. Intenta de nuevo.");
      return false;
    }
  };

  return { exportPdf };
};