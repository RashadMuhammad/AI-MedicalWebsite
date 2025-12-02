export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  // Get sessionId from localStorage
  const sessionId = typeof window !== "undefined" ? localStorage.getItem("sessionId") : null;

  const headers = {
    ...(options.headers || {}),
    ...(sessionId ? { "x-session-id": sessionId } : {}),
    "Content-Type": "application/json",
  };

  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: "include",
  });

  let data;
  try {
    data = await res.json();
  } catch {
    data = {};
  }

  return { res, data };
}
