 

export const INITIAL_CONVERSATIONS = [

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
]
