import { useEffect, useRef, useState } from "react";
import { fetchMessages, sendMessage, createScan } from "../services/api";
import DiagnosisCard from "./DiagnosisCard";
import MessageBubble from "./MessageBubble";

export default function ChatWindow({ activeScan, onScanCreated, onOpenSidebar }) {
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (!activeScan) {
      setMessages([]);
      return;
    }
    setLoadingMessages(true);
    fetchMessages(activeScan.id)
      .then(setMessages)
      .catch(() => setError("Couldn't load this conversation."))
      .finally(() => setLoadingMessages(false));
  }, [activeScan]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, activeScan]);

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const scan = await createScan(file);
      onScanCreated(scan);
    } catch {
      setError("Couldn't read that photo. Try a clearer shot of the leaf.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleAsk = async (question) => {
    if (!activeScan || sending) return;
    setSending(true);
    setError("");
    const optimistic = { role: "user", content: question, created_at: new Date().toISOString() };
    setMessages((prev) => [...prev, optimistic]);
    try {
      const message = await sendMessage(activeScan.id, question);
      setMessages((prev) => [...prev, message]);
    } catch {
      setError("PaddyPal couldn't answer that just now — try again.");
    } finally {
      setSending(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    handleAsk(text.trim());
    setText("");
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
      <Topbar onOpenSidebar={onOpenSidebar} title={activeScan.disease_name} />
      <div className="messages" ref={scrollRef}>
        <DiagnosisCard
          diseaseName={activeScan.disease_name}
          confidenceScore={activeScan.confidence_score}
          onAsk={handleAsk}
        />
        {loadingMessages && (
          <p className="helper-text" style={{ padding: 16 }}>
            Loading conversation…
          </p>
        )}
        {messages.map((m, i) => (
          <MessageBubble key={m.id || i} role={m.role} content={m.content} created_at={m.created_at} />
        ))}
        {sending && (
          <div className="bubble-row">
            <div className="bubble bubble-bot typing-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className="error-text" style={{ padding: "0 16px" }}>
          {error}
        </p>
      )}

      <form className="composer" onSubmit={handleSubmit}>
        <button type="button" className="composer-icon-btn" onClick={() => fileInputRef.current?.click()} title="New scan">
          📷
        </button>
        {fileInput}
        <input
          type="text"
          placeholder="Ask about causes, treatment, prevention…"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button type="submit" className="composer-icon-btn composer-send" disabled={!text.trim() || sending}>
          ➤
        </button>
      </form>
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
