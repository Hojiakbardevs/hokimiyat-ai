/**
 * Simple DOCX Generator for Institut AI
 * Uses existing DOCX template and replaces {body} placeholder
 * 
 * Features:
 * - Template-based generation (xat_blanka.docx)
 * - Simple text replacement
 * - Preserves template formatting, headers, footers, logos
 */

import Docxtemplater from "docxtemplater";
import PizZip from "pizzip";
import { saveAs } from "file-saver";
import xatBlankaDocx from "@/assets/xat_blanka.docx?url";
import { cleanMarkdown } from "./cleanMarkdown";

/**
 * Generate DOCX from template by replacing {body} placeholder
 * @param content - Text content to insert
 * @param templateName - Template filename (default: xat_blanka.docx)
 * @param outputName - Output filename (default: result.docx)
 */
export async function generateDocx(
    content: string,
    templateName: string = "xat_blanka.docx",
    outputName: string = "result.docx"
): Promise<void> {
    try {
        console.log("📄 DOCX generation started...");

        // Load template from assets folder
        const templatePath = templateName === "xat_blanka.docx" ? xatBlankaDocx : `/templates/${templateName}`;
        const response = await fetch(templatePath);

        if (!response.ok) {
            throw new Error(`Template not found: ${templatePath}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        const zip = new PizZip(arrayBuffer);

        // Create docxtemplater instance
        const doc = new Docxtemplater(zip, {
            paragraphLoop: true,
            linebreaks: true,
            delimiters: { start: "{", end: "}" },
        });

        // Clean Markdown and replace {body} placeholder
        const cleanedContent = cleanMarkdown(content || "[Matn kiritilmagan]");
        console.log('DOCX setData - cleaned content:', cleanedContent.substring(0, 100));

        doc.setData({
            body: cleanedContent,
        });

        // Render the document
        doc.render();

        // Generate output
        const output = doc.getZip().generate({
            type: "blob",
            mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            compression: "DEFLATE",
        });

        // Download the file
        saveAs(output, outputName);
        console.log("✅ DOCX generated successfully:", outputName);
    } catch (error) {
        console.error("❌ Error generating DOCX:", error);
        throw new Error(
            `DOCX yaratishda xatolik: ${error instanceof Error ? error.message : "Noma'lum xatolik"}`
        );
    }
}