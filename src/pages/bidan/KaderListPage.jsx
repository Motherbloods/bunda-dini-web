import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserPlus, MoreVertical, UserCheck, UserX } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import {
  fetchKaders,
  deactivateKader,
  activateKader,
} from "../../services/authService";
import PageLayout from "../../components/layout/PageLayout";
import Header from "../../components/layout/Header";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import EmptyState from "../../components/ui/EmptyState";
import { ConfirmDialog } from "../../components/ui/Modal";
import { InlineLoader } from "../../components/ui/LoadingSpinner";
import { toDisplay } from "../../utils/dateFormatter";
import { ROUTES } from "../../constants/routes";
import toast from "react-hot-toast";

export default function KaderListPage() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [kaders, setKaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirm, setConfirm] = useState(null); // { kader, action }
  const [doing, setDoing] = useState(false);
  const [openMenu, setOpenMenu] = useState(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const data = await fetchKaders(currentUser.id);
      setKaders(data);
    } catch {
      toast.error("Gagal memuat daftar kader.");
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirm() {
    if (!confirm) return;
    setDoing(true);
    try {
      if (confirm.action === "deactivate") {
        await deactivateKader(confirm.kader.id);
        toast.success(`${confirm.kader.nama} berhasil dinonaktifkan`);
      } else {
        await activateKader(confirm.kader.id);
        toast.success(`${confirm.kader.nama} berhasil diaktifkan kembali`);
      }
      await load();
    } catch {
      toast.error("Terjadi kesalahan.");
    } finally {
      setDoing(false);
      setConfirm(null);
    }
  }

  return (
    <PageLayout>
      <Header
        title="Kelola Kader"
        subtitle={`${kaders.filter((k) => k.isActive).length} kader aktif`}
        action={
          <button
            onClick={() => navigate(ROUTES.ADD_KADER)}
            className="flex items-center gap-2 bg-primary text-white px-4 py-2.5
                       rounded-xl font-semibold text-sm hover:bg-primary-dark transition-colors"
          >
            <UserPlus size={18} /> Tambah Kader
          </button>
        }
      />

      {loading ? (
        <InlineLoader />
      ) : kaders.length === 0 ? (
        <EmptyState
          icon={UserCheck}
          title="Belum ada kader terdaftar"
          subtitle="Tambahkan kader pertama Anda"
          action={
            <button
              onClick={() => navigate(ROUTES.ADD_KADER)}
              className="bg-primary text-white px-6 py-2.5 rounded-xl font-semibold text-sm"
            >
              + Tambah Kader
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {kaders.map((kader) => (
            <Card key={kader.id} className="p-5 relative">
              <div className="flex items-start gap-4">
                <div
                  className="w-12 h-12 rounded-full bg-primary-pale flex items-center
                                justify-center text-primary font-bold text-lg flex-shrink-0"
                >
                  {kader.nama?.[0]?.toUpperCase() ?? "K"}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-gray-900">{kader.nama}</p>
                    <Badge
                      status={kader.isActive ? "kader_aktif" : "kader_nonaktif"}
                    />
                  </div>
                  <p className="text-sm text-gray-400 mt-0.5 truncate">
                    {kader.email}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Terdaftar:{" "}
                    {toDisplay(
                      kader.createdAt?.toDate?.() ?? new Date(kader.createdAt),
                    )}
                  </p>
                </div>

                <div className="relative">
                  <button
                    onClick={() =>
                      setOpenMenu(openMenu === kader.id ? null : kader.id)
                    }
                    className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors"
                  >
                    <MoreVertical size={18} />
                  </button>
                  {openMenu === kader.id && (
                    <div
                      className="absolute right-0 top-8 z-10 bg-white rounded-xl shadow-lg
                                    border border-gray-100 py-1 min-w-[160px]"
                    >
                      {kader.isActive ? (
                        <button
                          onClick={() => {
                            setConfirm({ kader, action: "deactivate" });
                            setOpenMenu(null);
                          }}
                          className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-danger
                                     hover:bg-red-50 transition-colors"
                        >
                          <UserX size={16} /> Nonaktifkan
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setConfirm({ kader, action: "activate" });
                            setOpenMenu(null);
                          }}
                          className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-success
                                     hover:bg-green-50 transition-colors"
                        >
                          <UserCheck size={16} /> Aktifkan Kembali
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <ConfirmDialog
        isOpen={!!confirm}
        onClose={() => setConfirm(null)}
        onConfirm={handleConfirm}
        title={
          confirm?.action === "deactivate"
            ? "Nonaktifkan Kader"
            : "Aktifkan Kembali"
        }
        message={
          confirm?.action === "deactivate"
            ? `Nonaktifkan ${confirm?.kader?.nama}? Kader tidak bisa login setelah ini.`
            : `Aktifkan kembali ${confirm?.kader?.nama}? Kader dapat login kembali.`
        }
        confirmLabel={
          confirm?.action === "deactivate" ? "Nonaktifkan" : "Aktifkan"
        }
        isDangerous={confirm?.action === "deactivate"}
        loading={doing}
      />

      {openMenu && (
        <div className="fixed inset-0 z-0" onClick={() => setOpenMenu(null)} />
      )}
    </PageLayout>
  );
}
