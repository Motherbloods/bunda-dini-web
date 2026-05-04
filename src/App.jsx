import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { ROUTES } from "./constants/routes";

// Auth
import LoginPage from "./pages/auth/LoginPage";

import KaderHomePage from "./pages/kader/KaderHomePage";
import AddPatientPage from "./pages/kader/AddPatientPage";
import PatientDetailPage from "./pages/kader/PatientDetailPage";
import EditPatientPage from "./pages/kader/EditPatientPage";

import ExaminationPage from "./pages/kader/examination/ExaminationPage";
import ExaminationResultPage from "./pages/kader/examination/ExaminationResultPage";
import ExaminationHistoryPage from "./pages/kader/examination/ExaminationHistoryPage";

function ProtectedRoute({ children, allowedRoles }) {
  const { currentUser, status } = useAuth();

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (status === "unauthenticated") {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(currentUser?.role)) {
    return (
      <Navigate
        to={
          currentUser?.role === "bidan"
            ? ROUTES.BIDAN_DASHBOARD
            : ROUTES.KADER_HOME
        }
        replace
      />
    );
  }

  return children;
}

function PublicRoute({ children }) {
  const { currentUser, status } = useAuth();

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (currentUser) {
    return (
      <Navigate
        to={
          currentUser.role === "bidan"
            ? ROUTES.BIDAN_DASHBOARD
            : ROUTES.KADER_HOME
        }
        replace
      />
    );
  }

  return children;
}

function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 gap-3">
      <p className="text-6xl font-bold text-gray-200">404</p>
      <p className="text-gray-500 text-sm">Halaman tidak ditemukan</p>
      <button
        onClick={() => navigate(-1)}
        className="mt-2 px-4 py-2 text-sm bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors"
      >
        ← Kembali
      </button>
    </div>
  );
}

export default function App() {
  const { currentUser, status } = useAuth();

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Memuat aplikasi...</p>
        </div>
      </div>
    );
  }

  const getHomeRoute = () => {
    if (status === "unauthenticated") return ROUTES.LOGIN;
    return currentUser?.role === "bidan"
      ? ROUTES.BIDAN_DASHBOARD
      : ROUTES.KADER_HOME;
  };

  return (
    <Routes>
      <Route
        path={ROUTES.LOGIN}
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />

      <Route
        path={ROUTES.KADER_HOME}
        element={
          <ProtectedRoute allowedRoles={["kader"]}>
            <KaderHomePage />
          </ProtectedRoute>
        }
      />

      <Route
        path={ROUTES.ADD_PATIENT}
        element={
          <ProtectedRoute allowedRoles={["kader"]}>
            <AddPatientPage />
          </ProtectedRoute>
        }
      />

      <Route
        path={ROUTES.PATIENT_DETAIL}
        element={
          <ProtectedRoute allowedRoles={["kader"]}>
            <PatientDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.EDIT_PATIENT}
        element={
          <ProtectedRoute allowedRoles={["kader"]}>
            <EditPatientPage />
          </ProtectedRoute>
        }
      />

      <Route
        path={ROUTES.EXAMINE}
        element={
          <ProtectedRoute allowedRoles={["kader"]}>
            <ExaminationPage />
          </ProtectedRoute>
        }
      />

      <Route
        path={ROUTES.EXAM_HISTORY}
        element={
          <ProtectedRoute allowedRoles={["kader"]}>
            <ExaminationHistoryPage />
          </ProtectedRoute>
        }
      />

      <Route
        path={ROUTES.EXAM_RESULT}
        element={
          <ProtectedRoute allowedRoles={["kader", "bidan"]}>
            <ExaminationResultPage />
          </ProtectedRoute>
        }
      />

      <Route
        path={ROUTES.BIDAN_DASHBOARD}
        element={
          <ProtectedRoute allowedRoles={["bidan"]}>
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 gap-4">
              <p className="text-gray-500 text-sm">
                Bidan dashboard coming soon...
              </p>
              <button
                onClick={() =>
                  import("./firebase/config").then(({ auth }) => auth.signOut())
                }
                className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Logout
              </button>
            </div>
          </ProtectedRoute>
        }
      />

      {/* <Route
        path={ROUTES.BIDAN_DASHBOARD}
        element={
          <ProtectedRoute allowedRoles={["bidan"]}>
            <BidanDashboard />
          </ProtectedRoute>
        }
      /> */}

      <Route path="/" element={<Navigate to={getHomeRoute()} replace />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
