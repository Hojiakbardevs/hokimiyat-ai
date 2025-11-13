// src/api/chat.ts
import { apiRequest } from "./client";
import { API } from "./endpoints";

export interface ChatMessage {
    id?: number;
    role: "user" | "assistant" | "system";
    content: string;
    created_at?: string;
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

export interface ConversationSummary {
    id: number;
    title: string;
    created_at: string;
    updated_at: string;
    message_count: string | number;
    last_message_preview: string;
}

export interface ConversationDetail {
    id: number;
    title: string;
    created_at: string;
    updated_at: string;
    message_count: string | number;
    messages?: ChatMessage[];
    // Paginated response format
    count?: number;
    next?: string | null;
    previous?: string | null;
    results?: {
        id: number;
        title: string;
        created_at: string;
        updated_at: string;
        message_count: string | number;
        messages: ChatMessage[];
    };
}

export async function chatCompletion(payload: ChatRequest): Promise<ChatResponse> {
    return apiRequest<ChatResponse>(API.CHAT, {
        method: "POST",
        body: JSON.stringify(payload),
    });
}

export async function getConversations(): Promise<ConversationSummary[]> {
    return apiRequest<ConversationSummary[]>(API.CHAT_CONVERSATIONS, {
        method: "GET",
    });
}

export async function getConversationById(conversationId: number): Promise<ConversationDetail> {
    return apiRequest<ConversationDetail>(`${API.CHAT_CONVERSATIONS}${conversationId}/`, {
        method: "GET",
    });
}
