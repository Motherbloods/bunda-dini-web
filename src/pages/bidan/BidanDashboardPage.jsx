import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Users,
  ClipboardList,
  AlertTriangle,
  UserCheck,
  Download,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { usePatients } from "../../hooks/usePatients";
import {
  fetchByDateRange,
  countThisMonth,
} from "../../services/examinationService";
import { fetchKaders } from "../../services/authService";
import PageLayout from "../../components/layout/PageLayout";
import Card, { StatCard, SectionHeader } from "../../components/ui/Card";
import { InlineLoader } from "../../components/ui/LoadingSpinner";
import { toDisplay, toMonthYear } from "../../utils/dateFormatter";
import { ROUTES, buildPath } from "../../constants/routes";
import { ExaminationStatus } from "../../utils/ruleEngine";
import toast from "react-hot-toast";

export default function BidanDashboardPage() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { patients, loadAll } = usePatients();

  const [stats, setStats] = useState({ pemeriksaan: 0, risiko: 0, kader: 0 });
  const [chart, setChart] = useState([]);
  const [risikoList, setRisikoList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser?.id) return;
    loadAll(currentUser.id);
    loadStats();
  }, [currentUser?.id]);

  async function loadStats() {
    setLoading(true);
    try {
      const bidanId = currentUser.id;
      const now = new Date();

      const pemeriksaan = await countThisMonth(bidanId);
      const kaders = await fetchKaders(bidanId);
      const kaderAktif = kaders.filter((k) => k.isActive).length;

      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      const thisMonthExams = await fetchByDateRange(
        monthStart,
        monthEnd,
        bidanId,
      );

      const risikoPatients = new Set();
      thisMonthExams.forEach((e) => {
        if (
          e.statusIbu === ExaminationStatus.RISIKO_TINGGI ||
          e.statusIbu === ExaminationStatus.PERLU_PERHATIAN ||
          e.statusJanin !== "normal"
        )
          risikoPatients.add(e.patientId);
      });

      const chartData = [];
      for (let i = 5; i >= 0; i--) {
        const from = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const to = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
        const exams = await fetchByDateRange(from, to, bidanId);
        chartData.push({ name: toMonthYear(from), jumlah: exams.length });
      }

      const risikoExams = thisMonthExams
        .filter((e) => e.statusIbu === ExaminationStatus.RISIKO_TINGGI)
        .slice(0, 5);

      setRisikoList(risikoExams);
      setStats({ pemeriksaan, risiko: risikoPatients.size, kader: kaderAktif });
      setChart(chartData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const getPatientNama = (patientId) =>
    patients.find((p) => p.id === patientId)?.nama ?? "Pasien tidak dikenal";

  const menus = [
    {
      label: "Kelola Kader",
      icon: UserCheck,
      color: "info",
      to: ROUTES.KADER_LIST,
    },
    {
      label: "Semua Pasien",
      icon: Users,
      color: "primary",
      to: ROUTES.ALL_PATIENTS,
    },
    {
      label: "Export Data",
      icon: Download,
      color: "success",
      to: ROUTES.EXPORT,
    },
  ];

  return (
    <PageLayout>
      <div className="bg-gradient-to-r from-primary to-primary-dark rounded-2xl p-6 mb-6 text-white">
        <p className="text-red-200 text-sm">Selamat datang,</p>
        <h1 className="text-2xl font-bold mt-1">
          {currentUser?.nama ?? "Bidan"}
        </h1>
        <p className="text-red-200 text-sm mt-1">{toDisplay(new Date())}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Total Ibu"
          value={patients.length}
          icon={Users}
          color="primary"
          loading={loading}
        />
        <StatCard
          label="Pemeriksaan Bulan Ini"
          value={stats.pemeriksaan}
          icon={ClipboardList}
          color="info"
          loading={loading}
        />
        <StatCard
          label="Ibu Risiko Tinggi"
          value={stats.risiko}
          icon={AlertTriangle}
          color="danger"
          loading={loading}
        />
        <StatCard
          label="Kader Aktif"
          value={stats.kader}
          icon={UserCheck}
          color="success"
          loading={loading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="p-5">
            <SectionHeader title="Statistik 6 Bulan Terakhir" />
            {loading ? (
              <InlineLoader />
            ) : chart.every((c) => c.jumlah === 0) ? (
              <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
                Belum ada data pemeriksaan
              </div>
            ) : (
              <div className="h-56 mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chart} barSize={28}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#F0F0F0"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 11, fill: "#9E9E9E" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: "#9E9E9E" }}
                      axisLine={false}
                      tickLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: 12,
                        border: "none",
                        boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                      }}
                      formatter={(v) => [`${v} pemeriksaan`, ""]}
                    />
                    <Bar
                      dataKey="jumlah"
                      name="Pemeriksaan"
                      fill="#C62828"
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="p-5">
            <SectionHeader title="Menu" />
            <div className="space-y-2 mt-3">
              {menus.map((m) => (
                <button
                  key={m.label}
                  onClick={() => (m.action ? m.action() : navigate(m.to))}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors text-left"
                >
                  <div
                    className={`p-2.5 rounded-xl ${
                      m.color === "primary"
                        ? "bg-primary-pale"
                        : m.color === "info"
                          ? "bg-info-light"
                          : m.color === "success"
                            ? "bg-success-light"
                            : "bg-warning-light"
                    }`}
                  >
                    <m.icon
                      size={20}
                      className={
                        m.color === "primary"
                          ? "text-primary"
                          : m.color === "info"
                            ? "text-info"
                            : m.color === "success"
                              ? "text-success"
                              : "text-warning"
                      }
                    />
                  </div>
                  <span className="font-semibold text-gray-800 flex-1">
                    {m.label}
                  </span>
                  <ChevronRight size={16} className="text-gray-400" />
                </button>
              ))}
            </div>
          </Card>

          {risikoList.length > 0 && (
            <Card className="p-5 border-danger/30 border-2">
              <SectionHeader title="🚨 Ibu Risiko Tinggi" />
              <div className="space-y-2 mt-3">
                {risikoList.map((e) => (
                  <div
                    key={e.id}
                    onClick={() => navigate(buildPath.examResult(e.id))}
                    className="flex items-center gap-3 p-2.5 rounded-xl bg-danger-light
                               cursor-pointer hover:bg-red-100 transition-colors"
                  >
                    <AlertTriangle
                      size={16}
                      className="text-danger flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-danger truncate">
                        {getPatientNama(e.patientId)}
                      </p>
                      <p className="text-xs text-red-400">
                        {toDisplay(
                          e.tanggal?.toDate?.() ??
                            new Date(e.tanggal?.seconds * 1000),
                        )}
                      </p>
                    </div>
                    <ChevronRight size={14} className="text-danger" />
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
