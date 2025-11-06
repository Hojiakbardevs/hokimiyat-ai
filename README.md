## Hokimiyat AI – Frontend

Modern React + TypeScript dastur: chat yordamchisi, hujjat generatori (Generate) va yakuniy tahrir/yuklab olish (Final). Backend mavjud bo‘lmasa ham UI darajasida ishlaydi. Dark/Light mavzular, drag-and-drop fayl biriktirish, shablonlar bilan ishlash va soddalashtirilgan tahrir (RichTextEditor) qo‘llangan.

### Asosiy imkoniyatlar

- Chat komponovkasi bilan xabar yozish
  - Drag-and-drop yoki fayl tanlash orqali ilova qo‘shish (limitlar bilan)
  - Ilova chip-lari: nomi, o‘lchami, o‘chirish
  - Xabarda biriktirilgan fayllarni ko‘rsatish va yuklab olish
- Generate sahifasi (backend-siz mock)
  - Shablon tanlash (INITIAL_TEMPLATES)
  - Sarlavha va prompt kiritish
  - Ilovalarni qo‘shish (drag-and-drop / tanlash)
  - Natija hosil qilish (simulyatsiya) va ko‘rish
  - Nusxa olish va .txt sifatida yuklab olish
  - “Final” sahifaga o‘tish
- Final sahifasi
  - Shablon nomi ko‘rsatilgan lokal header
  - Matnni joyida tahrirlash (yengil RichTextEditor)
  - .txt yuklab olish
- UI/UX
  - TailwindCSS v4, zamonaviy UI, dark/light theme
  - React Router bilan sahifalararo navigatsiya

### Texnologiyalar

- React 19 + TypeScript + Vite (rolldown-vite)
- React Router DOM 7
- TailwindCSS 4, clsx, tailwind-merge
- lucide-react ikonalar
- shadcn-ui uslubidagi `ui` komponentlar

### O‘rnatish va ishga tushirish

1. Bog‘liqliklarni o‘rnatish

```powershell
npm install
```

2. Dev serverni ishga tushirish

```powershell
npm run dev
```

3. Build

```powershell
npm run build
```

4. Preview

```powershell
npm run preview
```

### Scriptlar

- `dev` – Vite dev server
- `dev:host` – LAN orqali kirish uchun host yoqilgan dev server
- `tunnel` – localtunnel orqali 5173-portni tashqariga ochish
- `build` – TypeScript build + Vite build
- `lint` – ESLint tekshiruvi
- `preview` – build qilingan loyihani ko‘rish

### Papkalar tuzilmasi (asosiylari)

```
src/
  Page/
    HomePage.tsx          # Bosh sahifa
    ChatPage.tsx          # Chat UI + suhbatlar
    GeneratePage.tsx      # Hujjat generatsiyasi (mock)
    FinalPage.tsx         # Yakuniy tahrir va yuklab olish
  components/
    chat page/            # Chat komponentlari (composer, chat pane, messages...)
    home/                 # Landing/home bo‘lim komponentlari
    ui/                   # UI primitivlar (button, input, dialog, ...)
    rich-text-editor.tsx  # Yengil editor (textarea asosida)
  lib/
    mockData.ts           # Shablonlar va dastlabki ma’lumotlar
    utils.ts              # Yordamchi funksiyalar (masalan, formatBytes)
  hooks/
    use-mobile.ts         # Mobil holat uchun hook
```

### Asosiy komponentlar va vazifalari

- `src/components/chat page/composer.tsx`

  - Xabar matnini kiritish, fayl biriktirish (drag-and-drop/picker), chip-lar, o‘chirish
  - Limitlar: 10 ta fayl, har biri 25 MB gacha (sozlanadigan)
  - `onSend(text, attachments)` orqali yuqoriga uzatish

- `src/components/chat page/chatpane.tsx`

  - Xabarlar ro‘yxati, foydalanuvchi va bot xabarlari
  - Ilovalarni xabarda ko‘rsatish va yuklab olish

- `src/Page/ChatPage.tsx`

  - Suhbat boshqaruvi, xabar yuborish, ilovalarni o‘tkazish

- `src/Page/GeneratePage.tsx`

  - Shablon tanlash, sarlavha/prompt kiritish
  - Ilovalarni qo‘shish, natija hosil qilish (mock)
  - Nusxa olish, .txt yuklab olish, Final sahifaga o‘tish

- `src/Page/FinalPage.tsx`

  - Lokal header (Back to Edit, template nomi)
  - Matnni `RichTextEditor` orqali tahrirlash
  - .txt yuklab olish

- `src/components/rich-text-editor.tsx`

  - Engil, tashqi bog‘liqliklarsiz editor (styled textarea)

- `src/lib/utils.ts`
  - `formatBytes(bytes)` – fayl hajmini odamga qulay ko‘rinishda chiqarish

### Foydalanish qo‘llanmasi (tez boshlash)

1. Chat sahifasida `+` tugmasi yoki faylni sudrab tashlash orqali ilova qo‘shing
2. Matn yozing va yuboring – xabarda ilovalar ko‘rinadi, `Download` bilan yuklab olinadi
3. Generate sahifasida shablon tanlang, matn kiriting va natija oling
4. Final sahifasida matnni tahrir qiling va `.txt` sifatida yuklab oling

### Cheklovlar va eslatmalar

- Backend integratsiyasi yo‘q – Generate sahifasi mock tarzda ishlaydi
- `.docx` eksport hozircha yo‘q; kerak bo‘lsa `docx` bilan qo‘shish mumkin
- Toast xabarnomalari ixtiyoriy; hozircha minimal feedback qo‘llangan

### Roadmap (ixtiyoriy)

- `.docx` eksportini qo‘shish (docx kutubxonasi)
- Toast/sonner orqali foydalanuvchi xabarnomalari
- Rich editorni boyitish (bold/italic/heading tugmalari)
- Fayl turlarini cheklash va xatolik xabarlarini ko‘rsatish

### Muammo xabarlash

Agar xatolik yoki taklif bo‘lsa, Issue oching yoki to‘g‘ridan-to‘g‘ri kodda PR yuboring.
