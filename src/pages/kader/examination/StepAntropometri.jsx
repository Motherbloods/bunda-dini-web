import { useEffect, useMemo, useState } from "react";
import { hitungBmi, kategoriBmi, isKek } from "../../../utils/ruleEngine";
import { fetchLatestByPatient } from "../../../services/examinationService";

export default function StepAntropometri({
  beratBadan,
  onBb,
  tinggiBadan,
  onTb,
  lingkarLengan,
  onLila,
  lingkarPerut,
  onLp,
  tfu,
  onTfu,
  usiaKehamilanMinggu,
  errors,
  patientId,
}) {
  const [prevBb, setPrevBb] = useState(null);

  useEffect(() => {
    fetchLatestByPatient(patientId).then((latest) => {
      if (latest) setPrevBb(latest.beratBadan);
    });
  }, [patientId]);

  const bmi = useMemo(() => {
    const bb = parseFloat(beratBadan),
      tb = parseFloat(tinggiBadan);
    if (!bb || !tb) return null;
    return hitungBmi(bb, tb);
  }, [beratBadan, tinggiBadan]);

  const kenaikanBb = useMemo(() => {
    const bb = parseFloat(beratBadan);
    if (!bb || prevBb === null) return null;
    return bb - prevBb;
  }, [beratBadan, prevBb]);

  const kek = lingkarLengan ? isKek(parseFloat(lingkarLengan)) : false;
  const bmiLabel = bmi ? kategoriBmi(bmi) : null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-1 h-5 bg-primary rounded-full" />
        <h3 className="font-bold text-gray-900">Antropometri</h3>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-600 mb-1.5">
          Berat Badan (kg) *
        </label>
        <input
          type="number"
          step="0.1"
          value={beratBadan}
          onChange={(e) => onBb(e.target.value)}
          placeholder="contoh: 62.5"
          className={`w-full border rounded-xl px-4 py-3 text-base bg-white
            focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
            ${errors.beratBadan ? "border-danger" : "border-gray-200"}`}
        />
        {errors.beratBadan && (
          <p className="mt-1 text-sm text-danger">{errors.beratBadan}</p>
        )}
        {kenaikanBb !== null && (
          <p
            className={`mt-1 text-sm font-medium ${kenaikanBb < 0 ? "text-warning" : "text-success"}`}
          >
            {kenaikanBb >= 0 ? "+" : ""}
            {kenaikanBb.toFixed(1)} kg dari pemeriksaan sebelumnya
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-600 mb-1.5">
          Tinggi Badan (cm) *
        </label>
        <input
          type="number"
          step="0.1"
          value={tinggiBadan}
          onChange={(e) => onTb(e.target.value)}
          placeholder="contoh: 158"
          className={`w-full border rounded-xl px-4 py-3 text-base bg-white
            focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
            ${errors.tinggiBadan ? "border-danger" : "border-gray-200"}`}
        />
        {errors.tinggiBadan && (
          <p className="mt-1 text-sm text-danger">{errors.tinggiBadan}</p>
        )}
      </div>

      {bmi && (
        <div className="bg-info-light border border-blue-200 rounded-xl px-4 py-2.5">
          <span className="text-info font-semibold text-sm">
            BMI: {bmi.toFixed(1)} — {bmiLabel}
          </span>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-600 mb-1.5">
          LILA / Lingkar Lengan Atas (cm) *
        </label>
        <input
          type="number"
          step="0.1"
          value={lingkarLengan}
          onChange={(e) => onLila(e.target.value)}
          placeholder="contoh: 25.5"
          className={`w-full border rounded-xl px-4 py-3 text-base bg-white
            focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
            ${errors.lingkarLengan ? "border-danger" : "border-gray-200"}`}
        />
        {errors.lingkarLengan && (
          <p className="mt-1 text-sm text-danger">{errors.lingkarLengan}</p>
        )}
        {lingkarLengan && (
          <div
            className={`mt-1.5 inline-block text-xs font-semibold px-2.5 py-1 rounded-full
            ${kek ? "bg-warning-light text-warning" : "bg-success-light text-success"}`}
          >
            {kek ? "⚠️ KEK — LILA < 23.5 cm" : "✅ LILA Normal"}
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-600 mb-1.5">
          Lingkar Perut (cm) — Opsional
        </label>
        <input
          type="number"
          step="0.1"
          value={lingkarPerut}
          onChange={(e) => onLp(e.target.value)}
          placeholder="opsional"
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-base bg-white
            focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-600 mb-1.5">
          TFU / Tinggi Fundus Uteri (cm)
          <span className="text-gray-400 font-normal"> — Opsional</span>
        </label>
        <input
          type="number"
          step="0.1"
          value={tfu}
          onChange={(e) => onTfu(e.target.value)}
          placeholder="contoh: 28"
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-base bg-white
                   focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        />
        {tfu &&
          (() => {
            const tfuVal = parseFloat(tfu);
            const minggu = usiaKehamilanMinggu
              ? parseFloat(usiaKehamilanMinggu)
              : null;
            const normal = minggu ? `±${minggu} cm` : null;
            const selisih = minggu ? Math.abs(tfuVal - minggu) : null;
            const warning = selisih !== null && selisih > 3;

            return (
              <div
                className={`mt-1.5 text-xs font-medium px-3 py-1.5 rounded-lg
                ${
                  warning
                    ? "bg-warning-light text-warning"
                    : "bg-success-light text-success"
                }`}
              >
                {warning
                  ? `⚠️ TFU ${tfuVal} cm — selisih ${selisih} cm dari normal`
                  : `✅ TFU ${tfuVal} cm${normal ? ` — normal ${normal}` : ""}`}
              </div>
            );
          })()}
        <p className="text-xs text-gray-400 mt-1.5 italic">
          Nilai normal: ±1 cm per minggu usia kehamilan (contoh: 28 minggu → ±28
          cm)
        </p>
      </div>
    </div>
  );
}
