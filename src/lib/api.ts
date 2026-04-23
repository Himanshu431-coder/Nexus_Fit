const API_BASE = import.meta.env.PROD
  ? "https://himanshuml24-nexus-fit-api.hf.space"
  : "http://127.0.0.1:8000";

export const predictUrl = `${API_BASE}/api/v1/predict`;
export const zoneUrl = `${API_BASE}/api/v1/predict-zone`;
export const coachUrl = `${API_BASE}/api/v1/coach/chat`;
export const healthUrl = `${API_BASE}/api/v1/health`;
export const driftUrl = `${API_BASE}/api/v1/drift-report`;
export const metadataUrl = `${API_BASE}/api/v1/metadata`;
export const modelComparisonUrl = `${API_BASE}/api/v1/model-comparison`;