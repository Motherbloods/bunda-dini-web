import clsx from "clsx";

const STATUS_CONFIG = {
  // Kondisi ibu
  normal: { label: "✅ Normal", bg: "bg-success-light", text: "text-success" },
  perlu_perhatian: {
    label: "⚠️ Perlu Perhatian",
    bg: "bg-warning-light",
    text: "text-warning",
  },
  risiko_tinggi: {
    label: "🔴 Risiko Tinggi",
    bg: "bg-danger-light",
    text: "text-danger",
  },
  // Kondisi janin
  djj_rendah: {
    label: "🔴 DJJ Rendah",
    bg: "bg-danger-light",
    text: "text-danger",
  },
  djj_tinggi: {
    label: "🔴 DJJ Tinggi",
    bg: "bg-danger-light",
    text: "text-danger",
  },
  // Status pasien
  aktif: { label: "Aktif", bg: "bg-success-light", text: "text-success" },
  selesai: { label: "🎉 Selesai", bg: "bg-gray-100", text: "text-gray-500" },
  // Kader
  kader_aktif: { label: "Aktif", bg: "bg-success-light", text: "text-success" },
  kader_nonaktif: {
    label: "Nonaktif",
    bg: "bg-gray-100",
    text: "text-gray-500",
  },
};

export default function Badge({ status, size = "sm", className = "" }) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.normal;
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full font-semibold",
        config.bg,
        config.text,
        size === "sm" && "px-2.5 py-0.5 text-xs",
        size === "md" && "px-3 py-1 text-sm",
        size === "lg" && "px-4 py-1.5 text-sm",
        className,
      )}
    >
      {config.label}
    </span>
  );
}

export function LilaBadge({ lila, size = "sm" }) {
  const isKek = lila < 23.5;
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full font-semibold",
        isKek
          ? "bg-warning-light text-warning"
          : "bg-success-light text-success",
        size === "sm" && "px-2.5 py-0.5 text-xs",
        size === "md" && "px-3 py-1 text-sm",
      )}
    >
      {isKek ? "⚠️ KEK" : "✅ Normal"}
    </span>
  );
}
