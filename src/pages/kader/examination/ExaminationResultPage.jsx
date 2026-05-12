import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FileDown } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { useExaminations } from "../../../hooks/useExaminations";
import { usePatients } from "../../../hooks/usePatients";
import PageLayout from "../../../components/layout/PageLayout";
import Header from "../../../components/layout/Header";
import Card, { SectionHeader } from "../../../components/ui/Card";
import Badge, { LilaBadge } from "../../../components/ui/Badge";
import { InlineLoader } from "../../../components/ui/LoadingSpinner";
import { toDisplayWithDay } from "../../../utils/dateFormatter";
import { kategoriBmi } from "../../../utils/ruleEngine";
import { generatePdf } from "../../../utils/pdfGenerator";
import { ROUTES } from "../../../constants/routes";
import toast from "react-hot-toast";

export default function ExaminationResultPage() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const { currentUser, isBidan } = useAuth();
  const { fetchByIdSecure } = useExaminations();
  const { loadById } = usePatients();
  const [exam, setExam] = useState(null);
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [printing, setPrinting] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const examData = await fetchByIdSecure(examId, currentUser);
        setExam(examData);

        const patientData = await loadById(examData.patientId);
        setPatient(patientData);
      } catch (error) {
        const isAccessDenied = error.message?.includes("Akses ditolak");

        toast.error(
          isAccessDenied
            ? "Anda tidak memiliki akses ke data ini."
            : "Gagal memuat data pemeriksaan.",
        );

        navigate(ROUTES.KADER_HOME, { replace: true });
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [examId, currentUser, fetchByIdSecure, loadById, navigate]);

  async function handlePrint() {
    if (!exam || !patient) return;
    setPrinting(true);
    try {
      await generatePdf({ exam, patient, bidanNama: currentUser?.nama ?? "" });
    } catch (e) {
      toast.error("Gagal generate PDF: " + e.message);
    } finally {
      setPrinting(false);
    }
  }

  if (loading) {
    return (
      <PageLayout>
        <InlineLoader />
      </PageLayout>
    );
  }

  if (!exam || !patient) {
    return (
      <PageLayout>
        <p className="text-gray-500">Data tidak ditemukan.</p>
      </PageLayout>
    );
  }

  const tanggal =
    exam.tanggal?.toDate?.() ?? new Date(exam.tanggal?.seconds * 1000);
  const isRisikoTinggi = exam.statusIbu === "risiko_tinggi";

  return (
    <PageLayout>
      <Header title="Hasil Pemeriksaan" backTo={-1} />

      <div className="bg-primary rounded-2xl px-5 py-4 flex items-center justify-between mb-5">
        <div>
          <p className="text-white font-semibold">
            {toDisplayWithDay(tanggal)}
          </p>
          <p className="text-red-200 text-sm">
            {exam.usiaKehamilan} minggu kehamilan
          </p>
        </div>
        <p className="text-red-200 text-sm">Kader: {exam.kaderNama}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card className="p-5">
          <SectionHeader title="Tekanan Darah" />
          <div className="space-y-2">
            <Row label="Sistolik" value={`${exam.sistolik} mmHg`} />
            <Row label="Diastolik" value={`${exam.diastolik} mmHg`} />
          </div>
        </Card>

        <Card className="p-5">
          <SectionHeader title="Antropometri" />
          <div className="space-y-2">
            <Row
              label="Berat Badan"
              value={`${exam.beratBadan} kg`}
              sub={
                exam.kenaikanBb !== 0
                  ? `${exam.kenaikanBb >= 0 ? "+" : ""}${exam.kenaikanBb?.toFixed(1)} kg`
                  : null
              }
            />
            <Row label="Tinggi Badan" value={`${exam.tinggiBadan} cm`} />
            <Row
              label="LILA"
              value={`${exam.lingkarLengan} cm`}
              badge={<LilaBadge lila={exam.lingkarLengan} />}
            />
            <Row
              label="BMI"
              value={`${exam.bmi?.toFixed(1)} — ${kategoriBmi(exam.bmi)}`}
            />
            {exam.lingkarPerut && (
              <Row label="Lingkar Perut" value={`${exam.lingkarPerut} cm`} />
            )}
            {exam.tfu && <Row label="TFU" value={`${exam.tfu} cm`} />}
          </div>
        </Card>

        <Card className="p-5">
          <SectionHeader title="Denyut Jantung Janin" />
          <div className="flex items-center gap-4">
            <div>
              <p className="text-2xl font-bold text-gray-900">{exam.djj}</p>
              <p className="text-sm text-gray-400">bpm</p>
            </div>
            <Badge status={exam.statusJanin} size="md" />
          </div>
          {(exam.keluhanList?.length > 0 || exam.keluhanLainnya) && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-400 mb-2">
                Keluhan Ibu ({exam.keluhanList?.length ?? 0} dipilih)
              </p>
              <div className="flex flex-wrap gap-1.5">
                {exam.keluhanList?.map((k) => (
                  <span
                    key={k}
                    className="text-xs bg-warning-light text-warning border
                               border-orange-200 px-2.5 py-1 rounded-full font-medium"
                  >
                    {k}
                  </span>
                ))}
                {exam.keluhanLainnya && (
                  <span
                    className="text-xs bg-warning-light text-warning border
                                 border-orange-200 px-2.5 py-1 rounded-full
                                 font-medium italic"
                  >
                    Lainnya: {exam.keluhanLainnya}
                  </span>
                )}
              </div>
            </div>
          )}
          {exam.catatanKader && (
            <div className="mt-3">
              <p className="text-xs text-gray-400 mb-1">Catatan Kader</p>
              <p className="text-sm text-gray-700">{exam.catatanKader}</p>
            </div>
          )}
        </Card>

        <Card
          className={`p-5 border-2 ${isRisikoTinggi ? "border-danger/40" : "border-success/30"}`}
        >
          <SectionHeader title="Kesimpulan" />
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-xs text-gray-400 mb-1.5">Kondisi Ibu</p>
              <Badge status={exam.statusIbu} size="lg" />
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1.5">Kondisi Janin</p>
              <Badge status={exam.statusJanin} size="lg" />
            </div>
          </div>
          <div className="border-t border-gray-100 pt-4">
            <p className="text-sm font-bold text-gray-900 mb-2">Rekomendasi</p>
            <div
              className={`rounded-xl p-3.5 space-y-1.5
              ${isRisikoTinggi ? "bg-danger-light" : "bg-success-light"}`}
            >
              {exam.rekomendasi?.map((r, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span
                    className={`text-base leading-none mt-0.5 flex-shrink-0
                    ${isRisikoTinggi ? "text-danger" : "text-success"}`}
                  >
                    •
                  </span>
                  <p className="text-sm text-gray-700">{r}</p>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {isRisikoTinggi && (
        <div
          className="mt-5 bg-danger-light border-2 border-danger/30 rounded-2xl p-4
                        flex items-start gap-3"
        >
          <span className="text-2xl flex-shrink-0">🚨</span>
          <p className="text-danger font-bold">
            Segera konsultasikan ke tenaga kesehatan!
          </p>
        </div>
      )}

      <div className="mt-6 flex flex-col sm:flex-row gap-3 max-w-md">
        {isBidan && (
          <button
            onClick={handlePrint}
            disabled={printing}
            className="flex-1 flex items-center justify-center gap-2 bg-primary text-white
                       py-3.5 rounded-xl font-semibold hover:bg-primary-dark transition-colors
                       disabled:opacity-60"
          >
            {printing ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <FileDown size={18} />
            )}
            {printing ? "Membuat PDF..." : "Cetak PDF"}
          </button>
        )}
      </div>
    </PageLayout>
  );
}

function Row({ label, value, sub, badge }) {
  return (
    <div className="flex items-center py-2 border-b border-gray-50 last:border-0">
      <span className="w-32 text-sm text-gray-400 flex-shrink-0">{label}</span>
      <div className="flex items-center gap-2 flex-1">
        <span className="text-sm font-semibold text-gray-900">{value}</span>
        {sub && <span className="text-xs text-gray-400">({sub})</span>}
        {badge}
      </div>
    </div>
  );
}
