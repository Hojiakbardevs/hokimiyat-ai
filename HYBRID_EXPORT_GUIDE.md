# 🎯 Hokimiyat AI - Hybrid DOCX Export System

## 📋 Ikki Usul - Bir Tizim

### 1️⃣ **Template-Based Export** 📄

Mavjud DOCX template (xat_blanka.docx) dan foydalanadi

**Qachon ishlatiladi:**

- ✅ Rasmiy hujjat blankasi kerak bo'lganda
- ✅ Header, footer, logo saqlash kerak
- ✅ Tashkilot formati muhim
- ✅ Oddiy matn almashtirish kifoya

**Qanday ishlaydi:**

```typescript
await exportDocument({
  format: "docx",
  mode: "template", // 👈 Template usulini tanlash
  templateName: "xat_blanka.docx",
  content: "Sizning matnigiz...",
  filename: "rasmiy_xat.docx",
});
```

**Template struktura:**

```
xat_blanka.docx ichida:
┌─────────────────────────────┐
│ [TASHKILOT LOGO]            │
│ [Header ma'lumotlari]       │
│                             │
│ {body} 👈 Bu joyga matn     │
│           qo'yiladi         │
│                             │
│ [Footer]                    │
└─────────────────────────────┘
```

---

### 2️⃣ **Markdown-Based Export** ✨

Markdown formatidan to'liq formatlangan DOCX yaratadi

**Qachon ishlatiladi:**

- ✅ Formatlash kerak (bold, italic, lists)
- ✅ Sarlavhalar, paragraflar
- ✅ Professional ko'rinish
- ✅ Template yo'q yoki kerak emas

**Qanday ishlaydi:**

```typescript
await exportDocument({
  format: "docx",
  mode: "markdown", // 👈 Markdown usulini tanlash (default)
  content: `
# Sarlavha
**Hurmatli** foydalanuvchi,

Bu *markdown* formatidagi matn:
- Birinchi element
- Ikkinchi element

Hurmat bilan,
Mas'ul shaxs
  `,
  filename: "formatlangan_xat.docx",
});
```

**Natija:**

- ✅ Times New Roman 14pt
- ✅ Justify alignment
- ✅ Bold, Italic
- ✅ Bullet lists
- ✅ Sarlavhalar (center, bold)

---

## 🎨 UI da Tanlash

FinalPage da foydalanuvchi tanlashi mumkin:

```tsx
{
  /* Export Mode Selection */
}
{
  selectedFormat === "docx" && (
    <div className="mb-4">
      <label>DOCX Yaratish Usuli</label>
      <div className="grid grid-cols-2 gap-2">
        <button onClick={() => setExportMode("template")}>📄 Template</button>
        <button onClick={() => setExportMode("markdown")}>✨ Markdown</button>
      </div>
      <p className="text-xs">
        {exportMode === "template"
          ? "📄 Mavjud template ichidagi {body} ni almashtiradi"
          : "✨ Markdown formatidan to'liq DOCX yaratadi"}
      </p>
    </div>
  );
}
```

---

## 📊 Taqqoslash

| Xususiyat            | Template Mode          | Markdown Mode     |
| -------------------- | ---------------------- | ----------------- |
| **Ishlash Tezligi**  | ⚡ Tezroq              | 🐢 Biroz sekin    |
| **Template Saqlash** | ✅ Ha                  | ❌ Yo'q           |
| **Header/Footer**    | ✅ Saqlanadi           | ❌ Yo'q           |
| **Logo/Rasm**        | ✅ Saqlanadi           | ❌ Yo'q           |
| **Formatlash**       | ⚠️ Oddiy               | ✅ To'liq         |
| **Bold/Italic**      | ⚠️ Cheklangan          | ✅ Ha             |
| **Lists**            | ❌ Yo'q                | ✅ Ha             |
| **Sarlavhalar**      | ❌ Yo'q                | ✅ Ha             |
| **Alignment**        | 📄 Template ga bog'liq | ✅ To'liq nazorat |

