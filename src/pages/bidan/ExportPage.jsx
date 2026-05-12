import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { fetchByDateRange } from "../../services/examinationService";
import { fetchAll } from "../../services/patientService";
import { generatePdf, generateRekapPdf } from "../../utils/pdfGenerator";
import PageLayout from "../../components/layout/PageLayout";
import Header from "../../components/layout/Header";
import Card, { SectionHeader } from "../../components/ui/Card";
import { BlockButton } from "../../components/ui/Button";
import { toDisplay, toFileStamp } from "../../utils/dateFormatter";
import { FileDown, Table2, FileText } from "lucide-react";
import * as XLSX from "xlsx";
import toast from "react-hot-toast";

export default function ExportPage() {
  const { currentUser } = useAuth();
  const [from, setFrom] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().split("T")[0];
  });
  const [to, setTo] = useState(() => new Date().toISOString().split("T")[0]);
  const [loadingXlsx, setLoadingXlsx] = useState(false);
  const [loadingPdf, setLoadingPdf] = useState(false);

  async function getExamsAndPatients() {
    const exams = await fetchByDateRange(
      new Date(from),
      new Date(to),
      currentUser.id,
    );
    const patients = await fetchAll(currentUser.id);
    const patMap = Object.fromEntries(patients.map((p) => [p.id, p]));
    return { exams, patMap };
  }

  async function handleExcel() {
    setLoadingXlsx(true);
    try {
      const { exams, patMap } = await getExamsAndPatients();
      if (exams.length === 0) {
        toast.error("Tidak ada data di rentang tanggal ini.");
        return;
      }

      const rows = exams.map((e, i) => {
        const p = patMap[e.patientId] ?? {};
        const d = e.tanggal?.toDate?.() ?? new Date(e.tanggal?.seconds * 1000);
        return {
          No: i + 1,
          "Nama Ibu": p.nama ?? "-",
          NIK: p.nik ?? "-",
          Kader: e.kaderNama,
          Tanggal: toDisplay(d),
          "Usia Kehamilan": e.usiaKehamilan,
          "Sistolik (mmHg)": e.sistolik,
          "Diastolik (mmHg)": e.diastolik,
          "Status Tensi":
            e.sistolik >= 140 || e.diastolik >= 90
              ? "Hipertensi"
              : e.sistolik < 90 || e.diastolik < 60
                ? "Hipotensi"
                : "Normal",
          "BB (kg)": e.beratBadan,
          "TB (cm)": e.tinggiBadan,
          "LILA (cm)": e.lingkarLengan,
          BMI: e.bmi?.toFixed(1),
          "Status LILA": e.lingkarLengan < 23.5 ? "KEK" : "Normal",
          "DJJ (bpm)": e.djj,
          "Status DJJ":
            e.statusJanin === "djj_rendah"
              ? "DJJ Rendah"
              : e.statusJanin === "djj_tinggi"
                ? "DJJ Tinggi"
                : "Normal",
          "Status Ibu":
            e.statusIbu === "risiko_tinggi"
              ? "Risiko Tinggi"
              : e.statusIbu === "perlu_perhatian"
                ? "Perlu Perhatian"
                : "Normal",
          "Status Janin": e.statusJanin === "normal" ? "Normal" : e.statusJanin,
          Rekomendasi: e.rekomendasi?.join("; "),
          "Keluhan Ibu": e.keluhanIbu ?? "-",
          "Catatan Bidan": e.catatanBidan ?? "-",
        };
      });

      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();

      // Style header
      const range = XLSX.utils.decode_range(ws["!ref"]);
      for (let c = range.s.c; c <= range.e.c; c++) {
        const cell = ws[XLSX.utils.encode_cell({ r: 0, c })];
        if (cell) {
          cell.s = {
            fill: { fgColor: { rgb: "C62828" } },
            font: { color: { rgb: "FFFFFF" }, bold: true },
          };
        }
      }
      ws["!cols"] = Array(21).fill({ wch: 18 });

      XLSX.utils.book_append_sheet(wb, ws, "Rekap Pemeriksaan");
      XLSX.writeFile(wb, `Rekap_BundaDini_${toFileStamp(new Date())}.xlsx`);
      toast.success("File Excel berhasil diunduh");
    } catch (e) {
      toast.error("Gagal ekspor Excel: " + e.message);
    } finally {
      setLoadingXlsx(false);
    }
  }

  async function handlePdf() {
    setLoadingPdf(true);
    try {
      const { exams, patMap } = await getExamsAndPatients();
      if (exams.length === 0) {
        toast.error("Tidak ada data di rentang tanggal ini.");
        return;
      }

      // Generate PDF rekap untuk SEMUA pemeriksaan dalam range
      await generateRekapPdf({
        exams,
        patMap,
        namaPuskesmas: currentUser?.namaPuskesmas || "PUSKESMAS",
        bidanNama: currentUser?.nama ?? "",
        from: new Date(from),
        to: new Date(to),
      });

      toast.success(`PDF rekap ${exams.length} pemeriksaan berhasil diunduh`);
    } catch (e) {
      toast.error("Gagal ekspor PDF: " + e.message);
    } finally {
      setLoadingPdf(false);
    }
  }

  return (
    <PageLayout>
      <Header title="Export Data" subtitle="Khusus Bidan" />

      <div className="max-w-xl mx-auto space-y-6">
        <Card className="p-6">
          <SectionHeader title="Filter Periode" />
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">
                Tanggal Mulai
              </label>
              <input
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                max={to}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-base bg-white
                           focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">
                Tanggal Selesai
              </label>
              <input
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                min={from}
                max={new Date().toISOString().split("T")[0]}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-base bg-white
                           focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
          <div className="mt-3 bg-primary-pale rounded-xl px-4 py-2.5 text-sm text-primary font-medium">
            📅 Periode: {toDisplay(new Date(from))} — {toDisplay(new Date(to))}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start gap-4 mb-5">
            <div className="p-3 bg-success-light rounded-xl">
              <Table2 size={24} className="text-success" />
            </div>
            <div>
              <p className="font-bold text-gray-900">Export Excel (.xlsx)</p>
              <p className="text-sm text-gray-500 mt-0.5">
                21 kolom data pemeriksaan lengkap, siap dianalisis
              </p>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {[
                  "Nama Ibu",
                  "NIK",
                  "Kader",
                  "Tensi",
                  "BB",
                  "LILA",
                  "BMI",
                  "DJJ",
                  "Status Ibu",
                  "Rekomendasi",
                ].map((c) => (
                  <span
                    key={c}
                    className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-md"
                  >
                    {c}
                  </span>
                ))}
                <span className="text-xs text-gray-400">+11 lainnya</span>
              </div>
            </div>
          </div>
          <button
            onClick={handleExcel}
            disabled={loadingXlsx}
            className="w-full flex items-center justify-center gap-2 bg-success text-white
                       py-3.5 rounded-xl font-semibold hover:bg-green-800 transition-colors
                       disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loadingXlsx ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <FileDown size={18} />
            )}
            {loadingXlsx ? "Membuat file..." : "Download Excel"}
          </button>
        </Card>

        <Card className="p-6">
          <div className="flex items-start gap-4 mb-5">
            <div className="p-3 bg-danger-light rounded-xl">
              <FileText size={24} className="text-danger" />
            </div>
            <div>
              <p className="font-bold text-gray-900">Export PDF Rekap</p>
              <p className="text-sm text-gray-500 mt-0.5">
                Tabel rekap SEMUA pemeriksaan, siap cetak & tandatangan
              </p>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {[
                  "Nama Ibu",
                  "NIK",
                  "Tanggal",
                  "Usia Kehamilan",
                  "TP",
                  "Tensi",
                  "BB",
                  "LILA",
                  "BMI",
                  "DJJ",
                  "Status Ibu",
                  "Status Janin",
                ].map((c) => (
                  <span
                    key={c}
                    className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-md"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <button
            onClick={handlePdf}
            disabled={loadingPdf}
            className="w-full flex items-center justify-center gap-2 bg-primary text-white
                       py-3.5 rounded-xl font-semibold hover:bg-primary-dark transition-colors
                       disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loadingPdf ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <FileDown size={18} />
            )}
            {loadingPdf ? "Membuat PDF..." : "Download PDF Rekap"}
          </button>
        </Card>
      </div>
    </PageLayout>
  );
}
