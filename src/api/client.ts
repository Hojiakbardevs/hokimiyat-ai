// src/api/client.ts
// Centralized fetch client with token handling and optional auto-refresh.

// Development: use proxy path, Production: use direct URL
const DEFAULT_BASE = import.meta.env.DEV ? '/api/v1' : 'http://10.10.0.60/api/v1';
export const API_BASE: string = (import.meta as any)?.env?.VITE_API_BASE || DEFAULT_BASE;

export type Tokens = { access?: string; refresh?: string };

export function getAccessToken(): string | null {
    return localStorage.getItem("access_token");
}

export function getRefreshToken(): string | null {
    return localStorage.getItem("refresh_token");
}

export function setTokens(tokens: Tokens) {
    if (tokens.access) localStorage.setItem("access_token", tokens.access);
    if (tokens.refresh) localStorage.setItem("refresh_token", tokens.refresh);
}

export function clearTokens() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
}

function isJson(headers: Headers) {
    const ct = headers.get("content-type") || "";
    return ct.includes("application/json");
}

// Internal refresh to avoid circular imports
import { API } from "./endpoints";

async function tryRefreshOnce(): Promise<boolean> {
    const refresh = getRefreshToken();
    if (!refresh) return false;
    try {
        const res = await fetch(`${API_BASE}${API.AUTH_REFRESH}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refresh }),
        });
        if (!res.ok) return false;
        const data = await res.json().catch(() => null as any);
        if (data?.access) {
            setTokens({ access: data.access, refresh: data.refresh || refresh });
            return true;
        }
        return false;
    } catch {
        return false;
    }
}

export interface ApiRequestOptions extends RequestInit {
    withAuth?: boolean;
    skipRefresh?: boolean; // internal flag to avoid infinite loop
}

export async function apiRequest<T = any>(path: string, options: ApiRequestOptions = {}): Promise<T> {
    const { withAuth = true, skipRefresh = false, headers, ...rest } = options;
    const token = getAccessToken();

    const mergedHeaders: Record<string, string> = {
        ...(headers as any),
    };

    // Agar FormData bo'lmasa va headers null/undefined bo'lmasa, JSON content-type o'rnatamiz
    const isFormData = (rest as any)?.body instanceof FormData;

    // headers null bo'lsa - FormData, undefined yoki {} bo'lsa - JSON
    if (headers !== null && !isFormData && !("Content-Type" in mergedHeaders)) {
        mergedHeaders["Content-Type"] = "application/json";
    }

    if (withAuth && token) {
        mergedHeaders["Authorization"] = `Bearer ${token}`;
    }

    // Support absolute URLs (e.g., pagination links) by detecting http/https
    const url = /^https?:\/\//i.test(path) ? path : `${API_BASE}${path}`;

    const res = await fetch(url, {
        ...rest,
        headers: mergedHeaders,
    });

    // If unauthorized, try refresh once then retry
    if (res.status === 401 && withAuth && !skipRefresh) {
        const refreshed = await tryRefreshOnce();
        if (refreshed) {
            const retryToken = getAccessToken();
            const retryHeaders: Record<string, string> = {
                ...(headers as any),
            };
            const isRetryFormData = (rest as any)?.body instanceof FormData;

            // headers null bo'lsa - FormData, undefined yoki {} bo'lsa - JSON
            if (headers !== null && !isRetryFormData && !("Content-Type" in retryHeaders)) {
                retryHeaders["Content-Type"] = "application/json";
            }

            if (retryToken) retryHeaders["Authorization"] = `Bearer ${retryToken}`;
            const retryUrl = /^https?:\/\//i.test(path) ? path : `${API_BASE}${path}`;
            const retry = await fetch(retryUrl, {
                ...rest,
                headers: retryHeaders,
            });
            if (!retry.ok) {
                const text = await retry.text();
                throw new Error(`Error ${retry.status}: ${text}`);
            }
            if (isJson(retry.headers)) {
                return (await retry.json()) as T;
            }
            return null as unknown as T;
        } else {
            clearTokens();
        }
    }

    if (!res.ok) {
        const text = await res.text();
        console.error(`API Error ${res.status} for ${path}:`, text);
        let errorMsg = `Error ${res.status}`;
        try {
            const errorData = JSON.parse(text);
            errorMsg = errorData.detail || errorData.message || JSON.stringify(errorData);
        } catch {
            errorMsg = text || errorMsg;
        }
        throw new Error(errorMsg);
    }

    if (isJson(res.headers)) {
        return (await res.json()) as T;
    }
    return null as unknown as T;
}
