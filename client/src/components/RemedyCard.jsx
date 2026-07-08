import { severityColor } from "../utils/severity";

const LEVEL_KEY = { critical: "alert", high: "alert", moderate: "caution", low: "caution", none: "healthy", unknown: "caution" };

export default function RemedyCard({ disease, riskLevel, confidence, remedies, symptoms = [], varietySensitivity = [] }) {
  const pct = Math.round((confidence || 0) * 100);
  const severity = LEVEL_KEY[riskLevel] || "caution";

  if (!disease) return null;

  const isHealthy = disease.code === "normal";

  return (
    <div className="remedy-card" style={{ borderLeftColor: severityColor[severity] }}>
      <div className="remedy-header">
        <h3>
          {disease.name_bn} <span className="remedy-en">({disease.name_en})</span>
        </h3>
        <span className="remedy-meta">
          {pct}% match{!isHealthy && ` · risk at this age: ${riskLevel}`}
        </span>
      </div>

      {disease.description && <p className="helper-text">{disease.description}</p>}

      {isHealthy ? (
        <p className="remedy-healthy">No disease detected — keep monitoring as usual. 🌾</p>
      ) : (
        <>
          {remedies.map((group) => (
            <div key={group.category} className="remedy-group">
              <h4>{group.category}</h4>
              <ul>
                {group.items.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          ))}

          {symptoms.length > 0 && (
            <div className="remedy-group">
              <h4>Symptoms to check for</h4>
              {symptoms.map((s) => (
                <div key={s.stage} style={{ marginBottom: 8 }}>
                  <strong style={{ fontSize: 12, color: "var(--color-ink-soft)" }}>{s.stage}</strong>
                  <ul>
                    {s.items.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

          {varietySensitivity.length > 0 && (
            <div className="remedy-group">
              <h4>Variety sensitivity</h4>
              <ul>
                {varietySensitivity.map((v, i) => (
                  <li key={i}>
                    {v.variety} — <strong>{v.risk_level}</strong>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
}