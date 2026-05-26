import { useState } from 'react';
import api from '../utils/api';
import { ENDPOINTS } from '../constants/endpoints';

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

  return {
    file, fileName, jobDescription, analysisMode, result, loading, error,
    handleFileChange, setJobDescription, setAnalysisMode, handleSubmit, handleExportReport,
    setResult
  };
}