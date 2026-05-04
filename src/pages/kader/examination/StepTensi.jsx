import { useMemo } from "react";
import { tensiStatus } from "../../../utils/ruleEngine";

export default function StepTensi({
  sistolik,
  onSistolik,
  diastolik,
  onDiastolik,
  errors,
}) {
  const status = useMemo(() => {
    const s = parseInt(sistolik),
      d = parseInt(diastolik);
    if (!s || !d) return null;
    return tensiStatus(s, d);
  }, [sistolik, diastolik]);

  const colorMap = {
    success: "bg-green-50 border-green-200 text-success",
    warning: "bg-warning-light border-orange-200 text-warning",
    danger: "bg-danger-light border-red-200 text-danger",
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-1 h-5 bg-primary rounded-full" />
        <h3 className="font-bold text-gray-900">Tekanan Darah</h3>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-600 mb-1.5">
          Sistolik (mmHg) *
        </label>
        <input
          type="number"
          value={sistolik}
          onChange={(e) => onSistolik(e.target.value)}
          placeholder="contoh: 120"
          className={`w-full border rounded-xl px-4 py-3 text-base bg-white
            focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
            ${errors.sistolik ? "border-danger" : "border-gray-200"}`}
        />
        {errors.sistolik && (
          <p className="mt-1 text-sm text-danger">{errors.sistolik}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-600 mb-1.5">
          Diastolik (mmHg) *
        </label>
        <input
          type="number"
          value={diastolik}
          onChange={(e) => onDiastolik(e.target.value)}
          placeholder="contoh: 80"
          className={`w-full border rounded-xl px-4 py-3 text-base bg-white
            focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
            ${errors.diastolik ? "border-danger" : "border-gray-200"}`}
        />
        {errors.diastolik && (
          <p className="mt-1 text-sm text-danger">{errors.diastolik}</p>
        )}
      </div>

      {status && (
        <div
          className={`border rounded-xl p-3.5 font-semibold text-sm ${colorMap[status.color]}`}
        >
          {status.label}
        </div>
      )}

      <p className="text-xs text-gray-400">
        Normal: Sistolik 90–139 mmHg · Diastolik 60–89 mmHg
      </p>
    </div>
  );
}
