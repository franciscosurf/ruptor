// src/components/scanner/strategy/useCvData.js
import { useState, useCallback } from 'react';
import { extractTextFromPdf } from './pdfParser';

export const useCvData = () => {
  const [cvData, setCvData] = useState(null);
  const [isExtracting, setIsExtracting] = useState(false);

  const loadPdf = useCallback(async (file) => {
    if (!file) return;
    setIsExtracting(true);
    try {
      const parsedData = await extractTextFromPdf(file);
      setCvData(parsedData);
    } catch (error) {
      console.error("Error:", error);
      setCvData({ name: '', contact: '', summary: '', leadership: '', experience: '', education: '', skills: '' });
    } finally {
      setIsExtracting(false);
    }
  }, []);

  const updateSection = useCallback((section, field, value) => {
    setCvData(prev => ({ ...prev, [section]: value }));
  }, []);

  return { cvData, setCvData, loadPdf, isExtracting, updateSection };
};