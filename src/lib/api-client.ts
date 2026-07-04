const API_BASE = import.meta.env.VITE_API_URL ?? "/api";
const TOKEN_KEY = "quickpoll_token";

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  const token = getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (res.status === 204) return undefined as T;

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(res.status, data.error ?? "Something went wrong. Please try again.");
  }
  return data as T;
}

export type ApiUser = { name: string; email: string };
export type ApiOption = { id: string; label: string; votes: number };
export type ApiPoll = {
  id: string;
  question: string;
  options: ApiOption[];
  voters: number;
  owner: string | null;
  createdAt: string;
};

export const api = {
  signUp: (name: string, email: string, password: string) =>
    request<{ user: ApiUser; token: string }>("/auth/signup", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    }),
  signIn: (email: string, password: string) =>
    request<{ user: ApiUser; token: string }>("/auth/signin", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  me: () => request<{ user: ApiUser }>("/auth/me"),
  listPolls: () => request<ApiPoll[]>("/polls"),
  getPoll: (id: string) => request<ApiPoll>(`/polls/${id}`),
  createPoll: (question: string, options: string[]) =>
    request<ApiPoll>("/polls", {
      method: "POST",
      body: JSON.stringify({ question, options }),
    }),
  vote: (pollId: string, optionId: string) =>
    request<ApiPoll>(`/polls/${pollId}/vote`, {
      method: "POST",
      body: JSON.stringify({ optionId }),
    }),
  deletePoll: (id: string) => request<void>(`/polls/${id}`, { method: "DELETE" }),
};
