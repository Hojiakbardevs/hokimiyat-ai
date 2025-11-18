# 📚 Hokimiyat AI - Professional Document Export System

## 🎯 O'rnatish

Quyidagi kutubxonalarni o'rnating:

```bash
npm install docx jspdf file-saver
```

yoki

```bash
yarn add docx jspdf file-saver
```

## 📋 Xususiyatlar

### ✅ Markdown → DOCX (Word)

- **Times New Roman 14pt** - Hokimiyat standarti
- **Text Alignment:**
  - Justify (tekis) - Default
  - Center (o'rtaga) - Sarlavhalar uchun
  - Left (chapga)
  - Right (o'ngga)
- **Formatlash:**
  - `# Sarlavha` → **Katta sarlavha (H1)** - o'rtaga, qalin
  - `## Sarlavha` → **Kichik sarlavha (H2)** - chapga, qalin
  - `**matn**` → **Qalin matn**
  - `*matn*` yoki `_matn_` → _Kursiv matn_
  - `- element` → • Bullet list
  - `1. element` → 1. Numbered list
- **Spacing:** 1.15 line height
- **Margins:** 1 inch (2.54cm) barcha tomonlardan
- **Automatic page breaks** - Ko'p sahifali hujjatlar uchun

### ✅ Markdown → PDF

- **Times New Roman 14pt**
- **Text Alignment:**
  - Justify (tekis) - Default
  - Center, Left, Right
- **Formatlash:**
  - Sarlavhalar (H1, H2, H3)
  - Qalin va kursiv matn
  - Bullet listlar
- **Multi-page support**
- **A4 format**
- **Proper spacing**

### ✅ TXT Export

- Oddiy matn formatida
- Markdown belgilarni olib tashlash
- UTF-8 encoding

## 🏗️ Arxitektura

```
src/utils/
├── markdownParser.ts      # Markdown → Structured Data
├── generateDocx.ts        # DOCX generator (docx library)
├── generatePdf.ts         # PDF generator (jspdf)
└── exportService.ts       # Unified export API
```

## 💻 Ishlatish

### 1. Export Service orqali

```typescript
import { exportDocument } from "@/utils/exportService";

// DOCX export
await exportDocument({
  format: "docx",
  content: markdownContent,
  filename: "hujjat.docx",
  fontSize: 14,
  fontFamily: "Times New Roman",
  lineHeight: 1.5,
});

// PDF export
await exportDocument({
  format: "pdf",
  content: markdownContent,
  filename: "hujjat.pdf",
});

// TXT export
await exportDocument({
  format: "txt",
  content: markdownContent,
  filename: "hujjat.txt",
});
```

### 2. To'g'ridan-to'g'ri funksiyalar

```typescript
import { generateDocx } from "@/utils/generateDocx";
import { generatePdf } from "@/utils/generatePdf";

// DOCX
await generateDocx(markdownContent, "hujjat.docx", {
  fontSize: 14,
  fontFamily: "Times New Roman",
  lineSpacing: 1.15,
});

// PDF
await generatePdf(markdownContent, "hujjat.pdf", {
  fontSize: 14,
  lineHeight: 1.5,
});
```

### 3. Document Statistics

```typescript
import { getDocumentStats } from "@/utils/exportService";

const stats = getDocumentStats(content);
console.log(stats);
// {
//   characters: 5420,
//   words: 856,
//   pages: 3
// }
```

## 📝 Markdown Formatlash Qo'llanmasi

### Sarlavhalar

```markdown
# Katta sarlavha (H1)

## O'rta sarlavha (H2)

### Kichik sarlavha (H3)
```

### Matn formatlash

```markdown
**Qalin matn**
_Kursiv matn_
**_Qalin va kursiv_**
```

### Ro'yxatlar

```markdown
- Birinchi element
- Ikkinchi element
- Uchinchi element

1. Birinchi tartiblangan element
2. Ikkinchi tartiblangan element
```

### Matn joylashuvi

Odatda barcha matn **justify** (tekis) bo'ladi.
Sarlavhalar avtomatik ravishda:

- H1 → Center
- H2+ → Left

## 🎨 UX Yaxshilanishlar

### RichTextEditor

- ✅ **Statistics bar:**
  - Belgilar soni
  - So'zlar soni
  - Taxminiy sahifalar soni
  - Tooltip yordami
- ✅ **Markdown formatlash ko'rsatmasi**
- ✅ **Live preview**

### Toast Notifications

```typescript
// Muvaffaqiyatli
toast.success("✅ DOCX muvaffaqiyatli yuklab olindi!");

// Xato
toast.error("❌ PDF yaratishda xatolik");

// Copy to clipboard
toast.success("✅ Matn nusxalandi!");
```

## 🔧 Texnik Tafsilotlar

### Markdown Parser

- Custom parser - dependency-free
- Nested list support
- Inline formatting (bold, italic)
- Heading detection (H1-H6)
- Paragraph wrapping

### DOCX Generation

- **Library:** `docx` (npm package)
- **Features:**
  - Full Microsoft Word compatibility
  - Custom fonts (Times New Roman)
  - Precise alignment control
  - Multi-page documents
  - Professional formatting

### PDF Generation

- **Library:** `jspdf`
- **Features:**
  - A4 page format
  - Times New Roman font
  - Text wrapping
  - Multi-page support
  - Justify alignment

## 📊 Sahifa Hisoblash

1 sahifa ≈ 1800 belgi (Times New Roman 14pt, A4)

Formula:

```typescript
pages = Math.ceil(characterCount / 1800);
```

## 🚀 Kelajakda Qo'shiladigan Xususiyatlar

- [ ] **Custom templates support**
- [ ] **Table support** in DOCX/PDF
- [ ] **Image embedding**
- [ ] **Headers and footers**
- [ ] **Custom watermarks**
- [ ] **Digital signatures**
- [ ] **DOCX → PDF conversion** (browser-side)
- [ ] **Multiple language fonts** (Cyrillic support)

## 🐛 Ma'lum Muammolar

1. **jsPDF font limitation:**

   - Times New Roman font built-in emas
   - Hozirda `times` (Times Roman) ishlatilmoqda
   - Kelajakda custom font qo'shiladi

2. **Justify alignment in PDF:**
   - Word-ga nisbatan perfect emas
   - Word spacing hisoblash taxminiy

## 📞 Yordam

Muammolar yuzaga kelsa:

1. Browser console'ni tekshiring
2. Content format to'g'riligini tekshiring
3. Kutubxonalar o'rnatilganligini tekshiring

---

**Developed by:** DeepMinds Group
**Version:** 1.0.0
**Last Updated:** 2025-11-18
