// src/components/scanner/strategy/pdfParser.js
import * as pdfjsLib from 'pdfjs-dist';

// Configuración del worker de PDF.js usando CDN
//pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();


export const extractTextFromPdf = async (file) => {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let rawLines = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const items = textContent.items;

    // 1. Ordenar verticalmente (Y) y horizontalmente (X)
    items.sort((a, b) => {
      const yDiff = b.transform[5] - a.transform[5];
      // Si la diferencia vertical es mínima, están en la misma línea
      if (Math.abs(yDiff) < 5) return a.transform[4] - b.transform[4];
      return yDiff;
    });

    let currentY = null;
    let currentLine = [];
    
    // 2. Agrupar palabras en líneas
    items.forEach(item => {
      if (!item.str.trim() && item.str !== ' ') return;
      if (currentY === null || Math.abs(currentY - item.transform[5]) > 5) {
        if (currentLine.length > 0) rawLines.push(currentLine);
        currentLine = [item];
        currentY = item.transform[5];
      } else {
        currentLine.push(item);
      }
    });
    if (currentLine.length > 0) rawLines.push(currentLine);
  }

  // 3. Reconstruir espacios y párrafos
  let structuredText = '';
  for (let i = 0; i < rawLines.length; i++) {
    const line = rawLines[i];
    let lineText = '';
    let lastX = null;

    line.forEach(item => {
      if (lastX !== null) {
        const gap = item.transform[4] - lastX;
        // Si hay un espacio horizontal muy grande (ej. texto alineado a la derecha), insertar tabulaciones
        if (gap > 20) lineText += '    '; 
        else if (gap > 4) lineText += ' ';
      }
      lineText += item.str;
      // Estimar el final de la palabra actual
      lastX = item.transform[4] + (item.width || item.str.length * 5);
    });

    structuredText += lineText;

    // Calcular si el salto hacia la siguiente línea es un párrafo nuevo o un salto simple
    if (i < rawLines.length - 1) {
      const currentY = line[0].transform[5];
      const nextY = rawLines[i + 1][0].transform[5];
      if (Math.abs(currentY - nextY) > 16) {
        structuredText += '\n\n'; // Párrafo
      } else {
        structuredText += '\n'; // Salto normal (ej. viñetas seguidas)
      }
    }
  }

  return parseTextToCvData(structuredText);
};

const parseTextToCvData = (text) => {
  const lines = text.split('\n');
  const cv = { name: '', contact: '', summary: '', experience: '', education: '', leadership: '', skills: '' };

  // Extraer Nombre y Contacto (ignorando líneas vacías)
  const nonEmpty = lines.filter(l => l.trim().length > 0);
  cv.name = nonEmpty[0] ? nonEmpty[0].trim() : '';
  cv.contact = nonEmpty[1] ? nonEmpty[1].trim() : '';

  let currentSection = 'summary';

  // Regex exactas para detectar los títulos de tu CV
  const regexes = [
    { key: 'experience', match: /^(experiencia|historial laboral)/i },
    { key: 'education', match: /^(educación|formación|estudios)/i },
    { key: 'leadership', match: /^(liderazgo|actividades)/i },
    { key: 'skills', match: /^(habilidades|intereses|conocimientos)/i },
    { key: 'summary', match: /^(perfil|resumen)/i }
  ];

  for (let i = 2; i < lines.length; i++) {
    const line = lines[i];
    const raw = line.trim();

    // Comprobar si la línea es un título de sección
    let isHeader = false;
    if (raw.length > 2 && raw.length < 40) {
      for (const reg of regexes) {
        if (reg.match.test(raw)) {
          currentSection = reg.key;
          isHeader = true;
          break;
        }
      }
    }

    if (isHeader) continue;

    // Guardar la línea conservando los espacios de la izquierda (indentación/viñetas)
    cv[currentSection] += line.trimEnd() + '\n';
  }

  // Limpiar excesos
  Object.keys(cv).forEach(k => { cv[k] = cv[k].trim(); });
  return cv;
};