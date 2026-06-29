import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchScans } from "../services/api";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";
import ChatWindow from "../components/ChatWindow";
import "../styles/chat.css";

export default function ChatPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [scans, setScans] = useState([]);
  const [activeScanId, setActiveScanId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
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
    setSidebarOpen(false);
  };

  const handleSelect = (scanId) => {
    setActiveScanId(scanId);
    setSidebarOpen(false);
  };

  const handleNewScan = () => {
    setActiveScanId(null);
    setSidebarOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
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
        <ChatWindow activeScan={activeScan} onScanCreated={handleScanCreated} onOpenSidebar={() => setSidebarOpen(true)} />
      )}
    </div>
  );
}
