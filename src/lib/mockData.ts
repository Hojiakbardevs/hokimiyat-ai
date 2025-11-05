import { makeId } from "./utils"

export const INITIAL_CONVERSATIONS = [
  {
    id: "c1",
    title: "Fuqarolar murojaatiga javob loyihasi",
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    messageCount: 12,
    preview: "Kelgan ariza bo‘yicha rasmiy javob xatini tayyorlash...",
    pinned: true,
    folder: "Hokimiyat loyihalari",
    messages: [
      {
        id: makeId("m"),
        role: "user",
        content: "Quyidagi murojaat asosida rasmiy javob xati loyihasini tayyorlab bering.",
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: makeId("m"),
        role: "assistant",
        content: "Albatta. Murojaat mazmuni, normativ asos va hokimiyat pozitsiyasi asosida javob loyihasini tuzaman.",
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000 + 60000).toISOString(),
      },
    ],
  },
  {
    id: "c2",
    title: "Fuqarolar murojaatlari tahlili (oylik)",
    updatedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    messageCount: 22,
    preview: "Mavzular kesimida tahlil, takroriy shikoyatlar va takliflar bo‘yicha hisobot...",
    pinned: false,
    folder: "Analitika va hisobotlar",
    messages: [],
  },
  {
    id: "c3",
    title: "Yig‘ilish bayonnomasi – sektor rahbarlari",
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    messageCount: 9,
    preview: "Kun tartibi, qabul qilingan qarorlar va mas’ullarga biriktirilgan vazifalar...",
    pinned: false,
    folder: "Yig‘ilishlar",
    messages: [],
  },
  {
    id: "c4",
    title: "Shartnoma loyihasini ko‘rib chiqish",
    updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    messageCount: 17,
    preview: "Tomonlarning majburiyatlari, muddatlar va javobgarlik bandlarini aniqlashtirish...",
    pinned: true,
    folder: "Yuridik hujjatlar",
    messages: [],
  },
  {
    id: "c5",
    title: "Byudjet hisobotini tayyorlash",
    updatedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    messageCount: 6,
    preview: "Oy yakunlari bo‘yicha daromad–xarajatlar tahlili va qisqa xulosa...",
    pinned: false,
    folder: "Analitika va hisobotlar",
    messages: [],
  },
  {
    id: "c6",
    title: "Hududiy dastur bo‘yicha taklifnoma",
    updatedAt: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    messageCount: 31,
    preview: "Loyiha maqsadi, kutilayotgan natijalar va moliyalashtirish manbalari...",
    pinned: false,
    folder: "Hokimiyat loyihalari",
    messages: [],
  },
  {
    id: "c7",
    title: "Shaxsiy rejalar – malaka oshirish",
    updatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    messageCount: 8,
    preview: "O‘quv kurslari, seminarlarda ishtirok va o‘z ustida ishlash rejasi...",
    pinned: false,
    folder: "Shaxsiy",
    messages: [],
  },
  {
    id: "c8",
    title: "Ichki yo‘riqnoma loyihasi",
    updatedAt: new Date(Date.now() - 50 * 60 * 1000).toISOString(),
    messageCount: 14,
    preview: "Xodimlar uchun ichki tartib-qoidalar va javobgarlik bo‘yicha hujjat...",
    pinned: false,
    folder: "Normativ hujjatlar",
    messages: [],
  },
  {
    id: "c9",
    title: "Fuqarolar bilan ishlash standartlari",
    updatedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    messageCount: 40,
    preview: "Murojaatlarni qabul qilish, qayd etish va ko‘rib chiqish tartibi...",
    pinned: false,
    folder: "Normativ hujjatlar",
    messages: [],
  },
  {
    id: "c10",
    title: "AI uchun shablonlarni tuzish",
    updatedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    messageCount: 11,
    preview: "Ariza, bayonnoma, ma’lumotnoma uchun yagona shablonlarni ishlab chiqish...",
    pinned: false,
    folder: "Hokimiyat loyihalari",
    messages: [],
  },
  {
    id: "c11",
    title: "Shaxsiy moliya va xarajatlar rejalashtirish",
    updatedAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
    messageCount: 5,
    preview: "Oylik xarajatlar, jamg‘arma va rejalashtirilgan katta xaridlar...",
    pinned: false,
    folder: "Shaxsiy",
    messages: [],
  },
]

