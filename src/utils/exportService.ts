/**
 * Export Service for Hokimiyat AI
 * Simple service for exporting documents in various formats
 * 
 * Supports:
 * - DOCX (Word) - Template-based with {body} placeholder
 * - PDF - Simple PDF generation
 * - TXT - Plain text
 */

import { generateDocx } from "./generateDocx";
import { generatePdf } from "./generatePdf";
import { saveAs } from "file-saver";

export type ExportFormat = "docx" | "pdf" | "txt";

export interface ExportOptions {
    format: ExportFormat;
    filename?: string;
    content: string;
    templateName?: string; // For DOCX template (default: "xat_blanka.docx")
}

/**
 * Main export function - handles all export formats
 */
export async function exportDocument(options: ExportOptions): Promise<void> {
    const {
        format,
        content,
        filename,
        templateName = "xat_blanka.docx",
    } = options;

    try {
        console.log(`📤 Exporting as ${format.toUpperCase()}...`);

        switch (format) {
            case "docx":
                await exportAsDocx(content, filename, templateName);
                break;

            case "pdf":
                await exportAsPdf(content, filename);
                break;

            case "txt":
                await exportAsTxt(content, filename);
                break;

            default:
                throw new Error(`Unsupported format: ${format}`);
        }

        console.log(`✅ Export successful: ${filename || 'document'}`);
    } catch (error) {
        console.error(`❌ Export failed:`, error);
        throw error;
    }
}

/**
 * Export as DOCX (Word) using template
 */
async function exportAsDocx(
    content: string,
    filename?: string,
    templateName?: string
): Promise<void> {
    const outputFilename = filename || `hujjat_${Date.now()}.docx`;
    await generateDocx(content, templateName || "xat_blanka.docx", outputFilename);
}

/**
 * Export as PDF with simple formatting
 */
async function exportAsPdf(
    content: string,
    filename?: string
): Promise<void> {
    const outputFilename = filename || `hujjat_${Date.now()}.pdf`;
    await generatePdf(content, outputFilename);
}

/**
 * Export as plain TXT file
 */
async function exportAsTxt(content: string, filename?: string): Promise<void> {
    const outputFilename = filename || `hujjat_${Date.now()}.txt`;

    // Remove markdown formatting for plain text
    const plainText = content
        .replace(/^#{1,6}\s+/gm, "") // Remove headings
        .replace(/\*\*(.+?)\*\*/g, "$1") // Remove bold
        .replace(/\*(.+?)\*/g, "$1") // Remove italic
        .replace(/_(.+?)_/g, "$1") // Remove italic
        .replace(/^[-*+]\s+/gm, "• ") // Convert lists to bullets
        .replace(/^\d+\.\s+/gm, "") // Remove numbered list markers
        .trim();

    const blob = new Blob([plainText], { type: "text/plain;charset=utf-8" });
    saveAs(blob, outputFilename);
}

/**
 * Get estimated page count from content
 * Based on average 1800 characters per page (Times New Roman 14pt, A4)
 */
export function getEstimatedPageCount(content: string): number {
    const CHARS_PER_PAGE = 1800;
    return Math.ceil(content.length / CHARS_PER_PAGE) || 1;
}

/**
 * Get word count from content
 */
export function getWordCount(content: string): number {
    return content.trim().split(/\s+/).filter((word) => word.length > 0).length;
}

/**
 * Get character count from content
 */
export function getCharacterCount(content: string): number {
    return content.length;
}

/**
 * Get document statistics
 */
export function getDocumentStats(content: string) {
    return {
        characters: getCharacterCount(content),
        words: getWordCount(content),
        pages: getEstimatedPageCount(content),
    };
}
