const API_BASE = "https://ai-consulting-copilot.onrender.com";

function authHeaders() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function loginUser(username, password) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Login failed");
  return data;
}

export async function signupUser(email, username, name, password) {
  const res = await fetch(`${API_BASE}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, username, name, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Signup failed");
  return data;
}

export async function fetchMe() {
  const res = await fetch(`${API_BASE}/auth/me`, {
    headers: { ...authHeaders() },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Auth failed");
  return data;
}

export function chartUrl(filename) {
  return `${API_BASE}/charts/${filename}`;
}

export function slidesPptxUrl(filename) {
  return `${API_BASE}/slides/${filename}`;
}

export async function fetchDashboard() {
  const res = await fetch(`${API_BASE}/dashboard`, {
    headers: { ...authHeaders() },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Dashboard fetch failed");
  return data;
}

export async function checkHealth() {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error(`Health check failed: ${res.status}`);
  return res.json();
}

export async function sendChatMessage(message, documentId) {
  const body = { message };
  if (documentId) body.document_id = documentId;
  const res = await fetch(`${API_BASE}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || `Chat request failed: ${res.status}`);
  return data;
}

export async function uploadPdf(file) {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${API_BASE}/upload/pdf`, {
    method: "POST",
    headers: { ...authHeaders() },
    body: form,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || `Upload failed: ${res.status}`);
  return data;
}

export async function uploadExcel(file) {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${API_BASE}/upload/excel`, {
    method: "POST",
    headers: { ...authHeaders() },
    body: form,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || `Upload failed: ${res.status}`);
  return data;
}

export async function askExcel(spreadsheetId, question) {
  const res = await fetch(`${API_BASE}/excel/ask`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ spreadsheet_id: spreadsheetId, question }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || `Analysis failed: ${res.status}`);
  return data;
}

export async function generateChart(spreadsheetId, chartType, xColumn, yColumn) {
  const body = { spreadsheet_id: spreadsheetId, chart_type: chartType, x_column: xColumn };
  if (yColumn) body.y_column = yColumn;
  const res = await fetch(`${API_BASE}/charts/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || `Chart generation failed: ${res.status}`);
  return data;
}

export async function summarizeExcel(spreadsheetId) {
  const res = await fetch(`${API_BASE}/excel/summarize`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ spreadsheet_id: spreadsheetId }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || `Summary failed: ${res.status}`);
  return data;
}

export async function generateSwot(sourceType, { sourceId, chatHistory } = {}) {
  const body = { source_type: sourceType };
  if (sourceId) body.source_id = sourceId;
  if (chatHistory) body.chat_history = chatHistory;
  const res = await fetch(`${API_BASE}/swot`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || `SWOT analysis failed: ${res.status}`);
  return data;
}

export async function generateSlides(executiveSummary) {
  const res = await fetch(`${API_BASE}/slides/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ executive_summary: executiveSummary }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || `Slide generation failed: ${res.status}`);
  return data;
}

export async function generateEmail(emailType, tone, context) {
  const body = { email_type: emailType, tone };
  if (context && context.trim()) body.context = context;
  const res = await fetch(`${API_BASE}/email/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || `Email generation failed: ${res.status}`);
  return data;
}
