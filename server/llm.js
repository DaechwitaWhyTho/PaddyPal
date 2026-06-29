// This file is the ONLY place that needs to change once the team picks
// a provider (DeepSeek / Gemini / Groq). Everything else in the app
// talks to callLLM() and never needs to know which provider is behind it.

function buildSystemPrompt(diseaseName, confidenceScore) {
  return `You are an agricultural assistant specializing in paddy (rice) crop diseases.
This user's crop was just diagnosed with: ${diseaseName} (confidence: ${confidenceScore}).
Answer their questions about causes, symptoms, treatment, and prevention for this
specific disease. If asked something unrelated to paddy crops, redirect politely.`;
}

async function callLLM({ diseaseName, confidenceScore, conversationHistory, userMessage }) {
    // ---- MOCK IMPLEMENTATION ----
  // TODO: replace this block with a real provider call once decided.
  // Everything calling callLLM() will keep working unchanged.
  return `[Mock reply] Regarding "${diseaseName}": here's a placeholder answer to your question — "${userMessage}". Real AI response coming once the team picks a provider.`;
}

export { callLLM, buildSystemPrompt };