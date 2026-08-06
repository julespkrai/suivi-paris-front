const API = process.env.NEXT_PUBLIC_API_URL!;

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('jwt_token');
}

export function setToken(token: string) {
  localStorage.setItem('jwt_token', token);
}

export function clearToken() {
  localStorage.removeItem('jwt_token');
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API}${path}`, { ...options, headers });

  if (res.status === 401) {
    clearToken();
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `HTTP ${res.status}`);
  }

  if (res.status === 204) return null as T;
  return res.json();
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) => request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) => request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) => request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};

export interface DashboardData {
  pl: number; roi: number | null; mise: number; miseReglee: number;
  engage: number; pot: number; bankroll: number; dep: number; ret: number; net: number;
  semaine: Record<string, number>; semaineDebut: string;
  counts: { paris: number; parisOuverts: number; combis: number; loto: number };
}

export interface Pari {
  id: number; canal: string; sport?: string; competition?: string; type?: string;
  description?: string; coteBase?: number; cote: number; mise: number;
  statut: string; retourSaisi?: number; date: string; pl: number;
}

export interface Depot {
  id: number; canal: string; depot?: number; retrait?: number; date: string;
}

export interface CombiLeg {
  id: number; sel: string; sport?: string; comp?: string; cote: number; statut: string; date: string;
}

export interface Combi {
  id: number; combiId: string; nom: string; comp?: string; mise: number; date: string;
  statut: string; cote: number; pl: number; legs: CombiLeg[];
}

export interface LotoFoot {
  id: number; type: string; nbGrilles: number; miseUnit: number; bons?: number;
  statut: string; gain?: number; date: string; miseTotal: number;
}
