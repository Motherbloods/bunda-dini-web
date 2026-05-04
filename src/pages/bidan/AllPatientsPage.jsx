import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X, Filter } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { usePatients } from "../../hooks/usePatients";
import { useExaminations } from "../../hooks/useExaminations";
import PageLayout from "../../components/layout/PageLayout";
import Header from "../../components/layout/Header";
import Badge from "../../components/ui/Badge";
import EmptyState from "../../components/ui/EmptyState";
import { InlineLoader } from "../../components/ui/LoadingSpinner";
import { ClickablePhoto } from "../../components/shared/PhotoViewer";
import { toDisplay, usiaKehamilanMinggu } from "../../utils/dateFormatter";
import { buildPath, ROUTES } from "../../constants/routes";
import { Users } from "lucide-react";

const FILTER_OPTIONS = [
  { label: "Semua", value: null },
  { label: "Aktif", value: "aktif" },
  { label: "Selesai", value: "selesai" },
];

export default function AllPatientsPage() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { patients, loading, loadAll } = usePatients();
  const { loadHistory } = useExaminations();

  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState(null);

  useEffect(() => {
    if (currentUser?.id) loadAll(currentUser.id);
  }, [currentUser?.id]);

  const displayed = patients.filter((p) => {
    const matchQ =
      !query ||
      p.nama.toLowerCase().includes(query.toLowerCase()) ||
      p.nik?.includes(query);
    const matchF = !filter || p.status === filter;
    return matchQ && matchF;
  });

  function handlePatientClick(patient) {
    loadHistory(patient.id);
    navigate(buildPath.patientDetailBidan(patient.id));
  }

  return (
    <PageLayout>
      <Header
        title="Semua Pasien"
        subtitle={`${patients.length} total pasien`}
      />

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari nama atau NIK..."
            className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-xl text-sm
                       bg-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
            >
              <X size={16} />
            </button>
          )}
        </div>
        <div className="flex gap-2">
          {FILTER_OPTIONS.map((f) => (
            <button
              key={String(f.value)}
              onClick={() => setFilter(f.value)}
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200
                ${
                  filter === f.value
                    ? "bg-primary text-white"
                    : "bg-white border border-gray-200 text-gray-600 hover:border-primary/40"
                }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <InlineLoader />
      ) : displayed.length === 0 ? (
        <EmptyState
          icon={Users}
          title={query || filter ? "Tidak ada hasil" : "Belum ada pasien"}
          subtitle={
            query || filter ? "Coba ubah filter atau kata pencarian" : undefined
          }
        />
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-primary-pale border-b border-primary/10">
                {["Pasien", "NIK", "HPHT / Usia", "Status", "Kader", ""].map(
                  (h) => (
                    <th
                      key={h}
                      className="text-left px-4 py-3 text-xs font-semibold text-primary"
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {displayed.map((p, i) => {
                const hpht =
                  p.hpht?.toDate?.() ?? (p.hpht ? new Date(p.hpht) : null);
                const usia = usiaKehamilanMinggu(hpht);
                return (
                  <tr
                    key={p.id}
                    onClick={() => handlePatientClick(p)}
                    className={`border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition-colors
                      ${i % 2 === 1 ? "bg-gray-50/30" : ""}`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <ClickablePhoto
                          src={p.fotoUrl}
                          nama={p.nama}
                          size="sm"
                        />
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">
                            {p.nama}
                          </p>
                          <p className="text-xs text-gray-400">{p.noHp}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{p.nik}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {hpht ? (
                        <>
                          <p>{toDisplay(hpht)}</p>
                          {usia !== null && (
                            <p className="text-xs text-primary font-medium">
                              {usia} minggu
                            </p>
                          )}
                        </>
                      ) : (
                        <span className="text-gray-300">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Badge status={p.status} />
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {p.kaderNama}
                    </td>
                    <td className="px-4 py-3 text-gray-400">
                      <span className="text-xs hover:text-primary">›</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </PageLayout>
  );
}
