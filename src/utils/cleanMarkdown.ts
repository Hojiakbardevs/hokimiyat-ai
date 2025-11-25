/**
 * Markdown tozalash - API dan kelgan Markdown formatni oddiy matnga o'girish
 * API: **bold** -> DOCX: bold
 * API: # Heading -> DOCX: Heading
 */

/**
 * Markdown formatni oddiy matnga o'girish (DOCX export uchun)
 * @param markdown - API dan kelgan Markdown matn
 * @returns Oddiy matn (template uchun)
 */
export function cleanMarkdown(markdown: string): string {
    if (!markdown) return "";

    let cleaned = markdown;

    // 1. Sarlavhalar - # Heading -> Heading
    cleaned = cleaned.replace(/^#{1,6}\s+(.+)$/gm, "$1");

    // 2. Bold - **text** -> text
    cleaned = cleaned.replace(/\*\*(.+?)\*\*/g, "$1");

    // 3. Italic - *text* yoki _text_ -> text
    cleaned = cleaned.replace(/\*(.+?)\*/g, "$1");
    cleaned = cleaned.replace(/_(.+?)_/g, "$1");

    // 4. Ro'yxat belgilari - * item -> • item
    cleaned = cleaned.replace(/^[-*+]\s+/gm, "• ");

    // 5. Raqamli ro'yxat - 1. item -> 1. item (saqlanadi)
    // cleaned = cleaned.replace(/^\d+\.\s+/gm, "");

    // 6. Kodlar - `code` -> code
    cleaned = cleaned.replace(/`(.+?)`/g, "$1");

    // 7. Havolalar - [text](url) -> text
    cleaned = cleaned.replace(/\[(.+?)\]\(.+?\)/g, "$1");

    // 8. Ikki yoki undan ortiq bo'sh qatorlarni bitta bo'sh qatorga aylantirish
    // Bu Word'da paragraflar orasida bo'sh joy chiqaradi
    cleaned = cleaned.replace(/\n{3,}/g, "\n\n");

    // 9. Bitta \n ni Docxtemplater uchun maxsus belgi bilan almashtirish
    // Docxtemplater linebreaks:true ishlashi uchun \n qoldiramiz
    // Lekin ikki \n ni paragraf ajratuvchi sifatida ishlatamiz

    // 10. Ortiqcha bo'shliqlarni tozalash (lekin \n saqlanadi)
    cleaned = cleaned.trim();

    return cleaned;
}

/**
 * Matnni ko'rinish uchun formatlash (Editor preview uchun)
 * @param text - Oddiy matn
 * @returns HTML formatted matn
 */
export function formatForPreview(text: string): string {
    if (!text) return "";

    let formatted = text;

    // Enter tashlash - \n -> <br>
    formatted = formatted.replace(/\n/g, "<br>");

    // Bo'shliqlar
    formatted = formatted.replace(/\s\s+/g, " ");

    return formatted;
}
