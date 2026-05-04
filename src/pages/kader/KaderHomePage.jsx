import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, X, Users, Baby } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { usePatients } from "../../hooks/usePatients";
import PageLayout from "../../components/layout/PageLayout";
import Badge from "../../components/ui/Badge";
import EmptyState from "../../components/ui/EmptyState";
import { InlineLoader } from "../../components/ui/LoadingSpinner";
import { ClickablePhoto } from "../../components/shared/PhotoViewer";
import { buildPath, ROUTES } from "../../constants/routes";
import { toDisplay, usiaKehamilanMinggu } from "../../utils/dateFormatter";

export default function KaderHomePage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { patientsAktif, patientsSelesai, loading, loadByKaderAll, search } =
    usePatients();

  const [query, setQuery] = useState("");
  const [showSelesai, setShowSelesai] = useState(false);

  useEffect(() => {
    if (currentUser?.id) loadByKaderAll(currentUser.id);
  }, [currentUser?.id]);

  const displayed = query ? search(query) : patientsAktif;

  return (
    <PageLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Halo, {currentUser?.nama ?? "Kader"} 👋
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {patientsAktif.length} pasien aktif
            {patientsSelesai.length > 0 &&
              ` · ${patientsSelesai.length} sudah melahirkan`}
          </p>
        </div>
        <button
          onClick={() => navigate(ROUTES.ADD_PATIENT)}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-xl
                     font-semibold text-sm hover:bg-primary-dark transition-colors"
        >
          <Plus size={18} />
          Tambah Pasien
        </button>
      </div>

      <div className="relative mb-6">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cari nama atau NIK..."
          className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl text-base
                     bg-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {loading ? (
        <InlineLoader />
      ) : displayed.length === 0 ? (
        <EmptyState
          icon={Users}
          title={
            query ? `Tidak ada pasien "${query}"` : "Belum ada pasien terdaftar"
          }
          subtitle={
            !query
              ? "Ketuk Tambah Pasien untuk mendaftarkan pasien baru"
              : undefined
          }
          action={
            !query && (
              <button
                onClick={() => navigate("/kader/patients/add")}
                className="bg-primary text-white px-6 py-2.5 rounded-xl font-semibold text-sm
                           hover:bg-primary-dark transition-colors"
              >
                + Tambah Pasien
              </button>
            )
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-8">
          {displayed.map((p) => (
            <PatientCard key={p.id} patient={p} />
          ))}
        </div>
      )}

      {patientsSelesai.length > 0 && !query && (
        <div>
          <button
            onClick={() => setShowSelesai(!showSelesai)}
            className="flex items-center gap-2 text-sm font-semibold text-gray-500
                       hover:text-gray-700 transition-colors mb-4"
          >
            <Baby size={16} className="text-success" />
            Sudah Melahirkan ({patientsSelesai.length})
            <span className="text-xs">{showSelesai ? "▲" : "▼"}</span>
          </button>
          {showSelesai && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 opacity-60">
              {patientsSelesai.map((p) => (
                <PatientCard key={p.id} patient={p} isSelesai />
              ))}
            </div>
          )}
        </div>
      )}
    </PageLayout>
  );
}

function PatientCard({ patient, isSelesai = false }) {
  const navigate = useNavigate();
  const usia = usiaKehamilanMinggu(patient.hpht?.toDate?.() ?? patient.hpht);

  return (
    <div
      onClick={() => navigate(`/kader/patients/${patient.id}`)}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex gap-4
                 hover:shadow-md hover:border-primary/30 cursor-pointer transition-all duration-200"
    >
      <ClickablePhoto src={patient.fotoUrl} nama={patient.nama} size="lg" />
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="font-bold text-gray-900 truncate">{patient.nama}</p>
          {isSelesai && <Badge status="selesai" />}
        </div>
        <p className="text-xs text-gray-400 mt-0.5">NIK: {patient.nik}</p>
        {patient.hpht && (
          <p className="text-xs text-gray-400">
            HPHT: {toDisplay(patient.hpht?.toDate?.() ?? patient.hpht)}
          </p>
        )}
        {usia !== null && (
          <span className="inline-block mt-2 bg-primary-pale text-primary text-xs font-semibold px-2 py-0.5 rounded-full">
            {usia} minggu
          </span>
        )}
      </div>
    </div>
  );
}
