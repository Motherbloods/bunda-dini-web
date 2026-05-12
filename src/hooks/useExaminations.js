import { useState, useCallback } from "react";
import * as svc from "../services/examinationService";
import * as rSvc from "../services/ruleService";
import { evaluate, hitungBmi } from "../utils/ruleEngine";
import toast from "react-hot-toast";

export function useExaminations() {
  const [history, setHistory] = useState([]);
  const [lastSaved, setLastSaved] = useState(null);
  const [loading, setLoading] = useState(false);
  const [rules, setRules] = useState([]);
  const [rulesLoaded, setRulesLoaded] = useState(false);

  const loadRules = useCallback(async () => {
    if (rulesLoaded) return rules;
    try {
      const data = await rSvc.fetchActiveRules();
      setRules(data);
      setRulesLoaded(true);
      return data;
    } catch {
      toast.error("Gagal memuat rules.");
      return [];
    }
  }, [rulesLoaded, rules]);

  const loadHistory = useCallback(async (patientId) => {
    setLoading(true);
    try {
      const data = await svc.fetchByPatient(patientId);
      setHistory(data);
      return data;
    } catch {
      toast.error("Gagal memuat riwayat pemeriksaan.");
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const saveExamination = useCallback(
    async ({
      patientId,
      kaderId,
      kaderNama,
      bidanId,
      usiaKehamilan,
      sistolik,
      diastolik,
      beratBadan,
      tinggiBadan,
      lingkarLengan,
      lingkarPerut,
      tfu,
      djj,
      keluhanList,
      keluhanLainnya,
    }) => {
      setLoading(true);
      try {
        const activeRules = await loadRules();
        if (activeRules.length === 0) {
          toast.error("Rules tidak ditemukan. Hubungi administrator.");
          return null;
        }

        const bmi = hitungBmi(beratBadan, tinggiBadan);

        const latest = await svc.fetchLatestByPatient(patientId);
        const kenaikanBb = latest ? beratBadan - latest.beratBadan : 0;

        const result = evaluate({
          sistolik,
          diastolik,
          beratBadan,
          tinggiBadan,
          lingkarLengan,
          lingkarPerut,
          bmi,
          djj,
          rules: activeRules,
        });

        const exam = {
          id: "",
          patientId,
          kaderId,
          kaderNama,
          bidanId,
          usiaKehamilan,
          sistolik,
          diastolik,
          beratBadan,
          tinggiBadan,
          lingkarLengan,
          lingkarPerut: lingkarPerut ?? null,
          tfu: tfu ?? null,
          bmi: parseFloat(bmi.toFixed(2)),
          kenaikanBb: parseFloat(kenaikanBb.toFixed(2)),
          djj,
          keluhanList: keluhanList ?? [],
          keluhanLainnya: keluhanLainnya ?? null,
          catatanBidan: null,
          statusIbu: result.statusIbu,
          statusJanin: result.statusJanin,
          rekomendasi: result.rekomendasi,
          ruleTriggered: result.ruleTriggered,
        };

        const saved = await svc.save(exam);
        setLastSaved(saved);
        setHistory((prev) => [saved, ...prev]);
        return saved;
      } catch (e) {
        toast.error(`Gagal menyimpan pemeriksaan: ${e.message}`);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [loadRules],
  );

  const fetchById = useCallback((id) => svc.fetchById(id), []);

  const fetchByIdSecure = useCallback(async (id, currentUser) => {
    setLoading(true);
    try {
      const data = await svc.fetchByIdSecure(id, currentUser);
      return data;
    } catch (e) {
      throw new Error(e.message || "Gagal mengambil data pemeriksaan");
    } finally {
      setLoading(false);
    }
  }, []);

  const trendBb = [...history].reverse().map((e) => e.beratBadan);
  const trendSistolik = [...history].reverse().map((e) => e.sistolik);
  const trendDiastolik = [...history].reverse().map((e) => e.diastolik);
  const trendDjj = [...history].reverse().map((e) => e.djj);
  const trendLabels = [...history].reverse().map((e) => {
    const d = e.tanggal?.toDate?.() ?? new Date(e.tanggal?.seconds * 1000);
    return `${d.getDate()}/${d.getMonth() + 1}`;
  });

  return {
    history,
    lastSaved,
    loading,
    rulesLoaded,
    loadHistory,
    saveExamination,
    fetchById,
    fetchByIdSecure, // TAMBAHKAN INI
    loadRules,
    trendBb,
    trendSistolik,
    trendDiastolik,
    trendDjj,
    trendLabels,
  };
}