---

## 🔧 API Dokumentatsiya

### `exportDocument(options)`

```typescript
interface ExportOptions {
  format: "docx" | "pdf" | "txt";
  content: string;
  filename?: string;

  // DOCX uchun
  mode?: "template" | "markdown"; // Default: "markdown"
  templateName?: string; // Default: "xat_blanka.docx"

  // Styling
  fontSize?: number; // Default: 14
  fontFamily?: string; // Default: "Times New Roman"
  lineHeight?: number; // Default: 1.5
}
```

### Misollar

#### 1. Template-based DOCX

```typescript
await exportDocument({
  format: "docx",
  mode: "template",
  templateName: "xat_blanka.docx",
  content: "Hurmatli Professor, sizga xat...",
  filename: "rasmiy_xat.docx",
});
```

#### 2. Markdown-based DOCX

```typescript
await exportDocument({
  format: "docx",
  mode: "markdown", // yoki o'tkazmasangiz ham bo'ladi (default)
  content: `
# Xat

**Hurmatli** foydalanuvchi,

- Birinchi nuqta
- Ikkinchi nuqta
  `,
  filename: "formatlangan_xat.docx",
});
```

#### 3. PDF (faqat markdown)

```typescript
await exportDocument({
  format: "pdf",
  content: "Markdown formatlangan matn...",
  filename: "hujjat.pdf",
});
```

---

## 🗂️ Template Joylashuvi

```
src/
  assets/
    xat blanka.docx  ← Template fayl shu yerda
```

Template fayl ichida `{body}` placeholder bo'lishi kerak:

```xml
<w:p>
  <w:r>
    <w:t>{body}</w:t>
  </w:r>
</w:p>
```

---

## 💡 Qachon Qaysi Usulni Tanlash?

### 📄 **Template Mode** - Qachon?

1. ✅ Rasmiy xat yozyapsiz
2. ✅ Tashkilot blankasi kerak
3. ✅ Logo, muhr joy ajratilgan
4. ✅ Oddiy matn kifoya
5. ✅ Tezlik muhim

**Misol:** Javob xatlari, rasmiy murojaat, buyruq nusxalari

### ✨ **Markdown Mode** - Qachon?

1. ✅ To'liq formatlash kerak
2. ✅ Sarlavhalar, ro'yxatlar bor
3. ✅ Professional ko'rinish kerak
4. ✅ Template yo'q
5. ✅ Maxsus dizayn kerak

**Misol:** Hisobotlar, taqdimotlar, ma'ruza matnlari, ilmiy ishlar

---

## 🚀 Kelajakda Qo'shiladigan

- [ ] **Ko'p template support** - turli hujjat turlari
- [ ] **Template preview** - yuklashdan oldin ko'rish
- [ ] **Custom placeholders** - {body}, {title}, {date}, {author}
- [ ] **Template editor** - browserda template tahrirlash
- [ ] **Merge fields** - Excel/JSON dan ma'lumot olish
- [ ] **Template library** - tayyor templatelar to'plami

---

## 📝 Yakuniy Misol

```typescript
// FinalPage.tsx da
const handleDownload = async () => {
  await exportDocument({
    format: selectedFormat, // "docx", "pdf", "txt"
    mode: exportMode, // "template" yoki "markdown"
    content: content,
    filename: `${title}_${Date.now()}.${selectedFormat}`,
    templateName: "xat_blanka.docx",
    fontSize: 14,
    fontFamily: "Times New Roman",
    lineHeight: 1.5,
  });

  toast.success("✅ Muvaffaqiyatli yuklab olindi!");
};
```

---

**Yaratilgan:** 2025-11-18  
**Version:** 2.0 - Hybrid System  
**Status:** ✅ Production Ready  
**Developed by:** DeepMinds Group
