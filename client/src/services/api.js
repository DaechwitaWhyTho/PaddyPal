import axios from "axios";

// Set VITE_API_URL in your frontend .env, e.g. VITE_API_URL=http://localhost:5000
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const api = axios.create({ baseURL: API_URL });

// Attach the JWT to every request once the user is logged in
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("paddypal_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/* ----------------------------------------------------------------------
   Auth — matches server/routes/authRoutes.js
---------------------------------------------------------------------- */
export const registerUser = (data) =>
  api.post("/api/auth/register", data).then((r) => r.data);

export const loginUser = (data) =>
  api.post("/api/auth/login", data).then((r) => r.data);

export const fetchMe = () => api.get("/api/auth/me").then((r) => r.data);

export const logoutUser = () => api.post("/api/auth/logout").then((r) => r.data);

export const forgotPassword = (email) =>
  api.post("/api/auth/forgot-password", { email }).then((r) => r.data);

export const resetPassword = (data) =>
  api.post("/api/auth/reset-password", data).then((r) => r.data);

/* ----------------------------------------------------------------------
   Scans & chat — matches server.js exactly. Every route replies with
   { success, data }, scan rows use "id" (not "scan_id"), and the upload
   field is "leafImage".
---------------------------------------------------------------------- */
export const fetchScans = () => api.get("/api/scans").then((r) => r.data.data);

// Step 1: upload photo -> candidate diseases (nothing final yet)
export const createScan = (imageFile) => {
  const formData = new FormData();
  formData.append("leafImage", imageFile);
  return api
    .post("/api/scan", formData, { headers: { "Content-Type": "multipart/form-data" } })
    .then((r) => r.data.data); // scan row with .candidates, disease_code still null
};

// Step 2: user picks young/adult/old -> final disease + remedies
export const diagnoseScan = (scanId, ageGroup) =>
  api.post(`/api/scan/${scanId}/diagnose`, { age_group: ageGroup }).then((r) => r.data.data);
  // { scan, disease, risk_level, remedies }

// Re-open a previously diagnosed scan from the sidebar
export const fetchScanDetail = (scanId) => api.get(`/api/scan/${scanId}`).then((r) => r.data.data);