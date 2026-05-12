import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Edit2, Baby, Stethoscope, History } from "lucide-react";
import { usePatients } from "../../hooks/usePatients";
import { useExaminations } from "../../hooks/useExaminations";
import PageLayout from "../../components/layout/PageLayout";
import Header from "../../components/layout/Header";
import Card, { SectionHeader } from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import { ConfirmDialog } from "../../components/ui/Modal";
import { InlineLoader } from "../../components/ui/LoadingSpinner";
import { ClickablePhoto } from "../../components/shared/PhotoViewer";
import { ROUTES } from "../../constants/routes";
import {
  toDisplay,
  ageFromDate,
  usiaKehamilanFormatted,
  hplFormatted,
} from "../../utils/dateFormatter";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";

export default function PatientDetailPage() {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const { loadById, selected: patient, selesai, loading } = usePatients();
  const { loadHistory, history, loading: examLoading } = useExaminations();
  const [confirmSelesai, setConfirmSelesai] = useState(false);
  const [doingSelesai, setDoingSelesai] = useState(false);

  const { isBidan } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await loadById(patientId);

        if (!result) {
          navigate(ROUTES.KADER_HOME, { replace: true });
        }
      } catch (error) {
        const isAccessDenied = error.message?.includes("Akses ditolak");

        toast.error(
          isAccessDenied
            ? "Anda tidak memiliki akses ke pasien ini."
            : "Gagal memuat data pasien.",
        );

        navigate(ROUTES.KADER_HOME, { replace: true });
      }
    };

    fetchData();
    loadHistory(patientId);
  }, [patientId, loadById, loadHistory, navigate]);
  async function handleSelesai() {
    setDoingSelesai(true);
    await selesai(patientId);
    setDoingSelesai(false);
    setConfirmSelesai(false);
  }

  if (loading || !patient)
    return (
      <PageLayout>
        <InlineLoader />
      </PageLayout>
    );

  const hpht =
    patient.hpht?.toDate?.() ?? (patient.hpht ? new Date(patient.hpht) : null);
  const isSelesai = patient.status === "selesai";

  return (
    <PageLayout>
      <Header
        title={patient.nama}
        backTo="/kader"
        action={
          <div className="flex gap-2">
            {!isSelesai && (
              <button
                onClick={() => setConfirmSelesai(true)}
                className="flex items-center gap-1.5 border border-gray-200 rounded-xl px-3 py-2
                           text-sm text-gray-500 hover:bg-gray-50 transition-colors"
              >
                <Baby size={16} /> Sudah Melahirkan
              </button>
            )}
            <button
              onClick={() => navigate(`/kader/patients/${patientId}/edit`)}
              className="flex items-center gap-1.5 border border-gray-200 rounded-xl px-3 py-2
                         text-sm text-gray-500 hover:bg-gray-50 transition-colors"
            >
              <Edit2 size={16} /> Edit
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-5">
          <Card className="p-6 text-center">
            <div className="flex justify-center mb-4">
              <ClickablePhoto
                src={patient.fotoUrl}
                nama={patient.nama}
                size="xl"
              />
            </div>
            <p className="font-bold text-gray-900 text-lg">{patient.nama}</p>
            <div className="mt-2 flex justify-center">
              <Badge status={patient.status} size="md" />
            </div>
            {isSelesai && (
              <p className="text-success text-sm font-medium mt-2">
                🎉 Ibu sudah melahirkan
              </p>
            )}
          </Card>

          {hpht ? (
            <Card className="p-5">
              <SectionHeader title="Data Kehamilan" />
              <InfoRow label="HPHT" value={toDisplay(hpht)} />
              <InfoRow
                label="Usia Kehamilan"
                value={usiaKehamilanFormatted(hpht) ?? "-"}
                highlight
              />
              <InfoRow label="HPL" value={hplFormatted(hpht) ?? "-"} />
            </Card>
          ) : (
            <Card className="p-5">
              <SectionHeader title="Data Kehamilan" />
              <div className="py-3 text-center">
                <p className="text-sm text-gray-400 italic">HPHT belum diisi</p>
                <p className="text-xs text-gray-300 mt-1">
                  Isi HPHT di Edit Biodata untuk melihat usia kehamilan dan HPL
                </p>
              </div>
            </Card>
          )}

          <Card className="p-5">
            <SectionHeader title="Data Diri" />
            <InfoRow label="NIK" value={patient.nik} />
            <InfoRow label="Tempat Lahir" value={patient.tempatLahir} />
            <InfoRow
              label="Tgl Lahir"
              value={toDisplay(
                patient.tanggalLahir?.toDate?.() ?? patient.tanggalLahir,
              )}
            />
            <InfoRow
              label="Usia"
              value={ageFromDate(
                patient.tanggalLahir?.toDate?.() ?? patient.tanggalLahir,
              )}
            />
            <InfoRow label="Gol Darah" value={patient.golonganDarah} />
            <InfoRow label="No HP" value={patient.noHp} />
            <InfoRow label="Alamat" value={patient.alamat} />
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-5">
          {!isSelesai && (
            <div className="flex gap-3">
              {!isBidan && (
                <button
                  onClick={() =>
                    navigate(`/kader/patients/${patientId}/examine`)
                  }
                  className="flex-1 flex items-center justify-center gap-2 bg-primary ..."
                >
                  <Stethoscope size={20} /> Periksa Sekarang
                </button>
              )}
              <button
                onClick={() => navigate(`/kader/patients/${patientId}/history`)}
                className="flex items-center justify-center gap-2 border-2 border-primary text-primary
                           px-5 py-3.5 rounded-xl font-semibold hover:bg-primary-pale transition-colors"
              >
                <History size={20} /> Riwayat & Grafik
              </button>
            </div>
          )}

          {isSelesai && (
            <button
              onClick={() => navigate(`/kader/patients/${patientId}/history`)}
              className="w-full flex items-center justify-center gap-2 border-2 border-gray-200
                         text-gray-500 py-3.5 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
            >
              <History size={20} /> Lihat Riwayat Pemeriksaan
            </button>
          )}

          <Card className="p-5">
            <SectionHeader title="Pemeriksaan Terakhir" />
            {examLoading ? (
              <InlineLoader />
            ) : history.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">
                Belum ada pemeriksaan
              </p>
            ) : (
              <div className="space-y-3">
                {history.slice(0, 3).map((exam) => (
                  <ExamRow key={exam.id} exam={exam} patientId={patientId} />
                ))}
                {history.length > 3 && (
                  <button
                    onClick={() =>
                      navigate(`/kader/patients/${patientId}/history`)
                    }
                    className="text-sm text-primary font-medium hover:underline"
                  >
                    Lihat semua {history.length} pemeriksaan →
                  </button>
                )}
              </div>
            )}
          </Card>
        </div>
      </div>

      <ConfirmDialog
        isOpen={confirmSelesai}
        onClose={() => setConfirmSelesai(false)}
        onConfirm={handleSelesai}
        title="Tandai Sudah Melahirkan"
        message={`${patient.nama} sudah melahirkan dan tidak perlu diperiksa lagi? Status akan berubah menjadi Selesai.`}
        confirmLabel="Ya, Sudah Melahirkan"
        loading={doingSelesai}
      />
    </PageLayout>
  );
}

function InfoRow({ label, value, highlight }) {
  return (
    <div className="flex items-start py-2.5 border-b border-gray-50 last:border-0">
      <span className="w-32 text-sm text-gray-400 flex-shrink-0">{label}</span>
      <span
        className={`text-sm flex-1 ${highlight ? "font-bold text-primary" : "font-medium text-gray-900"}`}
      >
        {value || "-"}
      </span>
    </div>
  );
}

function ExamRow({ exam, patientId }) {
  const navigate = useNavigate();
  const tanggal = exam.tanggal?.toDate?.() ?? new Date(exam.tanggal);
  return (
    <div
      onClick={() => navigate(`/shared/examine/result/${exam.id}`)}
      className="flex items-center justify-between p-3 rounded-xl border border-gray-100
                 hover:border-primary/30 hover:bg-gray-50 cursor-pointer transition-all"
    >
      <div>
        <p className="text-sm font-semibold text-gray-900">
          {toDisplay(tanggal)}
        </p>
        <p className="text-xs text-gray-400">
          {exam.usiaKehamilan} minggu · {exam.kaderNama}
        </p>
      </div>
      <Badge status={exam.statusIbu} />
    </div>
  );
}
