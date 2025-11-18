/**
 * Markdown Parser for Hokimiyat AI
 * Converts Markdown to structured data for DOCX/PDF generation
 */

export interface ParsedElement {
    type: 'heading' | 'paragraph' | 'list' | 'listItem' | 'bold' | 'italic' | 'text';
    level?: number; // For headings (1-6) or list depth
    content: string;
    alignment?: 'left' | 'center' | 'right' | 'justify';
    children?: ParsedElement[];
}

/**
 * Parse markdown text into structured elements
 */
export function parseMarkdown(markdown: string): ParsedElement[] {
    const lines = markdown.split('\n');
    const elements: ParsedElement[] = [];
    let currentList: ParsedElement | null = null;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmedLine = line.trim();

        // Skip empty lines
        if (!trimmedLine) {
            if (currentList) {
                elements.push(currentList);
                currentList = null;
            }
            continue;
        }

        // Heading detection
        const headingMatch = trimmedLine.match(/^(#{1,6})\s+(.+)$/);
        if (headingMatch) {
            if (currentList) {
                elements.push(currentList);
                currentList = null;
            }

            const level = headingMatch[1].length;
            elements.push({
                type: 'heading',
                level,
                content: headingMatch[2],
                alignment: level === 1 ? 'center' : 'left',
            });
            continue;
        }

        // Unordered list detection (-, *, +)
        const unorderedListMatch = trimmedLine.match(/^[-*+]\s+(.+)$/);
        if (unorderedListMatch) {
            if (!currentList || currentList.type !== 'list') {
                if (currentList) elements.push(currentList);
                currentList = {
                    type: 'list',
                    content: '',
                    children: [],
                };
            }

            currentList.children!.push({
                type: 'listItem',
                content: unorderedListMatch[1],
                alignment: 'justify',
            });
            continue;
        }

        // Ordered list detection (1., 2., etc.)
        const orderedListMatch = trimmedLine.match(/^\d+\.\s+(.+)$/);
        if (orderedListMatch) {
            if (!currentList || currentList.type !== 'list') {
                if (currentList) elements.push(currentList);
                currentList = {
                    type: 'list',
                    content: '',
                    children: [],
                };
            }

            currentList.children!.push({
                type: 'listItem',
                content: orderedListMatch[1],
                alignment: 'justify',
            });
            continue;
        }

        // Regular paragraph
        if (currentList) {
            elements.push(currentList);
            currentList = null;
        }

        elements.push({
            type: 'paragraph',
            content: trimmedLine,
            alignment: 'justify', // Default hokimiyat standard
        });
    }

    // Add remaining list if any
    if (currentList) {
        elements.push(currentList);
    }

    return elements;
}

/**
 * Parse inline markdown (bold, italic) within text
 */
export function parseInlineMarkdown(text: string): Array<{ text: string; bold?: boolean; italic?: boolean }> {
    const parts: Array<{ text: string; bold?: boolean; italic?: boolean }> = [];
    let current = '';
    let i = 0;

    while (i < text.length) {
        // Bold detection (**text**)
        if (text[i] === '*' && text[i + 1] === '*') {
            if (current) {
                parts.push({ text: current });
                current = '';
            }

            i += 2;
            let boldText = '';
            while (i < text.length && !(text[i] === '*' && text[i + 1] === '*')) {
                boldText += text[i];
                i++;
            }

            if (boldText) {
                parts.push({ text: boldText, bold: true });
            }

            i += 2;
            continue;
        }

        // Italic detection (*text* or _text_)
        if (text[i] === '*' || text[i] === '_') {
            if (current) {
                parts.push({ text: current });
                current = '';
            }

            const marker = text[i];
            i++;
            let italicText = '';
            while (i < text.length && text[i] !== marker) {
                italicText += text[i];
                i++;
            }

            if (italicText) {
                parts.push({ text: italicText, italic: true });
            }

            i++;
            continue;
        }

        current += text[i];
        i++;
    }

    if (current) {
        parts.push({ text: current });
    }

    return parts;
}

/**
 * Convert markdown to HTML for preview
 */
export function markdownToHtml(markdown: string): string {
    let html = markdown;

    // Headers
    html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
    html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
    html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');

    // Bold
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

    // Italic
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
    html = html.replace(/_(.+?)_/g, '<em>$1</em>');

    // Lists
    html = html.replace(/^\* (.+)$/gm, '<li>$1</li>');
    html = html.replace(/^- (.+)$/gm, '<li>$1</li>');
    html = html.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');

    // Wrap lists
    html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');

    // Paragraphs
    html = html.replace(/^(?!<[hlu])(.*?)$/gm, '<p>$1</p>');

    // Clean up empty paragraphs
    html = html.replace(/<p>\s*<\/p>/g, '');

    return html;
}
