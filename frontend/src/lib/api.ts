export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const sessionId =
    typeof window !== "undefined" ? localStorage.getItem("sessionId") : null;

  // Detect if body is FormData
  const isFormData = options.body instanceof FormData;

  // Normalize headers to plain object
  const baseHeaders: Record<string, string> = {};
  if (options.headers instanceof Headers) {
    options.headers.forEach((value, key) => {
      baseHeaders[key] = value;
    });
  } else if (options.headers) {
    Object.assign(baseHeaders, options.headers);
  }

  const headers: Record<string, string> = {
    ...baseHeaders,
    ...(sessionId ? { "x-session-id": sessionId } : {}),
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
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
