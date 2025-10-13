export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export async function apiFetch(endpoint: string, options?: RequestInit) {
  const res = await fetch(`${API_BASE_URL}${endpoint}`, options);

  let data;
  try {
    data = await res.json();
  } catch {
    data = {};
  }

  return { res, data }; // return both response and JSON
}
