import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Stethoscope, History } from "lucide-react";
import { usePatients } from "../../hooks/usePatients";
import { useExaminations } from "../../hooks/useExaminations";
import PageLayout from "../../components/layout/PageLayout";
import Header from "../../components/layout/Header";
import Card, { SectionHeader } from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import { ClickablePhoto } from "../../components/shared/PhotoViewer";
import { InlineLoader } from "../../components/ui/LoadingSpinner";
import {
  toDisplay,
  ageFromDate,
  usiaKehamilanMinggu,
  taksiranPersalinan,
} from "../../utils/dateFormatter";
import { buildPath, ROUTES } from "../../constants/routes";
import toast from "react-hot-toast";

export default function PatientDetailBidanPage() {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const { loadById, selected: patient, loading } = usePatients();
  const { loadHistory, history, loading: examLoading } = useExaminations();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await loadById(patientId);

        // kalau data tidak ditemukan
        if (!result) {
          navigate(ROUTES.BIDAN_DASHBOARD, { replace: true });
          return;
        }

        // load history setelah patient berhasil
        await loadHistory(patientId);
      } catch (error) {
        const isAccessDenied = error.message?.includes("Akses ditolak");

        toast.error(
          isAccessDenied
            ? "Anda tidak memiliki akses ke pasien ini."
            : "Gagal memuat data pasien.",
        );

        navigate(ROUTES.BIDAN_DASHBOARD, { replace: true });
      }
    };

    fetchData();
  }, [patientId, loadById, loadHistory, navigate]);

  if (loading || !patient)
    return (
      <PageLayout>
        <InlineLoader />
      </PageLayout>
    );

  const hpht =
    patient.hpht?.toDate?.() ?? (patient.hpht ? new Date(patient.hpht) : null);
  const usia = usiaKehamilanMinggu(hpht);
  const taksiran = taksiranPersalinan(hpht);
  const isSelesai = patient.status === "selesai";

  // Kelompokkan riwayat per kader
  const grouped = history.reduce((acc, e) => {
    const key = e.kaderId;
    if (!acc[key]) acc[key] = { kaderNama: e.kaderNama, exams: [] };
    acc[key].exams.push(e);
    return acc;
  }, {});

  return (
    <PageLayout>
      <Header
        title={patient.nama}
        backTo={-1}
        action={
          <div className="flex gap-2">
            <button
              onClick={() => navigate(buildPath.examHistory(patientId))}
              className="flex items-center gap-1.5 border-2 border-primary text-primary
                         rounded-xl px-4 py-2.5 text-sm font-semibold hover:bg-primary-pale transition-colors"
            >
              <History size={16} /> Riwayat & Grafik
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-5">
          <Card className="p-6 text-center">
            <div className="flex justify-center mb-4">
              <ClickablePhoto
                src={patient.fotoUrl}
                nama={patient.nama}
                size="xl"
              />
            </div>
            <p className="font-bold text-gray-900 text-lg">{patient.nama}</p>
            <div className="flex justify-center mt-2">
              <Badge status={patient.status} size="md" />
            </div>
          </Card>

          {hpht && (
            <Card className="p-5">
              <SectionHeader title="Data Kehamilan" />
              <InfoRow label="HPHT" value={toDisplay(hpht)} />
              <InfoRow label="Taksiran" value={toDisplay(taksiran)} />
              <InfoRow
                label="Usia Kehamilan"
                value={`${usia} minggu`}
                highlight
              />
            </Card>
          )}

          <Card className="p-5">
            <SectionHeader title="Data Diri" />
            <InfoRow label="NIK" value={patient.nik} />
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

        <div className="lg:col-span-2">
          <Card className="p-5">
            <SectionHeader title="Riwayat Pemeriksaan per Kader" />
            {examLoading ? (
              <InlineLoader />
            ) : history.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">
                Belum ada pemeriksaan
              </p>
            ) : (
              <div className="space-y-6 mt-4">
                {Object.entries(grouped).map(
                  ([kaderId, { kaderNama, exams }]) => {
                    const dates = exams
                      .map(
                        (e) =>
                          e.tanggal?.toDate?.() ??
                          new Date(e.tanggal?.seconds * 1000),
                      )
                      .sort((a, b) => a - b);
                    return (
                      <div key={kaderId}>
                        <p className="text-sm font-bold text-gray-700 mb-2">
                          Kader: {kaderNama}
                          <span className="text-xs font-normal text-gray-400 ml-2">
                            ({toDisplay(dates[0])} –{" "}
                            {toDisplay(dates[dates.length - 1])})
                          </span>
                        </p>
                        <div className="space-y-2">
                          {exams.map((e) => {
                            const d =
                              e.tanggal?.toDate?.() ??
                              new Date(e.tanggal?.seconds * 1000);
                            return (
                              <div
                                key={e.id}
                                onClick={() =>
                                  navigate(buildPath.examResult(e.id))
                                }
                                className="flex items-center justify-between p-3 rounded-xl
                                         border border-gray-100 hover:border-primary/30
                                         hover:bg-gray-50 cursor-pointer transition-all"
                              >
                                <div>
                                  <p className="text-sm font-semibold text-gray-900">
                                    {toDisplay(d)}
                                  </p>
                                  <p className="text-xs text-gray-400">
                                    {e.usiaKehamilan} minggu
                                  </p>
                                </div>
                                <Badge status={e.statusIbu} />
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  },
                )}
              </div>
            )}
          </Card>
        </div>
      </div>
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
