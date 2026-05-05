import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { useExaminations } from "../../../hooks/useExaminations";
import { usePatients } from "../../../hooks/usePatients";
import { useAuth } from "../../../context/AuthContext";
import PageLayout from "../../../components/layout/PageLayout";
import Header from "../../../components/layout/Header";
import Card, { SectionHeader } from "../../../components/ui/Card";
import Badge from "../../../components/ui/Badge";
import { InlineLoader } from "../../../components/ui/LoadingSpinner";
import EmptyState from "../../../components/ui/EmptyState";
import { toDisplay, toShort } from "../../../utils/dateFormatter";
import { BarChart2 } from "lucide-react";
import { buildPath } from "../../../constants/routes";
import { ROUTES } from "../../../constants/routes";
import toast from "react-hot-toast";

const CHART_TABS = ["Berat Badan", "Tekanan Darah", "DJJ"];

export default function ExaminationHistoryPage() {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { loadHistory, history, loading } = useExaminations();
  const { loadById } = usePatients();
  const [patient, setPatient] = useState(null);
  const [activeChart, setActiveChart] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const patientData = await loadById(patientId);
        if (!patientData) {
          navigate(ROUTES.KADER_HOME, { replace: true });
          return;
        }
        setPatient(patientData);

        await loadHistory(patientId);
      } catch (error) {
        const isAccessDenied = error.message?.includes("Akses ditolak");
        console.error(
          "Error loading examination history:",
          error,
          "ini adalah iscase",
          isAccessDenied,
        );
        toast.error(
          isAccessDenied
            ? "Anda tidak memiliki akses ke data ini."
            : "Gagal memuat data.",
        );

        navigate(ROUTES.KADER_HOME, { replace: true });
      }
    };

    fetchData();
  }, [patientId, loadById, loadHistory, navigate, currentUser]);

  // Siapkan data grafik (urut lama → baru)
  const chartData = [...history].reverse().map((e) => {
    const d = e.tanggal?.toDate?.() ?? new Date(e.tanggal?.seconds * 1000);
    return {
      label: toShort(d),
      bb: e.beratBadan,
      sistolik: e.sistolik,
      diastolik: e.diastolik,
      djj: e.djj,
    };
  });

  if (loading || !patient) {
    return (
      <PageLayout>
        <InlineLoader />
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <Header title={`Riwayat — ${patient.nama}`} backTo={-1} />

      {history.length === 0 ? (
        <EmptyState
          icon={BarChart2}
          title="Belum ada riwayat pemeriksaan"
          subtitle="Lakukan pemeriksaan pertama untuk melihat riwayat dan grafik tren"
        />
      ) : (
        <div className="space-y-6">
          <div className="flex gap-2 flex-wrap">
            {CHART_TABS.map((tab, i) => (
              <button
                key={i}
                onClick={() => setActiveChart(i)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200
                  ${
                    activeChart === i
                      ? "bg-primary text-white"
                      : "bg-white border border-gray-200 text-gray-600 hover:border-primary/40"
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {chartData.length >= 2 && (
            <Card className="p-5">
              <SectionHeader
                title={CHART_TABS[activeChart]}
                action={
                  <span className="text-xs text-gray-400">
                    {chartData.length} data
                  </span>
                }
              />
              <div className="h-64 mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  {activeChart === 0 ? (
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
                      <XAxis
                        dataKey="label"
                        tick={{ fontSize: 11, fill: "#9E9E9E" }}
                      />
                      <YAxis
                        tick={{ fontSize: 11, fill: "#9E9E9E" }}
                        unit=" kg"
                        domain={["auto", "auto"]}
                      />
                      <Tooltip formatter={(v) => [`${v} kg`, "Berat Badan"]} />
                      <Line
                        type="monotone"
                        dataKey="bb"
                        stroke="#42A5F5"
                        strokeWidth={2.5}
                        dot={{ fill: "#42A5F5", r: 4 }}
                        name="Berat Badan"
                      />
                    </LineChart>
                  ) : activeChart === 1 ? (
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
                      <XAxis
                        dataKey="label"
                        tick={{ fontSize: 11, fill: "#9E9E9E" }}
                      />
                      <YAxis
                        tick={{ fontSize: 11, fill: "#9E9E9E" }}
                        unit=" mmHg"
                        domain={[40, 180]}
                      />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="sistolik"
                        stroke="#EF5350"
                        strokeWidth={2.5}
                        dot={{ fill: "#EF5350", r: 4 }}
                        name="Sistolik"
                      />
                      <Line
                        type="monotone"
                        dataKey="diastolik"
                        stroke="#42A5F5"
                        strokeWidth={2.5}
                        dot={{ fill: "#42A5F5", r: 4 }}
                        name="Diastolik"
                      />
                    </LineChart>
                  ) : (
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
                      <XAxis
                        dataKey="label"
                        tick={{ fontSize: 11, fill: "#9E9E9E" }}
                      />
                      <YAxis
                        tick={{ fontSize: 11, fill: "#9E9E9E" }}
                        unit=" bpm"
                        domain={[80, 180]}
                      />
                      <Tooltip formatter={(v) => [`${v} bpm`, "DJJ"]} />
                      <ReferenceLine
                        y={110}
                        stroke="#EF5350"
                        strokeDasharray="5 4"
                        label={{
                          value: "110",
                          position: "right",
                          fontSize: 10,
                          fill: "#EF5350",
                        }}
                      />
                      <ReferenceLine
                        y={160}
                        stroke="#EF5350"
                        strokeDasharray="5 4"
                        label={{
                          value: "160",
                          position: "right",
                          fontSize: 10,
                          fill: "#EF5350",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="djj"
                        stroke="#66BB6A"
                        strokeWidth={2.5}
                        dot={{ fill: "#66BB6A", r: 4 }}
                        name="DJJ"
                      />
                    </LineChart>
                  )}
                </ResponsiveContainer>
              </div>
            </Card>
          )}

          {chartData.length < 2 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-700">
              ⚠️ Minimal 2 pemeriksaan untuk menampilkan grafik tren.
            </div>
          )}

          <Card className="p-5 overflow-x-auto">
            <SectionHeader title="Ringkasan Data" />
            <table className="w-full text-sm mt-3 min-w-[600px]">
              <thead>
                <tr className="bg-primary-pale">
                  {[
                    "Tanggal",
                    "Usia (mgg)",
                    "Tensi",
                    "BB (kg)",
                    "DJJ",
                    "Status Ibu",
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left px-3 py-2.5 text-primary font-semibold text-xs"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {history.map((e, i) => {
                  const d =
                    e.tanggal?.toDate?.() ??
                    new Date(e.tanggal?.seconds * 1000);
                  return (
                    <tr
                      key={e.id}
                      onClick={() => navigate(buildPath.examResult(e.id))}
                      className={`border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition-colors
                        ${i % 2 === 1 ? "bg-gray-50/50" : ""}`}
                    >
                      <td className="px-3 py-2.5 font-medium text-gray-900">
                        {toShort(d)}
                      </td>
                      <td className="px-3 py-2.5 text-gray-600">
                        {e.usiaKehamilan}
                      </td>
                      <td className="px-3 py-2.5 text-gray-600">
                        {e.sistolik}/{e.diastolik}
                      </td>
                      <td className="px-3 py-2.5 text-gray-600">
                        {e.beratBadan}
                      </td>
                      <td className="px-3 py-2.5 text-gray-600">{e.djj}</td>
                      <td className="px-3 py-2.5">
                        <Badge status={e.statusIbu} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Card>
        </div>
      )}
    </PageLayout>
  );
}
