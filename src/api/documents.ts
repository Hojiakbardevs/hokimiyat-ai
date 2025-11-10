// src/api/documents.ts
import { apiRequest } from "./client";
import { API } from "./endpoints";

export interface DocumentItem {
    id: string | number;
    original_file?: string;
    output_file?: string;
    status?: "pending" | "processing" | "completed" | "failed";
    content?: string;
    error_message?: string;
    description?: string;
    language_code?: string;
    script_type?: string;
    template_type?: "ariza" | "bayonnoma" | "shartnoma" | "malumotnoma";
    created_at?: string;
    updated_at?: string;
}

export interface CreateDocumentPayload {
    content?: string;
    description?: string;
    language_code?: string;
    script_type?: string;
    template_type?: string;
    original_file?: File;
}

export async function listDocuments(): Promise<DocumentItem[]> {
    return apiRequest<DocumentItem[]>(API.DOCUMENTS, { method: "GET" });
}

export async function getDocument(id: string | number): Promise<DocumentItem> {
    return apiRequest<DocumentItem>(`${API.DOCUMENTS}${id}/`, { method: "GET" });
}

export async function createDocument(payload: CreateDocumentPayload): Promise<DocumentItem> {
    // If a file is present, switch to multipart
    if (payload.original_file) {
        const form = new FormData();
        // Backend expects "file" not "original_file"
        form.append("file", payload.original_file);
        // Backend expects "type" not "template_type"
        if (payload.template_type) form.append("type", payload.template_type);
        if (payload.description) form.append("description", payload.description);
        if (payload.content) form.append("content", payload.content);
        if (payload.language_code) form.append("language_code", payload.language_code);
        if (payload.script_type) form.append("script_type", payload.script_type);

        // Debug: log FormData contents
        console.log("FormData being sent:");
        for (const [key, value] of form.entries()) {
            console.log(`  ${key}:`, value instanceof File ? `File(${value.name})` : value);
        }

        return apiRequest<DocumentItem>(API.DOCUMENTS, {
            method: "POST",
            body: form as any,
            headers: {}, // allow browser to set multipart boundary
        });
    }
    // Send as JSON if no file
    return apiRequest<DocumentItem>(API.DOCUMENTS, {
        method: "POST",
        body: JSON.stringify(payload),
    });
}

export async function deleteDocument(id: string | number): Promise<void> {
    await apiRequest(`${API.DOCUMENTS}${id}/`, { method: "DELETE" });
}
