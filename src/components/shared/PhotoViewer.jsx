import { useEffect, useState } from "react";
import { X, ZoomIn } from "lucide-react";

export default function PhotoViewer({ isOpen, onClose, imageUrl, nama }) {
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative max-w-2xl max-h-[90vh] w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={imageUrl}
          alt={nama ?? "Foto Pasien"}
          className="w-full h-auto max-h-[80vh] object-contain rounded-2xl"
        />
        {nama && (
          <div
            className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent
                          rounded-b-2xl px-4 py-3"
          >
            <p className="text-white font-semibold text-center">{nama}</p>
          </div>
        )}
        <button
          onClick={onClose}
          className="absolute -top-4 -right-4 w-10 h-10 bg-white rounded-full shadow-lg
                     flex items-center justify-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <X size={20} />
        </button>
      </div>
    </div>
  );
}

export function ClickablePhoto({ src, nama, size = "md", fallbackIcon }) {
  const [open, setOpen] = useState(false);
  const sizes = {
    sm: "w-12 h-12",
    md: "w-16 h-16",
    lg: "w-24 h-24",
    xl: "w-32 h-32",
  };

  return (
    <>
      <div
        className={`${sizes[size]} rounded-xl overflow-hidden bg-primary-pale flex-shrink-0
                    ${src ? "cursor-pointer hover:opacity-90 transition-opacity" : ""}`}
        onClick={src ? () => setOpen(true) : undefined}
        title={src ? "Ketuk untuk perbesar" : undefined}
      >
        {src ? (
          <img src={src} alt={nama} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-primary text-2xl font-bold">
            {nama?.[0]?.toUpperCase() ?? "?"}
          </div>
        )}
      </div>
      <PhotoViewer
        isOpen={open}
        onClose={() => setOpen(false)}
        imageUrl={src}
        nama={nama}
      />
    </>
  );
}
