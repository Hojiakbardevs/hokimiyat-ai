// src/api/chat.ts
import { apiRequest } from "./client";
import { API } from "./endpoints";

export interface ChatMessage {
    role: "user" | "assistant" | "system";
    content: string;
}

export interface ChatRequest {
    message: string;
    system_prompt?: string;
}

export interface ChatResponse {
    response?: string; // Backend likely returns simple response field
    message?: string;
    [key: string]: any; // Allow other fields
}

export async function chatCompletion(payload: ChatRequest): Promise<ChatResponse> {
    return apiRequest<ChatResponse>(API.CHAT, {
        method: "POST",
        body: JSON.stringify(payload),
    });
}
