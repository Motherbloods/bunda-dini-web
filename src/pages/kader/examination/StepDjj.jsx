import { useMemo, useState } from "react";
import { djjStatus } from "../../../utils/ruleEngine";

const DAFTAR_KELUHAN = [
  "Pusing / sakit kepala",
  "Mual / muntah",
  "Nyeri perut",
  "Sesak napas",
  "Bengkak pada kaki",
  "Bengkak pada tangan/wajah",
  "Perdarahan",
  "Gerak janin berkurang",
  "Nyeri punggung",
  "Susah tidur",
  "Lemas / mudah lelah",
  "Demam",
  "Gatal-gatal",
  "Keputihan abnormal",
];
export default function StepDjj({
  djj,
  onDjj,
  selectedKeluhan,
  onKeluhanChange,
  keluhanLainnya,
  onKeluhanLainnya,
  errors,
}) {
  const [adaLainnya, setAdaLainnya] = useState(Boolean(keluhanLainnya));

  const status = useMemo(() => {
    const v = parseInt(djj);
    if (!v) return null;
    return djjStatus(v);
  }, [djj]);

  const colorMap = {
    success: "bg-green-50 border-green-200 text-success",
    danger: "bg-danger-light border-red-200 text-danger",
  };

  function toggleKeluhan(keluhan) {
    const list = [...selectedKeluhan];
    const idx = list.indexOf(keluhan);
    if (idx >= 0) list.splice(idx, 1);
    else list.push(keluhan);
    onKeluhanChange(list);
  }

  function toggleLainnya() {
    const next = !adaLainnya;
    setAdaLainnya(next);
    if (!next) onKeluhanLainnya(""); // reset teks jika dinonaktifkan
  }

  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1 h-5 bg-primary rounded-full" />
          <h3 className="font-bold text-gray-900">DJJ & Keluhan</h3>
        </div>

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
            className={`mt-2 border rounded-xl p-3 font-semibold text-sm
            ${colorMap[status.color]}`}
          >
            {status.label}
          </div>
        )}
        <p className="text-xs text-gray-400 mt-1.5">Normal: 110–160 bpm</p>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-1 h-5 bg-primary rounded-full" />
          <h3 className="font-bold text-gray-900">Keluhan Ibu</h3>
        </div>
        <p className="text-sm text-gray-400 mb-3">
          Pilih semua keluhan yang dirasakan ibu (boleh lebih dari satu)
        </p>

        <div className="border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-100">
          {DAFTAR_KELUHAN.map((keluhan) => {
            const selected = selectedKeluhan.includes(keluhan);
            return (
              <button
                key={keluhan}
                type="button"
                onClick={() => toggleKeluhan(keluhan)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left
                  transition-colors duration-150
                  ${
                    selected ? "bg-primary-pale" : "bg-white hover:bg-gray-50"
                  }`}
              >
                <div
                  className={`w-5 h-5 rounded-md border-2 flex items-center
                  justify-center flex-shrink-0 transition-all duration-200
                  ${
                    selected
                      ? "bg-primary border-primary"
                      : "border-gray-300 bg-white"
                  }`}
                >
                  {selected && (
                    <svg
                      className="w-3 h-3 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </div>
                <span
                  className={`text-sm transition-colors duration-150
                  ${selected ? "text-primary font-semibold" : "text-gray-700"}`}
                >
                  {keluhan}
                </span>
              </button>
            );
          })}

          <button
            type="button"
            onClick={toggleLainnya}
            className={`w-full flex items-center gap-3 px-4 py-3 text-left
              transition-colors duration-150
              ${adaLainnya ? "bg-primary-pale" : "bg-white hover:bg-gray-50"}`}
          >
            <div
              className={`w-5 h-5 rounded-md border-2 flex items-center
              justify-center flex-shrink-0 transition-all duration-200
              ${adaLainnya ? "bg-primary border-primary" : "border-gray-300 bg-white"}`}
            >
              {adaLainnya && (
                <svg
                  className="w-3 h-3 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
            </div>
            <span
              className={`text-sm italic transition-colors duration-150
              ${adaLainnya ? "text-primary font-semibold" : "text-gray-400"}`}
            >
              Lainnya...
            </span>
          </button>
        </div>

        {adaLainnya && (
          <div className="mt-3">
            <textarea
              rows={2}
              value={keluhanLainnya}
              onChange={(e) => onKeluhanLainnya(e.target.value)}
              placeholder="Tuliskan keluhan lain yang tidak ada di daftar..."
              className="w-full border border-gray-200 rounded-xl px-4 py-3
                         text-base bg-white resize-none focus:outline-none
                         focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
        )}

        {selectedKeluhan.length > 0 && (
          <div
            className="mt-3 p-3 bg-warning-light border border-orange-200
                          rounded-xl"
          >
            <p className="text-xs font-semibold text-warning mb-2">
              {selectedKeluhan.length} keluhan dipilih:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {selectedKeluhan.map((k) => (
                <span
                  key={k}
                  className="text-xs bg-white border border-orange-200
                             text-warning px-2.5 py-1 rounded-full font-medium"
                >
                  {k}
                </span>
              ))}
              {keluhanLainnya && (
                <span
                  className="text-xs bg-white border border-orange-200
                                 text-warning px-2.5 py-1 rounded-full
                                 font-medium italic"
                >
                  Lainnya: {keluhanLainnya}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
