import { useState, useRef } from 'react';
import { scanLeaf, sendChatMessage } from '../services/api'; // not found
import MessageBubble from './MessageBubble';

function ChatScreen() {
  const [messages, setMessages] = useState([]); // { role, type: 'text'|'image', content }
  const [scanId, setScanId] = useState(null);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleImageSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setMessages((prev) => [...prev, { role: 'user', type: 'image', content: previewUrl }]);
    setLoading(true);
    setError(null);

    try {
      const scan = await scanLeaf(file);
      setScanId(scan.id);
      const pct = (scan.confidence_score * 100).toFixed(1);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', type: 'text', content: `🌾 Diagnosis: **${scan.disease_name}** (${pct}% confidence). Ask me anything about it — causes, treatment, prevention.` },
      ]);
    } catch (err) {
      setError(err.response?.data?.message || 'Scan failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendText = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !scanId) return;

    const text = inputText.trim();
    setMessages((prev) => [...prev, { role: 'user', type: 'text', content: text }]);
    setInputText('');
    setLoading(true);
    setError(null);

    try {
      const reply = await sendChatMessage(scanId, text);
      setMessages((prev) => [...prev, { role: 'assistant', type: 'text', content: reply.content }]);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to get a reply. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', maxWidth: 480, margin: '0 auto' }}>
      <header style={{ padding: '14px 16px', borderBottom: '1px solid #eee', fontWeight: 600 }}>
        🌱 PaddyPal
      </header>

      <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
        {messages.length === 0 && (
          <p style={{ color: '#888', textAlign: 'center', marginTop: 40 }}>
            Snap or upload a photo of a paddy leaf to get started.
          </p>
        )}

        {messages.map((msg, i) =>
          msg.type === 'image' ? (
            <MessageBubble key={i} role={msg.role}>
              <img src={msg.content} alt="Uploaded leaf" style={{ width: 160, borderRadius: 10, display: 'block' }} />
            </MessageBubble>
          ) : (
            <MessageBubble key={i} role={msg.role}>
              {msg.content}
            </MessageBubble>
          )
        )}

        {loading && <p style={{ color: '#888', fontSize: 14 }}>Thinking...</p>}
        {error && <p style={{ color: '#c0392b', fontSize: 14 }}>{error}</p>}
      </div>

      <div style={{ borderTop: '1px solid #eee', padding: 12 }}>
        {!scanId ? (
          <button
            onClick={() => fileInputRef.current.click()}
            style={{ width: '100%', padding: 12, borderRadius: 10, border: 'none', background: '#2e7d32', color: '#fff', fontSize: 15 }}
          >
            📷 Scan a Leaf
          </button>
        ) : (
          <form onSubmit={handleSendText} style={{ display: 'flex', gap: 8 }}>
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask a follow-up question..."
              style={{ flex: 1, padding: 10, borderRadius: 10, border: '1px solid #ccc' }}
            />
            <button type="submit" disabled={loading} style={{ padding: '10px 16px', borderRadius: 10, border: 'none', background: '#2e7d32', color: '#fff' }}>
              Send
            </button>
          </form>
        )}

        <input
          type="file"
          accept="image/*"
          capture="environment"
          ref={fileInputRef}
          onChange={handleImageSelect}
          style={{ display: 'none' }}
        />
      </div>
    </div>
  );
}

export default ChatScreen;