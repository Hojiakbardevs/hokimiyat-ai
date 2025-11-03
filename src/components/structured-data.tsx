export default function StructuredData() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Hokimiyat Hujjatlarini Avtomatlashtirish Tizimi",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    inLanguage: "uz",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      priceValidUntil: new Date(new Date().setFullYear(new Date().getFullYear() + 1))
        .toISOString()
        .split("T")[0],
    },
    description:
      "Davlat organlari uchun rasmiy hujjatlarni avtomatik o‘qish, shablon asosida rasmiy javoblar yaratish va .docx ko‘rinishida yuklab olish imkonini beruvchi AI platforma. ChatGPT uslubidagi interfeys, yonma-yon solishtirish va boy matn muharriri bilan.",
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      ratingCount: "127",
    },
    softwareVersion: "1.0.0",
    featureList: [
      "GPT-5 asosida hujjat generatsiyasi",
      "Rasmiy shablonlar: Ariza, Shartnoma, Bayonnoma, Taklifnoma, Ma’lumotnoma",
      "Docx yuklash va matn ekstrakti",
      "Yonma-yon taqqoslash va inline tahrir",
      "Boy matn muharriri",
      "Microsoft Word (.docx) eksport",
      "Xatoliklar uchun foydalanuvchiga qulay xabarlar"
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
