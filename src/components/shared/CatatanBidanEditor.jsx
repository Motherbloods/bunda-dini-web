import { useState } from "react";
import { Sparkles, Save, Check } from "lucide-react";
import { useExaminations } from "../../hooks/useExaminations";
import toast from "react-hot-toast";
import { ExaminationStatus, JaninStatus } from "../../utils/ruleEngine";
import { toDisplay } from "../../utils/dateFormatter";

function generateTemplate(exam) {
  const lines = [];
  const tanggal =
    exam.tanggal?.toDate?.() ?? new Date(exam.tanggal?.seconds * 1000);

  lines.push(`Hasil pemeriksaan tanggal ${toDisplay(tanggal)}:`);

  if (exam.sistolik >= 140 || exam.diastolik >= 90) {
    lines.push(
      `- Tekanan darah tinggi (${exam.sistolik}/${exam.diastolik} mmHg). ` +
        "Perlu pemantauan ketat dan segera konsultasi dokter.",
    );
  } else if (exam.sistolik < 90 || exam.diastolik < 60) {
    lines.push(
      `- Tekanan darah rendah (${exam.sistolik}/${exam.diastolik} mmHg). ` +
        "Anjurkan istirahat cukup dan konsumsi makanan bergizi.",
    );
  } else {
    lines.push(
      `- Tekanan darah normal (${exam.sistolik}/${exam.diastolik} mmHg).`,
    );
  }

  if (exam.bmi < 18.5) {
    lines.push(
      `- BMI ${exam.bmi?.toFixed(1)} (kurang). ` +
        "Tingkatkan asupan kalori dan konsultasi ahli gizi.",
    );
  } else if (exam.bmi >= 30) {
    lines.push(
      `- BMI ${exam.bmi?.toFixed(1)} (obesitas). ` +
        "Konsultasi dokter untuk rencana diet aman selama kehamilan.",
    );
  }

  if (exam.lingkarLengan < 23.5) {
    lines.push(
      `- LILA ${exam.lingkarLengan} cm (KEK). ` +
        "Perlu konsultasi ahli gizi dan peningkatan asupan protein.",
    );
  }

  if (exam.statusJanin === JaninStatus.DJJ_RENDAH) {
    lines.push(
      `- DJJ rendah (${exam.djj} bpm). ` +
        "Segera rujuk ke fasilitas kesehatan.",
    );
  } else if (exam.statusJanin === JaninStatus.DJJ_TINGGI) {
    lines.push(
      `- DJJ tinggi (${exam.djj} bpm). ` +
        "Anjurkan ibu istirahat dan segera periksakan ke dokter.",
    );
  }

  if (exam.keluhanList?.length > 0) {
    lines.push(`- Keluhan yang dilaporkan: ${exam.keluhanList.join(", ")}.`);
  }

  if (exam.statusIbu === ExaminationStatus.RISIKO_TINGGI) {
    lines.push(
      "- STATUS: RISIKO TINGGI — Diperlukan penanganan segera dan rujukan.",
    );
  } else if (exam.statusIbu === ExaminationStatus.PERLU_PERHATIAN) {
    lines.push("- Status ibu perlu perhatian. Pantau kondisi lebih sering.");
  } else {
    lines.push("- Kondisi ibu dan janin dalam batas normal.");
    lines.push("- Anjurkan tetap rutin kontrol kehamilan sesuai jadwal.");
  }

  return lines.join("\n");
}

export default function CatatanBidanEditor({ exam, readOnly = false }) {
  const { saveCatatanBidan } = useExaminations();

  const isNew = !exam.catatanBidan;
  const [teks, setTeks] = useState(exam.catatanBidan || generateTemplate(exam));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(!isNew);
  async function handleSave() {
    if (!teks.trim()) return;
    setSaving(true);
    const ok = await saveCatatanBidan(exam.id, teks.trim());
    setSaving(false);
    if (ok) {
      setSaved(true);
      toast.success("Catatan bidan berhasil disimpan");
    } else {
      toast.error("Gagal menyimpan catatan");
    }
  }

  // Mode read-only untuk kader
  if (readOnly) {
    return (
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-1.5 bg-info-light rounded-lg">
            <span className="text-info text-sm">🏥</span>
          </div>
          <p className="text-sm font-bold text-info">
            Catatan Bidan Pendamping
          </p>
        </div>
        {exam.catatanBidan ? (
          <div
            className="bg-info-light border border-blue-200 rounded-xl
                                    p-4 text-sm text-gray-700 leading-relaxed
                                    whitespace-pre-line"
          >
            {exam.catatanBidan}
          </div>
        ) : (
          <div
            className="bg-gray-50 border border-gray-200 rounded-xl
                                    p-4 text-center"
          >
            <p className="text-sm text-gray-400 italic">
              Menunggu catatan dari bidan pendamping...
            </p>
          </div>
        )}
      </div>
    );
  }

  // Mode edit untuk bidan
  return (
    <div className="mt-4 pt-4 border-t border-gray-100">
      <div className="flex items-center gap-2 mb-3">
        <div className="p-1.5 bg-info-light rounded-lg">
          <span className="text-info text-sm">🏥</span>
        </div>
        <p className="text-sm font-bold text-info">Catatan Bidan</p>
      </div>

      {isNew && (
        <div
          className="mb-3 flex items-start gap-2 bg-blue-50 border
                                border-blue-200 rounded-xl p-3"
        >
          <Sparkles size={16} className="text-info flex-shrink-0 mt-0.5" />
          <p className="text-xs text-info leading-relaxed">
            Template catatan sudah dibuat otomatis berdasarkan hasil
            pemeriksaan. Anda bisa mengedit sesuai kebutuhan sebelum menyimpan.
          </p>
        </div>
      )}

      <textarea
        rows={6}
        value={teks}
        onChange={(e) => {
          setTeks(e.target.value);
          setSaved(false);
        }}
        className="w-full border border-gray-200 rounded-xl px-4 py-3
                           text-sm leading-relaxed bg-white resize-none
                           focus:outline-none focus:border-info
                           focus:ring-2 focus:ring-blue-100 transition-all"
        placeholder="Catatan atau rekomendasi bidan..."
      />

      <button
        onClick={handleSave}
        disabled={saving || saved}
        className={`mt-2 w-full flex items-center justify-center gap-2
                    py-3 rounded-xl font-semibold text-sm transition-all
                    disabled:cursor-not-allowed
                    ${
                      saved
                        ? "bg-success text-white opacity-80"
                        : "bg-info text-white hover:bg-blue-800"
                    }`}
      >
        {saving ? (
          <>
            <span
              className="w-4 h-4 border-2 border-white
                                         border-t-transparent rounded-full animate-spin"
            />
            Menyimpan...
          </>
        ) : saved ? (
          <>
            {" "}
            <Check size={16} /> Tersimpan ✓{" "}
          </>
        ) : (
          <>
            {" "}
            <Save size={16} /> Simpan Catatan Bidan{" "}
          </>
        )}
      </button>
    </div>
  );
}
