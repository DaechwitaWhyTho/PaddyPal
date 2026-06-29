// The backend currently returns { disease_name, confidence_score } with no
// explicit severity field. This is a placeholder heuristic so the UI can
// still color-code results — swap it out once a real severity field exists.
export function getSeverity(diseaseName = "", confidenceScore = 0) {
  const name = diseaseName.toLowerCase();
  if (name.includes("healthy")) return "healthy";
  if (confidenceScore >= 0.7) return "alert";
  return "caution";
}

export const severityColor = {
  healthy: "var(--color-paddy)",
  caution: "var(--color-gold)",
  alert: "var(--color-rust)",
};

export const severityLabel = {
  healthy: "Looks healthy",
  caution: "Possible issue",
  alert: "Likely disease",
};
