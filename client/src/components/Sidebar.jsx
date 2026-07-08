import ThemeSwitcher from "./ThemeSwitcher";

export default function Sidebar({ scans, activeScanId, onSelect, onNewScan, isOpen, onClose, user, onLogout }) {
  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={onClose} />}
      <aside className={`sidebar ${isOpen ? "sidebar-open" : ""}`}>
        {/* Fixed-width inner wrapper so content doesn't reflow while the
            outer .sidebar animates its width open/closed on desktop. */}
        <div className="sidebar-content">
        <div className="sidebar-header">
          <span className="leaf">🌱</span>
          <span className="sidebar-brand">OnnoProhori</span>
        </div>

        <button className="btn btn-primary new-scan-btn" onClick={onNewScan}>
          + New scan
        </button>

        <div className="scan-list">
          {scans.length === 0 && (
            <p className="helper-text" style={{ padding: "0 16px" }}>
              Your past scans will show up here.
            </p>
          )}
          {scans.map((scan) => (
            <button
              key={scan.id}
              className={`scan-item ${scan.id === activeScanId ? "scan-item-active" : ""}`}
              onClick={() => onSelect(scan.id)}
            >
              <span className="scan-item-disease">{scan.disease_name}</span>
              <span className="scan-item-date">{new Date(scan.scanned_at).toLocaleDateString()}</span>
            </button>
          ))}
        </div>

          <ThemeSwitcher />

        <div className="sidebar-footer">
          <span className="sidebar-user">{user?.name}</span>
          <button className="btn btn-ghost" onClick={onLogout}>
            Log out
          </button>
        </div>
        </div>
      </aside>
    </>
  );
}
