// src/components/scanner/strategy/useTemplateExport.js
import html2pdf from 'html2pdf.js';

export const useTemplateExport = () => {
  const exportToPdf = async (elementRef, fileName) => {
    const container = elementRef.current;
    if (!container) return false;

    // Guardar los elementos originales para restaurarlos después
    const inputs = Array.from(container.querySelectorAll('input, textarea'));
    const replacements = [];

    // Reemplazar cada input/textarea por un div con el mismo texto
    inputs.forEach(el => {
      const div = document.createElement('div');
      // Copiar clases y estilos inline
      div.className = el.className;
      // Copiar estilos computados relevantes
      const computed = window.getComputedStyle(el);
      div.style.cssText = computed.cssText;
      // Asegurar que respeta saltos de línea y tiene altura automática
      div.style.whiteSpace = 'pre-wrap';
      div.style.wordBreak = 'break-word';
      div.style.height = 'auto';
      div.style.minHeight = `${el.offsetHeight}px`; // Mantener altura aproximada
      div.textContent = el.value || el.textContent;
      
      // Reemplazar en el DOM
      el.parentNode.replaceChild(div, el);
      replacements.push({ original: el, replacement: div });
    });

    // Forzar un reflow para que los cambios se apliquen
    container.offsetHeight;

    // Configuración de html2pdf
    const opt = {
      margin: 10,
      filename: `CV_Optimizado_${fileName || 'documento'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2,
        useCORS: true,
        logging: false,
        // Asegurar que captura el contenido completo
        windowWidth: container.scrollWidth,
        windowHeight: container.scrollHeight
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    let success = true;
    try {
      await html2pdf().set(opt).from(container).save();
    } catch (error) {
      console.error('Error al exportar:', error);
      success = false;
    } finally {
      // Restaurar los elementos originales
      replacements.forEach(({ original, replacement }) => {
        replacement.parentNode.replaceChild(original, replacement);
      });
    }
    return success;
  };

  return { exportToPdf };
};