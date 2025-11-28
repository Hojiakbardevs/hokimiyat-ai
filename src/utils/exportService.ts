/**
 * Export Service for Institut AI
 * Document statistics and helper functions
 */

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

