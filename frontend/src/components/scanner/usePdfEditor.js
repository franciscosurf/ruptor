// src/hooks/usePdfEditor.js
import { useState, useRef, useCallback } from 'react';

export const usePdfEditor = (containerWidth = 450) => {
  const [edits, setEdits] = useState({});
  const [activeEdit, setActiveEdit] = useState(null);
  const pageRef = useRef(null);

  const handlePageClick = useCallback((editInfo) => {
    // editInfo viene desde PdfViewer con: index, pageNum, initialText, leftPx, topPx, widthPx, heightPx, fontSizePx, fontFamily, fontWeight, fontColor
    const key = `p${editInfo.pageNum}_idx${editInfo.index}`;
    setActiveEdit({
      ...editInfo,
      key,
      initialText: edits[key]?.text || editInfo.initialText,
    });
  }, [edits]);

  const handleEditBlur = useCallback((e) => {
    if (!activeEdit) return;
    const newText = e.target.value;
    if (newText.trim() !== '') {
      setEdits(prev => ({
        ...prev,
        [activeEdit.key]: {
          text: newText,
          pageNum: activeEdit.pageNum,
          leftPx: activeEdit.leftPx,
          topPx: activeEdit.topPx,
          widthPx: activeEdit.widthPx,
          heightPx: activeEdit.heightPx,
          fontSizePx: activeEdit.fontSizePx,
          fontFamily: activeEdit.fontFamily,
          fontWeight: activeEdit.fontWeight,
          fontColor: activeEdit.fontColor,
        }
      }));
    } else if (edits[activeEdit.key]) {
      setEdits(prev => {
        const newEdits = { ...prev };
        delete newEdits[activeEdit.key];
        return newEdits;
      });
    }
    setActiveEdit(null);
  }, [activeEdit, edits]);

  const clearAllEdits = useCallback(() => {
    if (window.confirm('¿Eliminar todos los cambios realizados en el CV?')) {
      setEdits({});
    }
  }, []);

  const onRenderTextLayerSuccess = useCallback(() => {
    if (!pageRef.current) return;
    // Obtener número de página actual del DOM (atributo data-page-number)
    const pageElement = pageRef.current.querySelector('.react-pdf__Page');
    const currentPage = pageElement ? parseInt(pageElement.getAttribute('data-page-number')) : 1;
    const spans = Array.from(pageRef.current.querySelectorAll('.react-pdf__Page__textContent span'));
    spans.forEach((span, idx) => {
      const editKey = `p${currentPage}_idx${idx}`;
      span.classList.add('editable-pdf-text');
      if (edits[editKey]) {
        span.textContent = edits[editKey].text;
        span.style.backgroundColor = '#fef3c7';
        span.style.color = '#7c3aed';
        span.style.fontWeight = '500';
        span.style.boxShadow = '0 0 0 1px #7c3aed';
      } else {
        span.style.backgroundColor = '';
        span.style.color = '';
        span.style.fontWeight = '';
        span.style.boxShadow = '';
      }
    });
  }, [edits]);

  return {
    edits,
    activeEdit,
    pageRef,
    handlePageClick,
    handleEditBlur,
    clearAllEdits,
    onRenderTextLayerSuccess,
  };
};