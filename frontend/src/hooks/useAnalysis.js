import { useState } from 'react';
import api from '../utils/api';
import { API_BASE_URL, ENDPOINTS } from '../constants/endpoints';

export function useAnalysis() {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [analysisMode, setAnalysisMode] = useState('balanced');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileName(selectedFile.name);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) { setError('Sube un CV (.pdf, .docx o .txt)'); return; }
    if (!jobDescription.trim()) { setError('Escribe la descripción del puesto'); return; }

    setLoading(true);
    setError(null);
    setResult(null);

    const blob = new Blob([file], { type: 'text/plain' });
    const txtFile = new File([blob], 'cv_original.txt', { type: 'text/plain' });

    const formData = new FormData();
    formData.append('cv_file', file);
    formData.append('job_description', jobDescription.trim());
    formData.append('mode', analysisMode);

    try {
      const { data } = await api.post(ENDPOINTS.ANALYZE_CV, formData);
      if (data.error) setError(data.error);
      else setResult(data);
    } catch (err) {
      setError('No se pudo conectar con el servidor');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportReport = async () => {
    if (!file || !jobDescription.trim()) {
      setError('Primero realiza un análisis completo');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('cv_file', file);
      formData.append('job_description', jobDescription.trim());
      formData.append('format', 'text');

      const { data } = await api.post(ENDPOINTS.EXPORT_REPORT, formData);
      const blob = new Blob([data.report], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ats_report_${new Date().toISOString().slice(0,19)}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError('Error al exportar reporte: ' + err.message);
    }
  };
  
  const analyzeWithCvText = async (cvText, jobDesc, mode) => {
    setLoading(true);
    try {
      // 1. Crear un archivo .txt a partir del texto plano
      const blob = new Blob([cvText], { type: 'text/plain' });
      const txtFile = new File([blob], 'cv_editado.txt', { type: 'text/plain' });

      // 2. Construir FormData con el mismo campo que el endpoint espera
      const formData = new FormData();
      formData.append('cv_file', txtFile);          // ← archivo .txt
      formData.append('job_description', jobDesc);
      if (mode) formData.append('mode', mode);

      // 3. Usar el mismo endpoint ANALYZE_CV
      const response = await fetch(`${API_BASE_URL}${ENDPOINTS.ANALYZE_CV}`, {
        method: 'POST',
        body: formData,
      });

      console.log('📄 Texto enviado al backend:\n', cvText);

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Error en reanálisis:', error);
      alert('No se pudo reanalizar el CV. Revisa que el backend acepte archivos .txt.');
    } finally {
      setLoading(false);
    }
  };

  const resetAnalysis = () => {
    setFile(null);
    setFileName('');
    setJobDescription('');
    setResult(null);
    setError(null);
    setLoading(false);
  };

  return {
    file, fileName, jobDescription, analysisMode, result, loading, error,
    handleFileChange, setJobDescription, setAnalysisMode, handleSubmit, handleExportReport,
    setResult, analyzeWithCvText, resetAnalysis
  };
}