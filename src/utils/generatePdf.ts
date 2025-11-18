/**
 * Professional PDF Generator for Hokimiyat AI
 * Supports Markdown formatting with proper alignment and styling
 * 
 * Features:
 * - Markdown to PDF conversion
 * - Times New Roman 14pt (Hokimiyat standard)
 * - Text alignment: Justify (default), Center, Left, Right
 * - Bold, Italic, Lists
 * - Multi-page support
 * - Proper spacing
 */

import { jsPDF } from "jspdf";
import { parseMarkdown, parseInlineMarkdown } from "./markdownParser";

// Add Times New Roman font support (you may need to add custom fonts)
// For now, we'll use the built-in fonts that are similar

/**
 * Generate professional PDF from markdown content
 * @param markdownContent - Markdown formatted text
 * @param outputFilename - Output filename (default: hujjat.pdf)
 * @param options - Additional options
 */
export async function generatePdf(
    markdownContent: string,
    outputFilename: string = "hujjat.pdf",
    options: {
        fontSize?: number; // Default: 14
        lineHeight?: number; // Default: 1.5
        pageMargin?: number; // Default: 25mm
    } = {}
): Promise<void> {
    try {
        const {
            fontSize = 14,
            lineHeight = 1.5,
            pageMargin = 25,
        } = options;

        console.log("📄 PDF generation started...");
        console.log("Content length:", markdownContent.length);

        // Create PDF document (A4 size)
        const doc = new jsPDF({
            orientation: "portrait",
            unit: "mm",
            format: "a4",
        });

        // Page dimensions
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const contentWidth = pageWidth - pageMargin * 2;
        let currentY = pageMargin;

        // Parse markdown
        const elements = parseMarkdown(markdownContent);
        console.log("Parsed elements:", elements.length);

        // Helper function to add new page
        const addNewPage = () => {
            doc.addPage();
            currentY = pageMargin;
        };

        // Helper function to check if we need a new page
        const checkPageBreak = (requiredSpace: number) => {
            if (currentY + requiredSpace > pageHeight - pageMargin) {
                addNewPage();
                return true;
            }
            return false;
        };

        // Process each element
        for (const element of elements) {
            if (element.type === "heading") {
                // Heading
                checkPageBreak(20);

                const headingSize = fontSize + (6 - (element.level || 1)) * 2;
                doc.setFontSize(headingSize);
                doc.setFont("times", "bold");

                const alignment = element.alignment || "left";
                let xPosition = pageMargin;

                if (alignment === "center") {
                    const textWidth = doc.getTextWidth(element.content);
                    xPosition = (pageWidth - textWidth) / 2;
                } else if (alignment === "right") {
                    const textWidth = doc.getTextWidth(element.content);
                    xPosition = pageWidth - pageMargin - textWidth;
                }

                doc.text(element.content, xPosition, currentY);
                currentY += headingSize * lineHeight;
            } else if (element.type === "list" && element.children) {
                // List items
                doc.setFontSize(fontSize);

                for (const listItem of element.children) {
                    checkPageBreak(fontSize * lineHeight);

                    const bulletPoint = "• ";
                    const inlineParts = parseInlineMarkdown(listItem.content);

                    // Draw bullet
                    doc.setFont("times", "normal");
                    doc.text(bulletPoint, pageMargin + 5, currentY);

                    // Draw text with formatting
                    let xOffset = pageMargin + 12;
                    const maxLineWidth = contentWidth - 12;

                    for (const part of inlineParts) {
                        if (part.bold && part.italic) {
                            doc.setFont("times", "bolditalic");
                        } else if (part.bold) {
                            doc.setFont("times", "bold");
                        } else if (part.italic) {
                            doc.setFont("times", "italic");
                        } else {
                            doc.setFont("times", "normal");
                        }

                        // Split text into lines if too long
                        const words = part.text.split(" ");
                        let currentLine = "";

                        for (const word of words) {
                            const testLine = currentLine ? `${currentLine} ${word}` : word;
                            const testWidth = doc.getTextWidth(testLine);

                            if (testWidth > maxLineWidth && currentLine) {
                                doc.text(currentLine, xOffset, currentY);
                                currentY += fontSize * lineHeight;
                                checkPageBreak(fontSize * lineHeight);
                                currentLine = word;
                                xOffset = pageMargin + 12;
                            } else {
                                currentLine = testLine;
                            }
                        }

                        if (currentLine) {
                            doc.text(currentLine, xOffset, currentY);
                            xOffset += doc.getTextWidth(currentLine + " ");
                        }
                    }

                    currentY += fontSize * lineHeight;
                }

                currentY += 2; // Extra spacing after list
            } else if (element.type === "paragraph") {
                // Regular paragraph
                checkPageBreak(fontSize * lineHeight);

                doc.setFontSize(fontSize);
                const alignment = element.alignment || "justify";
                const inlineParts = parseInlineMarkdown(element.content);

                // For justify alignment, we need to split into words
                if (alignment === "justify") {
                    const words: Array<{ text: string; bold?: boolean; italic?: boolean }> = [];

                    for (const part of inlineParts) {
                        const partWords = part.text.split(" ");
                        partWords.forEach((word) => {
                            if (word) {
                                words.push({ text: word, bold: part.bold, italic: part.italic });
                            }
                        });
                    } let currentLine: Array<{ text: string; bold?: boolean; italic?: boolean }> = [];
                    let currentLineWidth = 0;

                    for (let i = 0; i < words.length; i++) {
                        const word = words[i];

                        // Set font for measurement
                        if (word.bold && word.italic) {
                            doc.setFont("times", "bolditalic");
                        } else if (word.bold) {
                            doc.setFont("times", "bold");
                        } else if (word.italic) {
                            doc.setFont("times", "italic");
                        } else {
                            doc.setFont("times", "normal");
                        }

                        const wordWidth = doc.getTextWidth(word.text + " ");

                        if (currentLineWidth + wordWidth > contentWidth && currentLine.length > 0) {
                            // Draw justified line
                            const isLastLine = i === words.length - 1;
                            const spacing = isLastLine ? 0 : (contentWidth - currentLineWidth + doc.getTextWidth(" ") * currentLine.length) / (currentLine.length - 1 || 1);

                            let xPos = pageMargin;
                            for (const w of currentLine) {
                                if (w.bold && w.italic) {
                                    doc.setFont("times", "bolditalic");
                                } else if (w.bold) {
                                    doc.setFont("times", "bold");
                                } else if (w.italic) {
                                    doc.setFont("times", "italic");
                                } else {
                                    doc.setFont("times", "normal");
                                }

                                doc.text(w.text, xPos, currentY);
                                xPos += doc.getTextWidth(w.text) + (isLastLine ? doc.getTextWidth(" ") : spacing);
                            }

                            currentY += fontSize * lineHeight;
                            checkPageBreak(fontSize * lineHeight);
                            currentLine = [word];
                            currentLineWidth = wordWidth;
                        } else {
                            currentLine.push(word);
                            currentLineWidth += wordWidth;
                        }
                    }

                    // Draw last line (left-aligned)
                    let xPos = pageMargin;
                    for (const w of currentLine) {
                        if (w.bold && w.italic) {
                            doc.setFont("times", "bolditalic");
                        } else if (w.bold) {
                            doc.setFont("times", "bold");
                        } else if (w.italic) {
                            doc.setFont("times", "italic");
                        } else {
                            doc.setFont("times", "normal");
                        }

                        doc.text(w.text, xPos, currentY);
                        xPos += doc.getTextWidth(w.text + " ");
                    }
                } else {
                    // Non-justified alignment
                    let xPos = pageMargin;

                    if (alignment === "center") {
                        const totalWidth = inlineParts.reduce((sum, part) => sum + doc.getTextWidth(part.text), 0);
                        xPos = (pageWidth - totalWidth) / 2;
                    } else if (alignment === "right") {
                        const totalWidth = inlineParts.reduce((sum, part) => sum + doc.getTextWidth(part.text), 0);
                        xPos = pageWidth - pageMargin - totalWidth;
                    }

                    for (const part of inlineParts) {
                        if (part.bold && part.italic) {
                            doc.setFont("times", "bolditalic");
                        } else if (part.bold) {
                            doc.setFont("times", "bold");
                        } else if (part.italic) {
                            doc.setFont("times", "italic");
                        } else {
                            doc.setFont("times", "normal");
                        }

                        doc.text(part.text, xPos, currentY);
                        xPos += doc.getTextWidth(part.text + " ");
                    }
                }

                currentY += fontSize * lineHeight + 2;
            }
        }

        // Save PDF
        doc.save(outputFilename);
        console.log("✅ PDF generated successfully:", outputFilename);
    } catch (error) {
        console.error("❌ Error generating PDF:", error);
        throw new Error(
            `PDF yaratishda xatolik: ${error instanceof Error ? error.message : "Noma'lum xatolik"
            }`
        );
    }
}

/**
 * Generate PDF from DOCX content (HTML-based conversion)
 * This is an alternative method using HTML as intermediate format
 */
export async function generatePdfFromHtml(
    htmlContent: string,
    outputFilename: string = "hujjat.pdf"
): Promise<void> {
    try {
        const doc = new jsPDF({
            orientation: "portrait",
            unit: "mm",
            format: "a4",
        });

        // Simple HTML to PDF conversion
        // Note: This is a basic implementation. For complex HTML, use html2pdf.js
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = htmlContent;

        const text = tempDiv.innerText;
        const lines = doc.splitTextToSize(text, 160);

        doc.setFont("times", "normal");
        doc.setFontSize(14);
        doc.text(lines, 25, 25);

        doc.save(outputFilename);
    } catch (error) {
        console.error("Error generating PDF from HTML:", error);
        throw error;
    }
}
