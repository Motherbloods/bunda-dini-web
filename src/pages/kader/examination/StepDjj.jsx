import { useMemo } from "react";
import { djjStatus } from "../../../utils/ruleEngine";

export default function StepDjj({
  djj,
  onDjj,
  keluhanIbu,
  onKeluhan,
  catatanKader,
  onCatatan,
  errors,
}) {
  const status = useMemo(() => {
    const v = parseInt(djj);
    if (!v) return null;
    return djjStatus(v);
  }, [djj]);

  const colorMap = {
    success: "bg-green-50 border-green-200 text-success",
    danger: "bg-danger-light border-red-200 text-danger",
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-1 h-5 bg-primary rounded-full" />
        <h3 className="font-bold text-gray-900">DJJ & Keluhan</h3>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-600 mb-1.5">
          Denyut Jantung Janin / DJJ (bpm) *
        </label>
        <input
          type="number"
          value={djj}
          onChange={(e) => onDjj(e.target.value)}
          placeholder="contoh: 140"
          className={`w-full border rounded-xl px-4 py-3 text-base bg-white
            focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
            ${errors.djj ? "border-danger" : "border-gray-200"}`}
        />
        {errors.djj && <p className="mt-1 text-sm text-danger">{errors.djj}</p>}
        {status && (
          <div
            className={`mt-2 border rounded-xl p-3 font-semibold text-sm ${colorMap[status.color]}`}
          >
            {status.label}
          </div>
        )}
        <p className="text-xs text-gray-400 mt-1.5">Normal: 110–160 bpm</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-600 mb-1.5">
          Keluhan Ibu — Opsional
        </label>
        <textarea
          rows={3}
          value={keluhanIbu}
          onChange={(e) => onKeluhan(e.target.value)}
          placeholder="Keluhan yang disampaikan ibu..."
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-base
                     bg-white resize-none focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-600 mb-1.5">
          Catatan Kader — Opsional
        </label>
        <textarea
          rows={3}
          value={catatanKader}
          onChange={(e) => onCatatan(e.target.value)}
          placeholder="Catatan tambahan dari kader..."
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-base
                     bg-white resize-none focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>
    </div>
  );
}