export const INITIAL_TEMPLATES = [
  {
    id: "t1",
    name: "Ariza shabloni",
    content: `**ARIZA**

**Kimga:**
[Muassasa nomi, lavozim, F.I.Sh.]

**Kimdan:**
[F.I.Sh., manzil, aloqa ma’lumotlari]

**Mavzu:**
[Ariza mavzusi qisqacha]

**Matn:**
Hurmatli [lavozim egasi],

[Ariza mazmuni: muammo, iltimos yoki taklif batafsil bayon etiladi.]

**Ilovalar (agar bo‘lsa):**
- 1-ilova:
- 2-ilova:

**Sana:**
[__  __ 20__ y.]

**Imzo:**
[__________________]`,
    snippet: "Rasmiy ariza uchun to‘liq shakllantirilgan shablon...",
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "t2",
    name: "Bayonnoma",
    content: `**BAYONNOMA**

**Yig‘ilish nomi:**
[Masalan: Sektor rahbarlari yig‘ilishi]

**Sana:** [__  __ 20__ y.]
**Joy:** [Manzil]
**Ishtirokchilar:** [Ishtirokchilar ro‘yxati]

**Kun tartibi:**
1. [Masala 1]
2. [Masala 2]
3. [Masala 3]

**Muhokama:**
Har bir masala bo‘yicha asosiy fikrlar qisqacha yoritiladi.

**Qabul qilingan qarorlar:**
- 1-band: [qaror mazmuni, mas’ul, bajarish muddati]
- 2-band: [qaror mazmuni, mas’ul, bajarish muddati]

**Ijro nazorati:**
[Ijro nazoratchisi, hisobot taqdim etish tartibi]

**Imzolar:**
Rais: ____________________
Kotib: ____________________`,
    snippet: "Yig‘ilish bayonnomasi uchun rasmiy tuzilma va bandlar...",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "t3",
    name: "Shartnoma loyihasi",
    content: `**SHARTNOMA LOYIHASI**

**1. Tomonlar:**
1.1. [Birinchi tomon nomi, rekvizitlari]  
1.2. [Ikkinchi tomon nomi, rekvizitlari]

**2. Shartnoma predmeti:**
[Shartnoma nimani tartibga soladi, xizmat yoki ish mazmuni.]

**3. Tomonlarning majburiyatlari:**
3.1. Birinchi tomon majburiyatlari:  
- ...  
3.2. Ikkinchi tomon majburiyatlari:  
- ...

**4. Muddatlar va tartib:**
[Shartnoma amal qilish muddati, bajarish bosqichlari.]

**5. To‘lov shartlari:**
[To‘lov miqdori, tartibi, muddatlari.]

**6. Javobgarlik:**
[Shartlarni buzganlik uchun javobgarlik bandlari.]

**7. Fors-major holatlar:**
[Favqulodda holatlar va ularning oqibatlari bo‘yicha tartib.]

**8. Nizolarni hal etish tartibi:**
[Kelib chiqadigan nizolarni qanday hal qilish tartibi.]

**9. Yakuniy qoidalar:**
[Qo‘shimcha bandlar, ilovalar, kuchga kirish tartibi.]

**Imzolar:**
Birinchi tomon: ____________________  
Ikkinchi tomon: ____________________`,
    snippet: "Tomonlar, majburiyatlar, muddatlar va javobgarlikni o‘z ichiga olgan shartnoma shabloni...",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "t4",
    name: "Ma’lumotnoma",
    content: `**MA’LUMOTNOMA**

**Kimga:**
[Qabul qiluvchi tashkilot yoki shaxs]

**Kimdan:**
[Muassasa nomi, bo‘lim, F.I.Sh.]

**Mavzu:**
[Ma’lumotnoma mavzusi qisqacha]

**Matn:**
Mazkur ma’lumotnoma shuni tasdiqlaydiki,  
[F.I.Sh. yoki obyekt nomi] haqida quyidagilar ma’lum qilinadi:

1. [Fakt 1]  
2. [Fakt 2]  
3. [Fakt 3]

Zarurat tug‘ilganda qo‘shimcha ma’lumot berilishi mumkin.

**Sana:**
[__  __ 20__ y.]

**Imzo:**
[__________________]

**Muhr:**
[agar kerak bo‘lsa]`,
    snippet: "Rasmiy ma’lumotnoma uchun tayyor tuzilma va bandlar...",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

export const INITIAL_FOLDERS = [
  { id: "f1", name: "Hokimiyat loyihalari" },
  { id: "f2", name: "Analitika va hisobotlar" },
  { id: "f3", name: "Yig'ilishlar" },
  { id: "f4", name: "Yuridik hujjatlar" },
  { id: "f5", name: "Shaxsiy" },
  { id: "f6", name: "Normativ hujjatlar" },
]
