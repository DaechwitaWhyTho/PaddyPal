const AGE_OPTIONS = [
  { id: "young", label: "Young", helper: "0–30 days · seedling / early tillering" },
  { id: "adult", label: "Adult", helper: "31–60 days · tillering / panicle stage" },
  { id: "old", label: "Old", helper: "60+ days · maturity" },
];

export default function AgeSelector({ onSelect, loading }) {
  return (
    <div className="age-select-card">
      <h3>How old is the crop?</h3>
      <p className="helper-text">This narrows the scan's top matches down to one diagnosis.</p>
      <div className="age-options">
        {AGE_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            className="age-option-btn"
            onClick={() => onSelect(opt.id)}
            disabled={loading}
          >
            <span className="age-option-label">{opt.label}</span>
            <span className="age-option-helper">{opt.helper}</span>
          </button>
        ))}
      </div>
      {loading && <p className="helper-text">Diagnosing…</p>}
    </div>
  );
}