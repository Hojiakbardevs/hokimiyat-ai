// src/api/auth.ts
import { apiRequest, setTokens } from "./client";
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

// Login using accounts/login endpoint
export async function login(payload: LoginPayload): Promise<LoginResponse> {
    // Import clearAllAppData
    const { clearAllAppData } = await import("./client");

    // Clear all previous user data before login
    clearAllAppData();

    const data = await apiRequest<LoginResponse>(API.ACCOUNTS_LOGIN, {
        method: "POST",
        body: JSON.stringify(payload),
        withAuth: false,
    });
    setTokens({ access: data.access, refresh: data.refresh } as Tokens);
    return data;
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
    const { clearAllAppData } = await import("./client");
    clearAllAppData();
}
