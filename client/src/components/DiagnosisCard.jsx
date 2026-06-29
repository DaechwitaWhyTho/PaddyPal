import { getSeverity, severityColor, severityLabel } from "../utils/severity";

export default function DiagnosisCard({ diseaseName, confidenceScore, imageUrl, onAsk }) {
  const severity = getSeverity(diseaseName, confidenceScore);
  const pct = Math.round((confidenceScore || 0) * 100);

  return (
    <div className="diagnosis-card" style={{ borderLeftColor: severityColor[severity] }}>
      <div className="diagnosis-top">
        {imageUrl && <img src={imageUrl} alt="Scanned crop" className="diagnosis-thumb" />}
        <div>
          <span className="diagnosis-tag" style={{ color: severityColor[severity] }}>
            {severityLabel[severity]}
          </span>
          <h3>{diseaseName}</h3>
        </div>
      </div>

      <div className="confidence-row">
        <div className="confidence-track">
          <div className="confidence-fill" style={{ width: `${pct}%`, background: severityColor[severity] }} />
        </div>
        <span className="confidence-pct">{pct}%</span>
      </div>

      <div className="quick-replies">
        <button onClick={() => onAsk("What caused this?")}>What caused this?</button>
        <button onClick={() => onAsk("How do I treat it?")}>How do I treat it?</button>
        <button onClick={() => onAsk("How can I prevent it next time?")}>Prevent next time</button>
      </div>
    </div>
  );
}
