import Constants from "expo-constants";
import type { DocRequest, RequestStatus, Service, User } from "./types";

// Where the Express backend is running.
// 1. If EXPO_PUBLIC_API_URL is set in .env, use it (needed once the backend is deployed).
// 2. Otherwise, in development, use the same computer that's running "npx expo start".
//    Your phone can't reach "localhost" on your laptop, so we take the laptop's
//    Wi-Fi IP address from the Expo dev server and use port 5000.
function getApiUrl() {
  if (process.env.EXPO_PUBLIC_API_URL) return process.env.EXPO_PUBLIC_API_URL.replace(/\/$/, "");
  const host = Constants.expoConfig?.hostUri?.split(":")[0];
  return host ? `http://${host}:5000` : "http://localhost:5000";
}

export const API_URL = getApiUrl();

// An error that carries the HTTP status, so screens can react to 401s etc.
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

type Options = {
  method?: "GET" | "POST" | "PATCH";
  token?: string | null;
  body?: unknown;
  form?: FormData;
};

// One helper for every API call: adds the token, sends JSON or a form,
// and turns error responses into readable messages.
async function request<T>(path: string, { method = "GET", token, body, form }: Options = {}): Promise<T> {
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body) headers["Content-Type"] = "application/json";
  // For forms we do NOT set Content-Type: fetch adds it with the right "boundary" itself

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: form ?? (body ? JSON.stringify(body) : undefined),
    });
  } catch {
    throw new ApiError(
      `Can't reach the server at ${API_URL}. Check that the backend is running and your phone is on the same Wi-Fi.`,
      0,
    );
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(data.message || "Something went wrong.", res.status);
  return data as T;
}

type AuthResponse = { token: string; user: User };

export const api = {
  register: (name: string, email: string, password: string) =>
    request<AuthResponse>("/api/auth/register", { method: "POST", body: { name, email, password } }),

  login: (email: string, password: string) =>
    request<AuthResponse>("/api/auth/login", { method: "POST", body: { email, password } }),

  me: (token: string) => request<{ user: User }>("/api/auth/me", { token }),

  services: () => request<Service[]>("/api/services"),

  myRequests: (token: string) => request<DocRequest[]>("/api/requests/mine", { token }),

  allRequests: (token: string, status?: RequestStatus) =>
    request<DocRequest[]>(`/api/requests${status ? `?status=${status}` : ""}`, { token }),

  getRequest: (token: string, id: string) => request<DocRequest>(`/api/requests/${id}`, { token }),

  createRequest: (token: string, form: FormData) =>
    request<DocRequest>("/api/requests", { method: "POST", token, form }),

  // A 5-minute link that opens one uploaded file in the browser
  fileLink: (token: string, id: string, storedName: string) =>
    request<{ url: string }>(`/api/requests/${id}/files/${storedName}/link`, { token }),

  updateStatus: (token: string, id: string, status: RequestStatus, note?: string) =>
    request<DocRequest>(`/api/requests/${id}/status`, { method: "PATCH", token, body: { status, note } }),
};
