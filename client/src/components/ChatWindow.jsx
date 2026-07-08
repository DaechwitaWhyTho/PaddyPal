import { useEffect, useRef, useState } from "react";
import { createScan, diagnoseScan, fetchScanDetail } from "../services/api";
import AgeSelector from "./AgeSelector";
import RemedyCard from "./RemedyCard";

export default function ChatWindow({ activeScan, onScanCreated, onScanUpdated, onOpenSidebar }) {
  const [uploading, setUploading] = useState(false);
  const [diagnosing, setDiagnosing] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [detail, setDetail] = useState(null); // { disease, risk_level, remedies }
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    setError("");
    setDetail(null);
    if (!activeScan) return;

    if (activeScan.disease_code) {
      // Already-diagnosed scan opened from the sidebar — reload its remedies.
      setLoadingDetail(true);
      fetchScanDetail(activeScan.id)
        .then(setDetail)
        .catch(() => setError("Couldn't load this scan."))
        .finally(() => setLoadingDetail(false));
    }
  }, [activeScan]);

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const scan = await createScan(file);
      onScanCreated(scan); // scan.candidates present, scan.disease_code is null
    } catch {
      setError("Couldn't read that photo. Try a clearer shot of the leaf.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleAgeSelect = async (ageGroup) => {
    if (!activeScan) return;
    setDiagnosing(true);
    setError("");
    try {
      const result = await diagnoseScan(activeScan.id, ageGroup);
      setDetail(result);
      onScanUpdated(result.scan); // updates disease_name in the sidebar list
    } catch {
      setError("Couldn't finish the diagnosis — try again.");
    } finally {
      setDiagnosing(false);
    }
  };

  const fileInput = (
    <input ref={fileInputRef} type="file" accept="image/*" capture="environment" onChange={handleFileSelect} hidden />
  );

  if (!activeScan) {
    return (
      <div className="chat-main">
        <Topbar onOpenSidebar={onOpenSidebar} title="New scan" />
        <div className="empty-state">
          <span className="leaf-big">🌾</span>
          <h2>Scan a paddy leaf</h2>
          <p className="helper-text">Snap a clear photo of the affected leaf to get a diagnosis.</p>
          <button className="btn btn-primary" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
            {uploading ? "Reading photo…" : "Take or choose a photo"}
          </button>
          {fileInput}
          {error && <p className="error-text">{error}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="chat-main">
      <Topbar onOpenSidebar={onOpenSidebar} title={activeScan.disease_name || "Diagnosing…"} />
      <div className="messages">
        {loadingDetail && <p className="helper-text" style={{ padding: 16 }}>Loading…</p>}

        {!activeScan.disease_code && !loadingDetail && (
          <AgeSelector onSelect={handleAgeSelect} loading={diagnosing} />
        )}

        {detail?.disease && (
          <RemedyCard
            disease={detail.disease}
            riskLevel={detail.risk_level}
            confidence={detail.scan?.confidence_score ?? activeScan.confidence_score}
            remedies={detail.remedies}
          />
        )}

        {error && <p className="error-text">{error}</p>}
      </div>

      <div className="composer composer-scan-only">
        <button className="btn btn-ghost" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
          📷 {uploading ? "Reading photo…" : "New scan"}
        </button>
        {fileInput}
      </div>
    </div>
  );
}

function Topbar({ onOpenSidebar, title }) {
  return (
    <div className="topbar">
      <button className="topbar-menu-btn" onClick={onOpenSidebar} aria-label="Open chat history">
        ☰
      </button>
      <span className="topbar-title">{title}</span>
    </div>
  );
}