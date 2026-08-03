const BASE = `${process.env.REACT_APP_API_URL ?? "http://localhost:1357"}/api/pg`;

function authHeaders() {
  const token = localStorage.getItem("pg_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export interface PgUser {
  id: number;
  email: string;
  username: string;
  avatar?: string;
  wallet_address?: string;
  created_at: string;
}

export interface BlogPost {
  id: number;
  title: string;
  content: string;
  category: string;
  author: string;
  tags: string[];
  image_url: string;
  created_at: string;
}

export interface Transaction {
  id: number;
  type: "swap" | "buy" | "sell" | "transfer";
  coin_id: string;
  coin_symbol: string;
  amount_usd: number;
  amount_coin: number;
  tx_hash?: string;
  status: "pending" | "confirmed" | "failed";
  created_at: string;
}

export interface Favorite {
  id: number;
  coin_id: string;
  coin_name: string;
  coin_symbol: string;
  added_at: string;
}

// Auth
export async function pgRegister(email: string, password: string, username?: string) {
  const res = await fetch(`${BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, username }),
  });
  return res.json();
}

export async function pgLogin(email: string, password: string) {
  const res = await fetch(`${BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return res.json();
}

export async function pgMe(): Promise<{ success: boolean; data?: PgUser }> {
  const res = await fetch(`${BASE}/auth/me`, { headers: authHeaders() as HeadersInit });
  return res.json();
}

// Blog
export async function pgGetBlogPosts(
  limit = 10,
  offset = 0,
  category = ""
): Promise<{ success: boolean; data: BlogPost[]; total: number }> {
  const params = new URLSearchParams({ limit: String(limit), offset: String(offset) });
  if (category) params.set("category", category);
  const res = await fetch(`${BASE}/blog?${params}`);
  return res.json();
}

export async function pgGetBlogPost(id: number): Promise<{ success: boolean; data: BlogPost; msg?: string }> {
  const res = await fetch(`${BASE}/blog/${id}`);
  return res.json();
}

// Transactions
export async function pgGetTransactions(): Promise<{ success: boolean; data: Transaction[] }> {
  const res = await fetch(`${BASE}/transactions`, { headers: authHeaders() as HeadersInit });
  return res.json();
}

export async function pgCreateTransaction(data: Omit<Transaction, "id" | "status" | "created_at">) {
  const res = await fetch(`${BASE}/transactions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() } as HeadersInit,
    body: JSON.stringify(data),
  });
  return res.json();
}

// Favorites
export async function pgGetFavorites(): Promise<{ success: boolean; data: Favorite[] }> {
  const res = await fetch(`${BASE}/favorites`, { headers: authHeaders() as HeadersInit });
  return res.json();
}

export async function pgAddFavorite(coin_id: string, coin_name: string, coin_symbol: string) {
  const res = await fetch(`${BASE}/favorites`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() } as HeadersInit,
    body: JSON.stringify({ coin_id, coin_name, coin_symbol }),
  });
  return res.json();
}

export async function pgRemoveFavorite(coinId: string) {
  const res = await fetch(`${BASE}/favorites/${coinId}`, {
    method: "DELETE",
    headers: authHeaders() as HeadersInit,
  });
  return res.json();
}

// Helpers
export function getStoredUser(): PgUser | null {
  try {
    const u = localStorage.getItem("pg_user");
    return u ? JSON.parse(u) : null;
  } catch {
    return null;
  }
}

export function saveSession(token: string, user: PgUser) {
  localStorage.setItem("pg_token", token);
  localStorage.setItem("pg_user", JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem("pg_token");
  localStorage.removeItem("pg_user");
}
