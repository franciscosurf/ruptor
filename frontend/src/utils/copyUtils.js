/**
 * Muestra un toast flotante en la parte inferior central
 * @param {string} message
 * @param {number} duration
 */
function showToast(message, duration = 2000) {
  // Eliminar toast anterior
  const oldToast = document.querySelector('.global-copy-toast');
  if (oldToast) oldToast.remove();

  const toast = document.createElement('div');
  toast.className = 'global-copy-toast';
  toast.textContent = message;
  Object.assign(toast.style, {
    position: 'fixed',
    bottom: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: '#1f2937',
    color: 'white',
    padding: '8px 16px',
    borderRadius: '9999px',
    fontSize: '12px',
    zIndex: 9999,
    boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
    pointerEvents: 'none',
    whiteSpace: 'nowrap',
    fontFamily: 'sans-serif',
    animation: 'fadeInUpCopy 0.2s ease-out',
  });
  document.body.appendChild(toast);

  // Añadir keyframes si no existen
  if (!document.querySelector('#copy-toast-keyframes')) {
    const style = document.createElement('style');
    style.id = 'copy-toast-keyframes';
    style.textContent = `
      @keyframes fadeInUpCopy {
        from { opacity: 0; transform: translateX(-50%) translateY(20px); }
        to { opacity: 1; transform: translateX(-50%) translateY(0); }
      }
    `;
    document.head.appendChild(style);
  }

  setTimeout(() => toast.remove(), duration);
}

/**
 * Copia un texto al portapapeles y muestra un toast
 * @param {string} text
 */
export async function copyText(text) {
  if (!text) return;
  try {
    await navigator.clipboard.writeText(text);
    const displayText = text.length > 50 ? text.slice(0, 47) + '...' : text;
    showToast(`📋 Copiado: "${displayText}"`);
  } catch (err) {
    console.error('Error al copiar:', err);
    showToast('❌ No se pudo copiar');
  }
}

/**
 * Maneja el evento click para copiar el texto del elemento (o de un hijo opcional)
 * @param {Event} event - Evento click
 * @param {Object} options - { childSelector?: string }
 */
export async function handleCopy(event, options = {}) {
  const { childSelector = null } = options;
  let target = event.currentTarget; // el elemento que tiene el listener
  if (childSelector && target) {
    const child = target.querySelector(childSelector);
    if (child) target = child;
  }
  const text = target?.textContent?.trim();
  if (text) await copyText(text);
  else console.warn('No se encontró texto para copiar');
}

/**
 * Configura automáticamente todos los elementos con data-copytool
 */
export function setupDataCopyTool() {
  document.querySelectorAll('[data-copytool]').forEach(el => {
    if (el.getAttribute('data-copy-listener')) return;
    el.setAttribute('data-copy-listener', 'true');
    el.addEventListener('click', (event) => {
      const childSelector = el.getAttribute('data-copy-child') || null;
      handleCopy(event, { childSelector });
    });
  });
}