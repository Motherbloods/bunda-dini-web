import { useState, useCallback } from "react";
import * as svc from "../services/patientService";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

export function usePatients() {
  const { currentUser } = useAuth();
  const [patients, setPatients] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadByKaderAll = useCallback(async (kaderId) => {
    setLoading(true);
    try {
      const data = await svc.fetchByKaderAll(kaderId);
      setPatients(data);
    } catch {
      toast.error("Gagal memuat data pasien.");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadAll = useCallback(async (bidanId) => {
    setLoading(true);
    try {
      const data = await svc.fetchAll(bidanId);
      setPatients(data);
    } catch {
      toast.error("Gagal memuat data pasien.");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadById = useCallback(
    async (patientId) => {
      setLoading(true);
      try {
        const data = await svc.fetchByIdSecure(patientId, currentUser);
        setSelected(data);
        return data;
      } catch (e) {
        throw new Error(e);
      } finally {
        setLoading(false);
      }
    },
    [currentUser],
  );

  const checkNik = useCallback((nik) => svc.findByNik(nik), []);

  const addPatient = useCallback(async (patient, fotoFile) => {
    setLoading(true);
    try {
      const created = await svc.createPatient(patient, fotoFile);
      setPatients((prev) => [created, ...prev]);
      toast.success("Pasien berhasil didaftarkan");
      return created;
    } catch (e) {
      toast.error(`Gagal menyimpan: ${e.message}`);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const editPatient = useCallback(
    async (patient, fotoFile) => {
      setLoading(true);
      try {
        const updated = await svc.updatePatient(patient, fotoFile);
        setPatients((prev) =>
          prev.map((p) => (p.id === updated.id ? updated : p)),
        );
        if (selected?.id === updated.id) setSelected(updated);
        toast.success("Biodata berhasil diperbarui");
        return updated;
      } catch {
        toast.error("Gagal memperbarui data.");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [selected],
  );

  const transfer = useCallback(async (params) => {
    setLoading(true);
    try {
      await svc.transferKader(params);
      setPatients((prev) => prev.filter((p) => p.id !== params.patientId));
      toast.success("Pasien berhasil ditransfer");
      return true;
    } catch {
      toast.error("Gagal transfer kader.");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const selesai = useCallback(
    async (patientId) => {
      setLoading(true);
      try {
        await svc.tandaiSelesai(patientId);
        setPatients((prev) =>
          prev.map((p) =>
            p.id === patientId ? { ...p, status: "selesai" } : p,
          ),
        );
        if (selected?.id === patientId)
          setSelected((s) => ({ ...s, status: "selesai" }));
        toast.success("🎉 Status berhasil diperbarui");
        return true;
      } catch {
        toast.error("Gagal mengubah status.");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [selected],
  );

  const search = useCallback(
    (query) => {
      const q = query.toLowerCase();
      return patients.filter(
        (p) => p.nama.toLowerCase().includes(q) || p.nik?.includes(q),
      );
    },
    [patients],
  );

  const patientsAktif = patients.filter((p) => p.status === "aktif");
  const patientsSelesai = patients.filter((p) => p.status === "selesai");

  return {
    patients,
    patientsAktif,
    patientsSelesai,
    selected,
    loading,
    loadByKaderAll,
    loadAll,
    loadById,
    checkNik,
    addPatient,
    editPatient,
    transfer,
    selesai,
    search,
  };
}
