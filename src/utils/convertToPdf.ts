/**
 * DOCX → PDF Conversion Utility
 * Brauzerda DOCX faylni PDF ga o'zgartirish
 */

import { jsPDF } from "jspdf";
import { saveAs } from "file-saver";
import mammoth from "mammoth";

/**
 * DOCX faylni PDF ga o'zgartirish
 * @param docxFile - DOCX file (Blob yoki File)
 * @param outputName - PDF fayl nomi
 */
export async function convertDocxToPdf(
    docxFile: Blob | File,
    outputName: string = "document.pdf"
): Promise<void> {
    try {
        console.log("📄→📕 DOCX to PDF conversion started...");

        // DOCX ni matn sifatida o'qish (oddiy yondashuv)
        // Haqiqiy DOCX parsing uchun mammoth.js kerak bo'ladi
        const text = await extractTextFromDocx(docxFile);

        // PDF yaratish
        const doc = new jsPDF({
            orientation: "portrait",
            unit: "mm",
            format: "a4",
        });

        // Times New Roman font (default)
        doc.setFont("times", "normal");
        doc.setFontSize(14);

        // Matnni qo'shish (oddiy text wrapping)
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 20;
        const lineHeight = 7;
        const maxWidth = pageWidth - (margin * 2);

        const lines = doc.splitTextToSize(text, maxWidth);
        let y = margin;

        for (const line of lines) {
            if (y + lineHeight > pageHeight - margin) {
                doc.addPage();
                y = margin;
            }
            doc.text(line, margin, y);
            y += lineHeight;
        }

        // PDF ni saqlash
        const pdfBlob = doc.output("blob");
        saveAs(pdfBlob, outputName);

        console.log("✅ PDF conversion successful:", outputName);
    } catch (error) {
        console.error("❌ Error converting DOCX to PDF:", error);
        throw new Error(
            `PDF ga o'zgartirishda xatolik: ${error instanceof Error ? error.message : "Noma'lum xatolik"}`
        );
    }
}

/**
 * DOCX fayldan matnni ajratib olish (mammoth.js bilan)
 * Real implementation uchun mammoth.js ishlatiladi
 */
async function extractTextFromDocx(file: Blob | File): Promise<string> {
    try {
        console.log("📄 Extracting text from DOCX...");
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        console.log("✅ Text extracted:", result.value.substring(0, 100));
        return result.value;
    } catch (error) {
        console.error("❌ Error extracting text from DOCX:", error);
        throw new Error("DOCX fayldan matn ajratib bo'lmadi");
    }
}

/**
 * Matndan to'g'ridan-to'g'ri PDF yaratish (DOCX siz)
 * @param content - Matn
 * @param outputName - PDF fayl nomi
 */
export async function createPdfFromText(
    content: string,
    outputName: string = "document.pdf"
): Promise<void> {
    try {
        console.log("📝→📕 Text to PDF conversion started...");

        const doc = new jsPDF({
            orientation: "portrait",
            unit: "mm",
            format: "a4",
        });

        // Times New Roman, 14pt
        doc.setFont("times", "normal");
        doc.setFontSize(14);

        // Sahifa parametrlari
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 20;
        const lineHeight = 7;
        const maxWidth = pageWidth - (margin * 2);

        // Matnni satrlar bo'yicha bo'lish
        const lines = doc.splitTextToSize(content, maxWidth);
        let y = margin;

        for (const line of lines) {
            if (y + lineHeight > pageHeight - margin) {
                doc.addPage();
                y = margin;
            }
            doc.text(line, margin, y);
            y += lineHeight;
        }

        // PDF ni saqlash
        const pdfBlob = doc.output("blob");
        saveAs(pdfBlob, outputName);

        console.log("✅ PDF created successfully:", outputName);
    } catch (error) {
        console.error("❌ Error creating PDF:", error);
        throw new Error(
            `PDF yaratishda xatolik: ${error instanceof Error ? error.message : "Noma'lum xatolik"}`
        );
    }
}
