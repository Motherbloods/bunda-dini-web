import Sidebar from "./Sidebar";
import { ProfileModalProvider } from "../../context/ProfileModalContext";
import BidanProfileModal from "./BidanProfileModal";

export default function PageLayout({ children }) {
  return (
    <ProfileModalProvider>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto px-6 py-8 pt-16 md:pt-8">
            {children}
          </div>
        </main>
      </div>
      <BidanProfileModal />
    </ProfileModalProvider>
  );
}
