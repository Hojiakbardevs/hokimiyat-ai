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
        // Map phone -> username for SimpleJWT compatibility
        const jwtPayload = payload.phone && !payload.username
            ? { username: payload.phone, password: payload.password }
            : payload;
        const data = await apiRequest<LoginResponse>(API.AUTH_TOKEN, {
            method: "POST",
            body: JSON.stringify(jwtPayload),
            withAuth: false,
        });
        setTokens({ access: data.access, refresh: data.refresh } as Tokens);
        return data;
    } catch (error: any) {
        console.warn("JWT token endpoint failed, trying accounts/login:", error.message);
        // Fallback to accounts/login if JWT fails (keeps original phone/password)
        const data = await apiRequest<LoginResponse>(API.ACCOUNTS_LOGIN, {
            method: "POST",
            body: JSON.stringify(payload),
            withAuth: false,
        });
        setTokens({ access: data.access, refresh: data.refresh } as Tokens);
        return data;
    }
}

// User registration: prefer /auth/register/ then fallback to /accounts/register/
export async function register(payload: {
    phone: string;
    password: string;
    first_name: string;
    last_name: string;
}) {
    try {
        // Primary: /auth/register/
        return await apiRequest(API.AUTH_REGISTER, {
            method: "POST",
            body: JSON.stringify(payload),
            withAuth: false,
        });
    } catch (errPrimary: any) {
        // Fallback: /accounts/register/
        try {
            return await apiRequest(API.ACCOUNTS_REGISTER, {
                method: "POST",
                body: JSON.stringify(payload),
                withAuth: false,
            });
        } catch (errSecondary: any) {
            // Re-throw primary error details if both fail
            throw new Error(
                errSecondary?.message || errPrimary?.message || "Registration failed"
            );
        }
    }
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
