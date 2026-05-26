import { useState } from 'react';
import api from '../utils/api';
import { ENDPOINTS } from '../constants/endpoints';

export function useOptimizer(file, jobDescription) {
  const [showOptimizer, setShowOptimizer] = useState(false);
  const [cvOptimizations, setCvOptimizations] = useState(null);
  const [loadingOptimizer, setLoadingOptimizer] = useState(false);

  const handleOptimizeCV = async () => {
    if (!file || !jobDescription.trim()) return;

    setLoadingOptimizer(true);
    setCvOptimizations(null);

    try {
      const formData = new FormData();
      formData.append('cv_file', file);
      formData.append('job_description', jobDescription.trim());

      const { data } = await api.post(ENDPOINTS.OPTIMIZE_CV, formData);
      if (data.error) setError(data.error);  // Nota: setError no está aquí, podrías pasarlo como parámetro o usar un contexto global
      else {
        setCvOptimizations(data);
        setShowOptimizer(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingOptimizer(false);
    }
  };

  const closeOptimizer = () => {
    setShowOptimizer(false);
    setCvOptimizations(null);
  };

  return { showOptimizer, cvOptimizations, loadingOptimizer, handleOptimizeCV, closeOptimizer };
}