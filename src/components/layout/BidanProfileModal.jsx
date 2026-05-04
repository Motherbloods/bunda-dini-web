import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { updateProfile } from "../../services/authService";
import { useProfileModal } from "../../context/ProfileModalContext";
import toast from "react-hot-toast";

export default function BidanProfileModal() {
  const { currentUser, setCurrentUser } = useAuth();
  const { open, setOpen } = useProfileModal();
  const [namaPuskesmas, setNamaPuskesmas] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setNamaPuskesmas(currentUser?.namaPuskesmas ?? "");
    }
  }, [open]);

  if (!open) return null;

  async function handleSave() {
    const trimmed = namaPuskesmas.trim();
    if (!trimmed) {
      toast.error("Nama puskesmas tidak boleh kosong");
      return;
    }
    setSaving(true);
    try {
      await updateProfile(currentUser.id, { namaPuskesmas: trimmed });
      setCurrentUser((prev) => ({ ...prev, namaPuskesmas: trimmed }));
      toast.success("Profil berhasil diperbarui");
      setOpen(false);
    } catch (e) {
      toast.error(`Gagal memperbarui profil: ${e.message}`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50"
      onClick={() => setOpen(false)}
    >
      <div
        className="bg-white rounded-t-3xl sm:rounded-2xl p-6 w-full sm:max-w-md shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-bold text-gray-900 mb-5">Profil Bidan</h2>

        <div className="bg-gray-50 rounded-xl p-4 mb-5 space-y-2">
          <div>
            <p className="text-xs text-gray-400">Nama</p>
            <p className="text-sm font-semibold text-gray-900">
              {currentUser?.nama ?? "-"}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Email</p>
            <p className="text-sm font-semibold text-gray-900">
              {currentUser?.email ?? "-"}
            </p>
          </div>
        </div>

        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-600 mb-1.5">
            Nama Puskesmas / Posyandu
          </label>
          <input
            type="text"
            value={namaPuskesmas}
            onChange={(e) => setNamaPuskesmas(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
            placeholder="Contoh: Posyandu Bunda Dini"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-base bg-white
                       focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-semibold
                       text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Batal
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl
                       bg-primary text-white text-sm font-semibold
                       hover:bg-primary-dark transition-colors disabled:opacity-60"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              "Simpan"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
