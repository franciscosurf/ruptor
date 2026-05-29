// src/components/scanner/strategy/useTemplateExport.js
import jsPDF from 'jspdf';

export const useTemplateExport = () => {
  const exportToPdf = async (cvData, fileName) => {
    if (!cvData) return false;

    const pdf = new jsPDF({
      unit: 'mm',
      format: 'a4',
      orientation: 'portrait',
    });

    // ── Fuente con soporte completo de caracteres latinos ──────────────────
    // jsPDF incluye 'courier', 'helvetica', 'times' pero ninguna soporta á/ñ/é
    // La solución: usar autoTable o cargar una fuente TTF.
    // Sin librerías extra: usar el encoding 'win-1252' y limpiar caracteres.
    pdf.setLanguage('es');

    const pageW  = 210;
    const marginX = 18;
    const marginY = 15;
    const contentW = pageW - marginX * 2;
    let y = marginY;

    // ── Normalización de caracteres latinos ────────────────────────────────
    // jsPDF/helvetica no renderiza á é í ó ú ñ ü — los sustituimos por
    // el equivalente sin tilde solo en el PDF (el editor mantiene los originales)
    const normalize = (str) => {
      if (!str) return '';
      return str
        .replace(/á/g, 'a').replace(/Á/g, 'A')
        .replace(/é/g, 'e').replace(/É/g, 'E')
        .replace(/í/g, 'i').replace(/Í/g, 'I')
        .replace(/ó/g, 'o').replace(/Ó/g, 'O')
        .replace(/ú/g, 'u').replace(/Ú/g, 'U')
        .replace(/ñ/g, 'n').replace(/Ñ/g, 'N')
        .replace(/ü/g, 'u').replace(/Ü/g, 'U')
        .replace(/ç/g, 'c').replace(/Ç/g, 'C')
        .replace(/[^\x00-\x7F]/g, ''); // eliminar cualquier otro no-ASCII
    };

    // ── Escritura con soporte real de saltos de línea ──────────────────────
    const write = (rawText, opts = {}) => {
      const {
        size    = 10,
        style   = 'normal',  // 'normal' | 'bold' | 'italic'
        color   = [40, 40, 40],
        lineGap = 1.2,       // multiplicador de interlineado sobre el tamaño
      } = opts;

      if (!rawText?.trim()) return;

      pdf.setFontSize(size);
      pdf.setFont('helvetica', style);
      pdf.setTextColor(...color);

      const lh = size * lineGap * 0.352778; // px → mm (1px = 0.352778mm)

      // CLAVE: dividir primero por \n (saltos reales del textarea)
      // y después por ancho de columna con splitTextToSize
      const paragraphs = normalize(rawText).split('\n');

      paragraphs.forEach((para) => {
        const wrappedLines = pdf.splitTextToSize(para || ' ', contentW);
        wrappedLines.forEach((line) => {
          if (y > 282) { pdf.addPage(); y = marginY; }
          pdf.text(line, marginX, y);
          y += lh;
        });
        // Línea en blanco entre párrafos (si el párrafo original era vacío)
        if (para.trim() === '') y += lh * 0.3;
      });
    };

    const section = (title) => {
      y += 4;
      pdf.setFontSize(7.5);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(20, 20, 20);
      pdf.text(normalize(title).toUpperCase(), marginX, y);
      y += 2;
      pdf.setDrawColor(160, 160, 160);
      pdf.setLineWidth(0.3);
      pdf.line(marginX, y, pageW - marginX, y);
      y += 4;
    };

    // ── Nombre ─────────────────────────────────────────────────────────────
    write(cvData.name, { size: 20, style: 'bold', color: [10, 10, 10], lineGap: 1.3 });

    // ── Contacto ───────────────────────────────────────────────────────────
    write(cvData.contact, { size: 9, color: [100, 100, 100], lineGap: 1.4 });

    // Línea divisoria del header
    y += 2;
    pdf.setDrawColor(20, 20, 20);
    pdf.setLineWidth(0.5);
    pdf.line(marginX, y, pageW - marginX, y);
    y += 6;

    // ── Secciones ──────────────────────────────────────────────────────────
    if (cvData.summary) {
      section('Perfil Profesional');
      write(cvData.summary, { size: 9.5, lineGap: 1.45 });
    }

    if (cvData.leadership) {
      section('Liderazgo y Actividades');
      write(cvData.leadership, { size: 9.5, lineGap: 1.45 });
    }

    if (cvData.experience) {
      section('Experiencia');
      write(cvData.experience, { size: 9.5, lineGap: 1.45 });
    }

    if (cvData.education) {
      section('Educacion');
      write(cvData.education, { size: 9.5, lineGap: 1.45 });
    }

    if (cvData.skills) {
      section('Habilidades e Intereses');
      write(cvData.skills, { size: 9.5, lineGap: 1.45 });
    }

    pdf.save(`CV_Optimizado_${fileName || 'documento'}.pdf`);
    return true;
  };

  return { exportToPdf };
};