import { CODE_MAP } from "./diseaseData.js";

async function predictDisease(imageBuffer, originalFilename, mimetype) {
  const form = new FormData();
  const blob = new Blob([imageBuffer], { type: mimetype });
  form.append("file", blob, originalFilename);
  form.append("conf", "0.25");
  form.append("iou", "0.7");
  form.append("imgsz", "640");

  const response = await fetch(process.env.AI_SERVICE_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.AI_SERVICE_API_KEY}` },
    body: form,
  });

  if (!response.ok) {
    throw new Error(`AI service returned ${response.status}: ${await response.text()}`);
  }

  const result = await response.json();
  const predictions = result?.images?.[0]?.results;
  if (!predictions || predictions.length === 0) {
    throw new Error("AI service returned no predictions");
  }

  // Top 5 candidates, sorted, confidence rounded — this is the list the
  // frontend shows/uses before the user picks a crop-age bucket.
  return [...predictions]
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 5)
    .map((p) => ({
      disease_code: CODE_MAP[p.name] || p.name,
      confidence: +p.confidence.toFixed(4),
    }));
}

export { predictDisease };