// src/components/scanner/strategy/usePdfExport.js
import { useState, useCallback } from 'react';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

/**
 * Sanitiza el texto para que sea 100% compatible con WinAnsi (Helvetica).
 * Reemplaza viñetas, comillas especiales, guiones largos, etc.
 */
const sanitizeForPdf = (text) => {
  if (!text) return '';
  let result = text;

  // 1. Reemplazar viñetas y flechas por guión
  result = result.replace(/[●•▪▸➢➣➤→▶❯]/g, '- ');

  // 2. Comillas curvas por rectas
  result = result.replace(/[“”]/g, '"');
  result = result.replace(/[‘’]/g, "'");

  // 3. Guiones largos por guión normal
  result = result.replace(/[—–]/g, '-');

  // 4. Símbolos comunes que no aportan valor
  result = result.replace(/[©®™]/g, '');

  // 5. Convertir acentos y eñes a ASCII (ya que WinAnsi no los soporta)
  const accentMap = {
    'á': 'a', 'é': 'e', 'í': 'i', 'ó': 'o', 'ú': 'u',
    'Á': 'A', 'É': 'E', 'Í': 'I', 'Ó': 'O', 'Ú': 'U',
    'ñ': 'n', 'Ñ': 'N', 'ü': 'u', 'Ü': 'U', 'ç': 'c', 'Ç': 'C'
  };
  result = result.replace(/[áéíóúÁÉÍÓÚñÑüÜçÇ]/g, match => accentMap[match] || match);

  // 6. Eliminar cualquier otro carácter no ASCII (rangos no imprimibles o extraños)
  result = result.replace(/[^\x00-\x7F]/g, (char) => {
    // Si después de todo sigue habiendo algo raro, lo eliminamos
    return '';
  });

  return result;
};

export const useTemplateExport = () => {
  const [isExporting, setIsExporting] = useState(false);

  const exportToPdf = useCallback(async (cvData, fileName) => {
    if (!cvData) return false;
    setIsExporting(true);

    try {
      // 1. Crear documento y primera página
      const pdfDoc = await PDFDocument.create();
      const pageWidth = 595.28;
      const pageHeight = 841.89;
      let currentPage = pdfDoc.addPage([pageWidth, pageHeight]);

      // 2. Márgenes y fuentes
      const margin = { x: 50, y: 50 };
      const contentWidth = pageWidth - margin.x * 2;
      let y = pageHeight - margin.y;

      const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const fontBold    = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

      // 3. Función para añadir página
      const addNewPage = () => {
        currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
        y = pageHeight - margin.y;
      };

      // 4. Dibujar línea horizontal
      const drawLine = (yPos, thickness = 0.5, color = rgb(0.6, 0.6, 0.6)) => {
        currentPage.drawLine({
          start: { x: margin.x, y: yPos },
          end: { x: pageWidth - margin.x, y: yPos },
          thickness,
          color,
        });
      };

      // 5. Escribir texto con wrap y sanitización
      const writeText = (rawText, options = {}) => {
        if (!rawText?.trim()) return;

        const { size = 10, bold = false, color = rgb(0.15, 0.15, 0.15), lineGap = 1.2 } = options;
        const font = bold ? fontBold : fontRegular;
        const lineHeight = size * lineGap;
        const text = sanitizeForPdf(rawText); // <--- SANITIZACIÓN CRÍTICA
        const paragraphs = text.split('\n');

        for (const para of paragraphs) {
          if (para.trim() === '') {
            y -= lineHeight * 0.5;
            continue;
          }

          // Dividir párrafo en líneas según ancho disponible
          const words = para.split(' ');
          let lines = [];
          let currentLine = '';

          for (const word of words) {
            const testLine = currentLine ? `${currentLine} ${word}` : word;
            const testWidth = font.widthOfTextAtSize(testLine, size);
            if (testWidth < contentWidth) {
              currentLine = testLine;
            } else {
              if (currentLine) lines.push(currentLine);
              currentLine = word;
            }
          }
          if (currentLine) lines.push(currentLine);

          for (const line of lines) {
            if (y - lineHeight < margin.y) addNewPage();
            currentPage.drawText(line, {
              x: margin.x,
              y: y - lineHeight,
              size,
              font,
              color,
            });
            y -= lineHeight;
          }
          y -= lineHeight * 0.3; // espacio entre párrafos
        }
      };

      // 6. Título de sección
      const writeSectionTitle = (title) => {
        y -= 10;
        if (y < margin.y + 20) addNewPage();
        currentPage.drawText(sanitizeForPdf(title).toUpperCase(), {
          x: margin.x,
          y: y - 10,
          size: 9,
          font: fontBold,
          color: rgb(0.1, 0.1, 0.1),
        });
        y -= 5;
        //drawLine(y + 3, 0.3);
        y -= 8;
      };

      // 7. Componer el CV
      writeText(cvData.name, { size: 20, bold: true, color: rgb(0, 0, 0), lineGap: 1.3 });
      writeText(cvData.contact, { size: 9, color: rgb(0.4, 0.4, 0.4), lineGap: 1.4 });
      y -= 4;
      //drawLine(y, 0.8, rgb(0.1, 0.1, 0.1));
      y -= 12;

      if (cvData.summary)    { writeSectionTitle('Perfil Profesional');      writeText(cvData.summary,    { size: 9.5, lineGap: 1.45 }); }
      if (cvData.leadership) { writeSectionTitle('Liderazgo y Actividades'); writeText(cvData.leadership, { size: 9.5, lineGap: 1.45 }); }
      if (cvData.experience) { writeSectionTitle('Experiencia');             writeText(cvData.experience, { size: 9.5, lineGap: 1.45 }); }
      if (cvData.education)  { writeSectionTitle('Educación');               writeText(cvData.education,  { size: 9.5, lineGap: 1.45 }); }
      if (cvData.skills)     { writeSectionTitle('Habilidades e Intereses'); writeText(cvData.skills,     { size: 9.5, lineGap: 1.45 }); }

      // 8. Guardar y descargar
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const safeFileName = (fileName || 'documento').replace(/[^a-zA-Z0-9_\-]/g, '_');
      link.download = `CV_Optimizado_${safeFileName}.pdf`;
      link.click();
      URL.revokeObjectURL(url);

      return true;
    } catch (error) {
      console.error('[usePdfExport] Error generando PDF:', error);
      alert('No se pudo generar el PDF. Consulta la consola para más detalles.');
      return false;
    } finally {
      setIsExporting(false);
    }
  }, []);

  return { exportToPdf, isExporting };
};
