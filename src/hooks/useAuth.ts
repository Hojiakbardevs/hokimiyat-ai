// src/hooks/useAuth.ts
import { useCallback, useEffect, useMemo, useState } from "react";
import { login as apiLogin, logout as apiLogout, type LoginPayload } from "@/api/auth";
import { getAccessToken, getRefreshToken, setTokens } from "@/api/client";

export function useAuth() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [token, setToken] = useState<string | null>(() => getAccessToken());

    const isAuthenticated = useMemo(() => !!token, [token]);

    useEffect(() => {
        // Sync across tabs
        const handler = (e: StorageEvent) => {
            if (e.key === "access_token") setToken(e.newValue);
        };
        window.addEventListener("storage", handler);
        return () => window.removeEventListener("storage", handler);
    }, []);

    const login = useCallback(async (payload: LoginPayload) => {
        setError(null);
        setLoading(true);
        try {
            const data = await apiLogin(payload);
            setTokens({ access: data.access, refresh: data.refresh });
            setToken(data.access);
            return true;
        } catch (e: any) {
            setError(e?.message || "Login failed");
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    const logout = useCallback(async () => {
        apiLogout(); // now just clears tokens locally
        setToken(null);
    }, []);

    return { isAuthenticated, loading, error, login, logout, accessToken: token, hasRefresh: !!getRefreshToken() } as const;
}
