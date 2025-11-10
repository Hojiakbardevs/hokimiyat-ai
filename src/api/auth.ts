// src/api/auth.ts
import { apiRequest, setTokens, clearTokens } from "./client";
import type { Tokens } from "./client";
import { API } from "./endpoints";

export interface LoginPayload {
    phone?: string;
    username?: string;
    password: string;
}

export interface LoginResponse {
    access: string;
    refresh: string;
}

// Try JWT token endpoint first, fallback to accounts/login if needed
export async function login(payload: LoginPayload): Promise<LoginResponse> {
    try {
        // First try standard JWT token endpoint
        const data = await apiRequest<LoginResponse>(API.AUTH_TOKEN, {
            method: "POST",
            body: JSON.stringify(payload),
            withAuth: false,
        });
        setTokens({ access: data.access, refresh: data.refresh } as Tokens);
        return data;
    } catch (error: any) {
        console.warn("JWT token endpoint failed, trying accounts/login:", error.message);
        // Fallback to accounts/login if JWT fails
        const data = await apiRequest<LoginResponse>(API.ACCOUNTS_LOGIN, {
            method: "POST",
            body: JSON.stringify(payload),
            withAuth: false,
        });
        setTokens({ access: data.access, refresh: data.refresh } as Tokens);
        return data;
    }
}

// User registration via /accounts/register/
export async function register(payload: {
    phone: string;
    password: string;
    first_name: string;
    last_name: string;
}) {
    return apiRequest(API.ACCOUNTS_REGISTER, {
        method: "POST",
        body: JSON.stringify(payload),
        withAuth: false,
    });
}

export async function refreshToken(refresh: string) {
    return apiRequest<{ access: string; refresh?: string }>(API.AUTH_REFRESH, {
        method: "POST",
        body: JSON.stringify({ refresh }),
        withAuth: false,
    });
}

// No explicit logout endpoint in backend URL list; just clear local tokens.
export async function logout() {
    clearTokens();
}
