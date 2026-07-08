import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchScans } from "../services/api";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";
import ChatWindow from "../components/ChatWindow";
import "../styles/chat.css";

const DESKTOP_BREAKPOINT = 768;
function getDefaultSidebarOpen() {
  if (typeof window === "undefined") return false;
  return window.innerWidth >= DESKTOP_BREAKPOINT;
}

export default function ChatPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [scans, setScans] = useState([]);
  const [activeScanId, setActiveScanId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(getDefaultSidebarOpen);
  const [loadingScans, setLoadingScans] = useState(true);

  useEffect(() => {
    fetchScans()
      .then(setScans)
      .catch(() => setScans([]))
      .finally(() => setLoadingScans(false));
  }, []);

  const activeScan = scans.find((s) => s.id === activeScanId) || null;

  const handleScanCreated = (scan) => {
    setScans((prev) => [scan, ...prev]);
    setActiveScanId(scan.id);
    if (!getDefaultSidebarOpen()) setSidebarOpen(false);
  };

  const handleSelect = (scanId) => {
    setActiveScanId(scanId);
    if (!getDefaultSidebarOpen()) setSidebarOpen(false);
  };

  const handleNewScan = () => {
    setActiveScanId(null);
    if (!getDefaultSidebarOpen()) setSidebarOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const handleToggleSidebar = () => setSidebarOpen((open) => !open);

  const handleScanUpdated = (updatedScan) => {
    setScans((prev) => prev.map((s) => (s.id === updatedScan.id ? updatedScan : s)));
  };

  return (
    <div className="chat-shell">
      <Sidebar
        scans={scans}
        activeScanId={activeScanId}
        onSelect={handleSelect}
        onNewScan={handleNewScan}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        user={user}
        onLogout={handleLogout}
      />
      {loadingScans ? (
        <div className="chat-main">
          <p className="helper-text" style={{ padding: 24 }}>
            Loading your scans…
          </p>
        </div>
      ) : (
        <ChatWindow
          activeScan={activeScan}
          onScanCreated={handleScanCreated}
          onScanUpdated={handleScanUpdated}
          onOpenSidebar={handleToggleSidebar}
        />
      )}
    </div>
  );
}
