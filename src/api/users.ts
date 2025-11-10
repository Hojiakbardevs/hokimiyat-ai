// src/api/users.ts
import { apiRequest } from "./client";

export interface UserProfile {
    id: string | number;
    username: string;
    email?: string;
    first_name?: string;
    last_name?: string;
    avatar_url?: string;
    created_at?: string;
}

export async function getMe(): Promise<UserProfile> {
    return apiRequest<UserProfile>("/users/me/", { method: "GET" });
}

export async function listUsers(): Promise<UserProfile[]> {
    return apiRequest<UserProfile[]>("/users/", { method: "GET" });
}

export async function getUser(id: string | number): Promise<UserProfile> {
    return apiRequest<UserProfile>(`/users/${id}/`, { method: "GET" });
}
