// src/api/users.ts
import { apiRequest } from "./client";
import { API } from "./endpoints";

export interface UserProfile {
    id: string | number;
    phone?: string;
    first_name?: string;
    last_name?: string;
    created_at?: string;
}

// Decode JWT token to get user ID
function getUserIdFromToken(): number | null {
    const token = localStorage.getItem("access_token");
    if (!token) return null;

    try {
        // JWT structure: header.payload.signature
        const payload = token.split('.')[1];
        const decodedPayload = JSON.parse(atob(payload));

        // JWT typically contains 'user_id' or 'sub' field
        return decodedPayload.user_id || decodedPayload.sub || null;
    } catch (error) {
        console.error("Failed to decode token:", error);
        return null;
    }
}

export async function getMe(): Promise<UserProfile> {
    console.log("🔍 Getting user ID from token...");
    const userId = getUserIdFromToken();

    if (!userId) {
        console.error("❌ Could not extract user ID from token");
        throw new Error("User ID not found in token");
    }

    console.log("✅ User ID from token:", userId);
    console.log("📡 Fetching user profile from /accounts/users/" + userId + "/");

    return apiRequest<UserProfile>(`/accounts/users/${userId}/`, { method: "GET" });
}

export async function listUsers(): Promise<UserProfile[]> {
    return apiRequest<UserProfile[]>(API.USERS, { method: "GET" });
}

export async function getUser(id: string | number): Promise<UserProfile> {
    return apiRequest<UserProfile>(`${API.USERS}${id}/`, { method: "GET" });
}
