import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  Users,
  UserCheck,
  LayoutDashboard,
  Download,
  LogOut,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { logout } from "../../services/authService";
import { useProfileModal } from "../../context/ProfileModalContext";
import { ROUTES } from "../../constants/routes";
import { ConfirmDialog } from "../ui/Modal";
import clsx from "clsx";
import toast from "react-hot-toast";

const KADER_MENU = [
  { label: "Beranda", icon: LayoutDashboard, to: ROUTES.KADER_HOME },
];

const BIDAN_MENU = [
  { label: "Dashboard", icon: LayoutDashboard, to: ROUTES.BIDAN_DASHBOARD },
  { label: "Semua Pasien", icon: Users, to: ROUTES.ALL_PATIENTS },
  { label: "Kelola Kader", icon: UserCheck, to: ROUTES.KADER_LIST },
  { label: "Export Data", icon: Download, to: ROUTES.EXPORT },
];

export default function Sidebar() {
  const { currentUser, isBidan } = useAuth();
  const { setOpen: openProfileModal } = useProfileModal();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const menus = isBidan ? BIDAN_MENU : KADER_MENU;

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await logout();
      navigate(ROUTES.LOGIN, { replace: true });
    } catch {
      toast.error("Gagal keluar. Coba lagi.");
    } finally {
      setLoggingOut(false);
    }
  }

  function handleOpenProfile(mobile = false) {
    if (mobile) setMobileOpen(false);
    openProfileModal(true);
  }

  const SidebarContent = ({ mobile = false }) => (
    <div className="flex flex-col h-full">
      <div className="flex flex-col gap-3 px-4 py-5 border-b border-gray-100">
        {mobile ? (
          <>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src="/images/logo.jpg"
                  alt="Logo Bunda Dini"
                  className="w-9 h-9 object-contain rounded-lg flex-shrink-0"
                />
                <div className="min-w-0">
                  <p className="font-bold text-gray-900 text-sm leading-tight">
                    Bunda Dini
                  </p>
                  <p className="text-xs text-gray-400 truncate">
                    {isBidan ? "Dashboard Bidan" : "Dashboard Kader"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <span className="text-[10px] text-gray-400">Didukung oleh</span>
              <div className="flex items-center gap-2">
                <img
                  src="/images/tutwuri.webp"
                  alt="Tut Wuri Handayani"
                  className="h-3.5 object-contain"
                />
                <img
                  src="/images/kemendiktisaintek.png"
                  alt="Kemendiktisaintek"
                  className="h-3.5 object-contain"
                />
                <img
                  src="/images/udb.jpg"
                  alt="Universitas Duta Bangsa"
                  className="h-3.5 object-contain"
                />
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0">
                <img
                  src="/images/logo.jpg"
                  alt="Logo"
                  className="w-10 h-10 object-contain"
                />
              </div>
              {!collapsed && (
                <div className="min-w-0">
                  <p className="font-bold text-gray-900 text-sm leading-tight">
                    Bunda Dini
                  </p>
                  <p className="text-xs text-gray-400 truncate">
                    {isBidan ? "Dashboard Bidan" : "Dashboard Kader"}
                  </p>
                </div>
              )}
              <button
                onClick={() => setCollapsed(!collapsed)}
                className="ml-auto text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
              >
                {collapsed ? <ChevronRight size={18} /> : <Menu size={18} />}
              </button>
            </div>
            {!collapsed && (
              <div className="flex items-center gap-2 pl-1">
                <span className="text-[10px] text-gray-400">Didukung oleh</span>
                <div className="flex items-center gap-2">
                  <img
                    src="/images/tutwuri.webp"
                    alt="Tut Wuri Handayani"
                    className="h-3 object-contain"
                  />
                  <img
                    src="/images/kemendiktisaintek.png"
                    alt="Kemendiktisaintek"
                    className="h-3 object-contain"
                  />
                  <img
                    src="/images/udb.jpg"
                    alt="Universitas Duta Bangsa"
                    className="h-3 object-contain"
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {menus.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end
            onClick={() => mobile && setMobileOpen(false)}
            className={({ isActive }) =>
              clsx(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-primary-pale text-primary"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                collapsed && !mobile && "justify-center",
              )
            }
          >
            <item.icon size={20} className="flex-shrink-0" />
            {(!collapsed || mobile) && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-gray-100 p-3">
        {!collapsed || mobile ? (
          <div
            className={clsx(
              "flex items-center gap-3 px-2 py-2 mb-2 rounded-xl transition-colors",
              isBidan && "cursor-pointer hover:bg-gray-50",
            )}
            onClick={() => isBidan && handleOpenProfile(mobile)}
          >
            <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
              <img
                src="/images/user.png"
                alt="User"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {currentUser?.nama ?? "-"}
              </p>
              <p className="text-xs text-gray-400 capitalize">
                {currentUser?.role}
              </p>
            </div>
            {isBidan && (
              <ChevronRight
                size={14}
                className="text-gray-400 ml-auto flex-shrink-0"
              />
            )}
          </div>
        ) : (
          isBidan && (
            <button
              onClick={() => handleOpenProfile()}
              title="Profil Bidan"
              className="flex items-center justify-center w-full p-2 mb-1 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <div className="w-8 h-8 bg-primary-pale rounded-full flex items-center justify-center">
                <span className="text-primary font-bold text-sm">
                  {currentUser?.nama?.[0]?.toUpperCase() ?? "U"}
                </span>
              </div>
            </button>
          )
        )}

        <button
          onClick={() => setShowLogout(true)}
          className={clsx(
            "flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium",
            "text-gray-500 hover:bg-red-50 hover:text-danger transition-colors",
            collapsed && !mobile && "justify-center",
          )}
        >
          <LogOut size={18} className="flex-shrink-0" />
          {(!collapsed || mobile) && <span>Keluar</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed top-4 left-4 z-40 p-2 bg-white rounded-xl shadow-md border border-gray-100
                   text-gray-600 hover:text-gray-900 transition-colors"
      >
        <Menu size={22} />
      </button>

      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-50 bg-black/40"
          onClick={() => setMobileOpen(false)}
        >
          <aside
            className="absolute inset-0 bg-white flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <SidebarContent mobile />
          </aside>
        </div>
      )}

      <aside
        className={clsx(
          "hidden md:flex h-screen bg-white border-r border-gray-100 flex-col transition-all duration-300 sticky top-0",
          collapsed ? "w-16" : "w-64",
        )}
      >
        <SidebarContent />
      </aside>

      <ConfirmDialog
        isOpen={showLogout}
        onClose={() => setShowLogout(false)}
        onConfirm={handleLogout}
        title="Keluar"
        message="Apakah Anda yakin ingin keluar dari aplikasi?"
        confirmLabel="Ya, Keluar"
        isDangerous
        loading={loggingOut}
      />
    </>
  );
}
