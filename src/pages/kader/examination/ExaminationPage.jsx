import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CheckCircle2, ChevronLeft, ChevronRight, Save } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { usePatients } from "../../../hooks/usePatients";
import { useExaminations } from "../../../hooks/useExaminations";
import PageLayout from "../../../components/layout/PageLayout";
import Header from "../../../components/layout/Header";
import Modal from "../../../components/ui/Modal";
import { BlockButton } from "../../../components/ui/Button";
import { usiaKehamilanMinggu } from "../../../utils/dateFormatter";
import StepTensi from "./StepTensi";
import StepAntropometri from "./StepAntropometri";
import StepDjj from "./StepDjj";

const STEPS = ["Tekanan Darah", "Antropometri", "DJJ & Keluhan"];

export default function ExaminationPage() {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const { currentUser, isBidan } = useAuth();
  const { loadById, selected: patient } = usePatients();
  const { saveExamination, loading, rulesLoaded, loadRules } =
    useExaminations();

  const [step, setStep] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [savedId, setSavedId] = useState(null);

  // Form state
  const [form, setForm] = useState({
    // Step 1 — Tensi
    sistolik: "",
    diastolik: "",
    // Step 2 — Antropometri
    beratBadan: "",
    tinggiBadan: "",
    lingkarLengan: "",
    lingkarPerut: "",
    // Step 3 — DJJ
    djj: "",
    keluhanIbu: "",
    catatanKader: "",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadById(patientId);
    loadRules();
  }, [patientId]);

  const update = useCallback((field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }, []);

  function validate() {
    const e = {};
    if (step === 0) {
      if (!form.sistolik) e.sistolik = "Wajib diisi";
      if (!form.diastolik) e.diastolik = "Wajib diisi";
      const s = parseInt(form.sistolik),
        d = parseInt(form.diastolik);
      if (s && (s < 60 || s > 250)) e.sistolik = "Nilai 60–250";
      if (d && (d < 40 || d > 180)) e.diastolik = "Nilai 40–180";
    }
    if (step === 1) {
      if (!form.beratBadan) e.beratBadan = "Wajib diisi";
      if (!form.tinggiBadan) e.tinggiBadan = "Wajib diisi";
      if (!form.lingkarLengan) e.lingkarLengan = "Wajib diisi";
    }
    if (step === 2) {
      if (!form.djj) e.djj = "Wajib diisi";
      const d = parseInt(form.djj);
      if (d && (d < 50 || d > 200)) e.djj = "Nilai 50–200";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleNext() {
    if (!validate()) return;
    if (step < 2) {
      setStep(step + 1);
    } else {
      handleSave();
    }
  }

  async function handleSave() {
    if (!validate()) return;
    if (!rulesLoaded) {
      alert("Rules masih dimuat, coba lagi sebentar.");
      return;
    }

    const hpht =
      patient?.hpht?.toDate?.() ??
      (patient?.hpht ? new Date(patient.hpht) : null);
    const usiaKehamilan = usiaKehamilanMinggu(hpht) ?? 0;

    const saved = await saveExamination({
      patientId,
      kaderId: currentUser.id,
      kaderNama: currentUser.nama,
      bidanId: isBidan ? currentUser.id : (currentUser.createdBy ?? ""),
      usiaKehamilan,
      sistolik: parseInt(form.sistolik),
      diastolik: parseInt(form.diastolik),
      beratBadan: parseFloat(form.beratBadan),
      tinggiBadan: parseFloat(form.tinggiBadan),
      lingkarLengan: parseFloat(form.lingkarLengan),
      lingkarPerut: form.lingkarPerut ? parseFloat(form.lingkarPerut) : null,
      djj: parseInt(form.djj),
      keluhanIbu: form.keluhanIbu || null,
      catatanKader: form.catatanKader || null,
    });

    if (saved) {
      setSavedId(saved.id);
      setShowSuccess(true);
    }
  }

  return (
    <PageLayout>
      <Header
        title={`Pemeriksaan${patient ? ` — ${patient.nama}` : ""}`}
        backTo={-1}
      />

      {patient?.hpht &&
        (() => {
          const hpht = patient.hpht?.toDate?.() ?? new Date(patient.hpht);
          const usia = usiaKehamilanMinggu(hpht);
          return usia !== null ? (
            <div
              className="mb-5 bg-primary-pale border border-primary/20 rounded-xl
                          px-4 py-2.5 flex items-center gap-2"
            >
              <span className="text-primary text-lg">🤰</span>
              <span className="text-primary font-semibold text-sm">
                Usia kehamilan: {usia} minggu
              </span>
            </div>
          ) : null;
        })()}

      <StepIndicator steps={STEPS} current={step} />

      <div className="mt-6 max-w-lg mx-auto">
        {step === 0 && (
          <StepTensi
            sistolik={form.sistolik}
            onSistolik={(v) => update("sistolik", v)}
            diastolik={form.diastolik}
            onDiastolik={(v) => update("diastolik", v)}
            errors={errors}
          />
        )}
        {step === 1 && (
          <StepAntropometri
            beratBadan={form.beratBadan}
            onBb={(v) => update("beratBadan", v)}
            tinggiBadan={form.tinggiBadan}
            onTb={(v) => update("tinggiBadan", v)}
            lingkarLengan={form.lingkarLengan}
            onLila={(v) => update("lingkarLengan", v)}
            lingkarPerut={form.lingkarPerut}
            onLp={(v) => update("lingkarPerut", v)}
            errors={errors}
            patientId={patientId}
          />
        )}
        {step === 2 && (
          <StepDjj
            djj={form.djj}
            onDjj={(v) => update("djj", v)}
            keluhanIbu={form.keluhanIbu}
            onKeluhan={(v) => update("keluhanIbu", v)}
            catatanKader={form.catatanKader}
            onCatatan={(v) => update("catatanKader", v)}
            errors={errors}
          />
        )}

        <div className="flex gap-3 mt-6">
          {step > 0 && (
            <button
              onClick={() => setStep(step - 1)}
              className="flex-1 flex items-center justify-center gap-2 border-2 border-gray-200
                         rounded-xl py-3 font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <ChevronLeft size={18} /> Kembali
            </button>
          )}
          <button
            onClick={handleNext}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 bg-primary text-white
                       rounded-xl py-3 font-semibold hover:bg-primary-dark transition-colors
                       disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : step < 2 ? (
              <>
                {" "}
                Lanjut <ChevronRight size={18} />{" "}
              </>
            ) : (
              <>
                {" "}
                <Save size={18} /> Simpan Pemeriksaan{" "}
              </>
            )}
          </button>
        </div>
      </div>

      <Modal
        isOpen={showSuccess}
        onClose={() => {}}
        title=""
        size="sm"
        closeOnBackdrop={false}
      >
        <div className="text-center">
          <div className="w-16 h-16 bg-success-light rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={36} className="text-success" />
          </div>
          <h3 className="text-lg font-bold text-success mb-2">
            ✅ Pemeriksaan Berhasil Disimpan!
          </h3>
          <p className="text-gray-500 text-sm mb-6">
            Data telah tersimpan ke sistem.
          </p>
          <div className="space-y-3">
            {isBidan && (
              <BlockButton
                onClick={() => navigate(`/shared/examine/result/${savedId}`)}
              >
                Lihat Hasil & Cetak PDF
              </BlockButton>
            )}
            <BlockButton
              variant={isBidan ? "outline" : "primary"}
              onClick={() => navigate(`/kader/patients/${patientId}`)}
            >
              Kembali ke Detail Pasien
            </BlockButton>
          </div>
        </div>
      </Modal>
    </PageLayout>
  );
}

function StepIndicator({ steps, current }) {
  return (
    <div className="flex items-center">
      {steps.map((label, i) => (
        <div key={i} className="flex items-center flex-1 last:flex-none">
          <div className="flex flex-col items-center">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold
              transition-all duration-300
              ${
                i < current
                  ? "bg-success text-white"
                  : i === current
                    ? "bg-primary text-white ring-4 ring-primary/20"
                    : "bg-gray-100 text-gray-400"
              }`}
            >
              {i < current ? <CheckCircle2 size={18} /> : i + 1}
            </div>
            <span
              className={`text-xs mt-1 font-medium whitespace-nowrap
              ${i === current ? "text-primary" : "text-gray-400"}`}
            >
              {label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div
              className={`flex-1 h-0.5 mx-2 mb-5 transition-all duration-300
              ${i < current ? "bg-success" : "bg-gray-200"}`}
            />
          )}
        </div>
      ))}
    </div>
  );
}
