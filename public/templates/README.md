# Template Files

This folder contains DOCX and PDF templates for document generation.

## Template Structure

### DOCX Templates

- File: `xat_blanka.docx`
- Placeholder: `{body}`
- The placeholder will be replaced with AI-generated content

### PDF Templates

- File: `xat_blanka.pdf`
- Text will be inserted at specified coordinates (x: 80, y: 350)
- Font: Times Roman
- Size: 12pt

## How to Create Templates

### For DOCX:

1. Create a new Word document with your official letterhead
2. Add the placeholder `{body}` where you want the AI content to appear
3. Save as `xat_blanka.docx` in this folder

### For PDF:

1. Create a PDF with your official letterhead
2. Leave space for content starting at approximately 80px from left, 350px from top
3. Save as `xat_blanka.pdf` in this folder

## Usage

Templates are automatically loaded by:

- `src/utils/generateDocx.ts` - for DOCX generation
- `src/utils/generatePdf.ts` - for PDF generation

## Notes

- Make sure template filenames match exactly: `xat_blanka.docx` and `xat_blanka.pdf`
- DOCX templates support only ONE placeholder: `{body}`
- PDF templates insert text at fixed coordinates (adjustable in generatePdf.ts)
- All processing happens on the frontend - no backend required
