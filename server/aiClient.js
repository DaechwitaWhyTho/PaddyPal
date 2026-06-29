// Isolated AI-service client. Swap the mock body below for a real axios
// call to your teammates' FastAPI /predict endpoint once it's deployed.
// Nothing else in the app needs to change when you do that swap.

async function predictDisease(imageBuffer, originalFilename, mimetype) {
  // ---- MOCK IMPLEMENTATION ----
  const mockDiseases = ['Bacterial Leaf Blight', 'Brown Spot', 'Leaf Smut', 'Healthy'];
  const disease_name = mockDiseases[Math.floor(Math.random() * mockDiseases.length)];
  const confidence_score = +(0.75 + Math.random() * 0.24).toFixed(4);
  return { disease_name, confidence_score };
}

export { predictDisease };