import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { saveAs } from "file-saver";
import xatBlankaPdf from "@/assets/xat blanka.pdf?url";

/**
 * Generate PDF from template by inserting content at specified coordinates
 * @param content - AI-generated text to insert
 * @param templateName - Template filename (default: xat_blanka.pdf)
 * @param outputName - Output filename (default: result.pdf)
 */
export async function generatePdf(
    content: string,
    templateName: string = "xat_blanka.pdf",
    outputName: string = "result.pdf"
): Promise<void> {
    try {
        // Load template from assets folder
        const templatePath = templateName === "xat_blanka.pdf" ? xatBlankaPdf : `/templates/${templateName}`;
        const response = await fetch(templatePath);

        if (!response.ok) {
            throw new Error(`Template not found: ${templatePath}`);
        }

        const templateBytes = await response.arrayBuffer();
        const pdfDoc = await PDFDocument.load(templateBytes);

        // Get first page
        const pages = pdfDoc.getPages();
        const firstPage = pages[0];
        const { height } = firstPage.getSize();

        // Embed Times Roman font (similar to Times New Roman)
        const font = await pdfDoc.embedFont(StandardFonts.TimesRoman);

        // Text configuration
        const fontSize = 12;
        const lineHeight = 16;
        const maxWidth = 450; // Maximum width for text wrapping
        const startX = 80; // Left margin
        const startY = height - 200; // Start from top (adjust based on your template)

        // Split content into lines that fit within maxWidth
        const words = content.split(" ");
        const lines: string[] = [];
        let currentLine = "";

        for (const word of words) {
            const testLine = currentLine ? `${currentLine} ${word}` : word;
            const testWidth = font.widthOfTextAtSize(testLine, fontSize);

            if (testWidth > maxWidth && currentLine) {
                lines.push(currentLine);
                currentLine = word;
            } else {
                currentLine = testLine;
            }
        }

        if (currentLine) {
            lines.push(currentLine);
        }

        // Draw text line by line
        let currentY = startY;

        for (const line of lines) {
            // Check if we need a new page
            if (currentY < 50) {
                const newPage = pdfDoc.addPage();
                currentY = newPage.getSize().height - 50;
                firstPage.drawText(line, {
                    x: startX,
                    y: currentY,
                    size: fontSize,
                    font,
                    color: rgb(0, 0, 0),
                });
            } else {
                firstPage.drawText(line, {
                    x: startX,
                    y: currentY,
                    size: fontSize,
                    font,
                    color: rgb(0, 0, 0),
                });
            }

            currentY -= lineHeight;
        }

        // Save PDF
        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([pdfBytes as any], { type: "application/pdf" });
        saveAs(blob, outputName);
    } catch (error) {
        console.error("Error generating PDF:", error);
        throw new Error(
            `PDF yaratishda xatolik: ${error instanceof Error ? error.message : "Noma'lum xatolik"}`
        );
    }
}

/**
 * Generate PDF with custom positioning
 * @param content - AI-generated text to insert
 * @param options - Custom options for positioning and styling
 */
export async function generatePdfCustom(
    content: string,
    options: {
        templateName?: string;
        outputName?: string;
        startX?: number;
        startY?: number;
        fontSize?: number;
        lineHeight?: number;
        maxWidth?: number;
    } = {}
): Promise<void> {
    const {
        templateName = "xat_blanka.pdf",
        outputName = "result.pdf",
        startX = 80,
        startY = 350,
        fontSize = 12,
        lineHeight = 16,
        maxWidth = 450,
    } = options;

    try {
        const templatePath = templateName === "xat_blanka.pdf" ? xatBlankaPdf : `/templates/${templateName}`;
        const response = await fetch(templatePath);
        if (!response.ok) {
            throw new Error(`Template not found: ${templatePath}`);
        }

        const templateBytes = await response.arrayBuffer();
        const pdfDoc = await PDFDocument.load(templateBytes);
        const pages = pdfDoc.getPages();
        const firstPage = pages[0];
        const font = await pdfDoc.embedFont(StandardFonts.TimesRoman);

        // Split and wrap text
        const words = content.split(" ");
        const lines: string[] = [];
        let currentLine = "";

        for (const word of words) {
            const testLine = currentLine ? `${currentLine} ${word}` : word;
            const testWidth = font.widthOfTextAtSize(testLine, fontSize);

            if (testWidth > maxWidth && currentLine) {
                lines.push(currentLine);
                currentLine = word;
            } else {
                currentLine = testLine;
            }
        }

        if (currentLine) {
            lines.push(currentLine);
        }

        // Draw text
        let currentY = startY;
        for (const line of lines) {
            firstPage.drawText(line, {
                x: startX,
                y: currentY,
                size: fontSize,
                font,
                color: rgb(0, 0, 0),
            });
            currentY -= lineHeight;
        }

        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([pdfBytes as any], { type: "application/pdf" });
        saveAs(blob, outputName);
    } catch (error) {
        console.error("Error generating PDF:", error);
        throw new Error(
            `PDF yaratishda xatolik: ${error instanceof Error ? error.message : "Noma'lum xatolik"}`
        );
    }
}
