import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { ROUTES } from "./constants/routes";

// Auth
import LoginPage from "./pages/auth/LoginPage";

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

      {/* <Route
        path={ROUTES.KADER_HOME}
        element={
          <ProtectedRoute allowedRoles={["kader"]}>
            <KaderHomePage />
          </ProtectedRoute>
        }
      />

      <Route
        path={ROUTES.BIDAN_DASHBOARD}
        element={
          <ProtectedRoute allowedRoles={["bidan"]}>
            <BidanDashboard />
          </ProtectedRoute>
        }
      /> */}

      <Route path="/" element={<Navigate to={getHomeRoute()} replace />} />
      <Route path="*" element={<Navigate to={getHomeRoute()} replace />} />
    </Routes>
  );
}
