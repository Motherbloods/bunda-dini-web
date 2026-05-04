import { useState, useCallback } from "react";
import * as svc from "../services/examinationService";
import toast from "react-hot-toast";

export function useExaminations() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadHistory = useCallback(async (patientId) => {
    setLoading(true);
    try {
      const data = await svc.fetchByPatient(patientId);
      setHistory(data);
    } catch {
      toast.error("Gagal memuat riwayat.");
    } finally {
      setLoading(false);
    }
  }, []);

  return { history, loading, loadHistory };
}
