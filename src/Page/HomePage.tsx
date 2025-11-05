import CssGridBackground from "@/components/home/css-grid-background";
import FeaturesSection from "@/components/home/features-section";
import FramerSpotlight from "@/components/home/framer-spotlight";
import TypingPromptInput from "@/components/home/typing-prompt-input";
import UseCases from "@/components/home/use-cases";
import Navbar from "@/components/navbar";
import StructuredData from "@/components/structured-data";
import { Button } from "@/components/ui/button";
import { Zap, Upload, FileCheck, Download } from "lucide-react";

export const HomePage = () => {
  return (
    <>
      <StructuredData />
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <section
          id="hero"
          className="relative min-h-screen flex items-center justify-center overflow-hidden">
          <CssGridBackground />
          <FramerSpotlight />
          <div className="container px-10 md:px-6 py-16 md:py-20">
            <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
              {/* Yuqori tag */}
              <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm mb-6">
                Hokimiyat AI yechimi
              </div>

              {/* Asosiy sarlavha */}
              <h1 className="text-5xl md:text-5xl lg:text-6xl font-bold tracking-tighter mb-6">
                Rasmiy hujjatlarni raqamli boshqarish: Hokimiyat AI
              </h1>

              {/* Tavsif */}
              <p className="text-xl text-muted-foreground md:text-2xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed max-w-2xl mb-12">
                Hujjat jarayonlarini sun’iy intellekt yordamida boshqaring.
                Ariza, shartnoma, bayonnoma va boshqa rasmiy hujjatlarni bir
                necha soniyada yarating.
              </p>

              {/* Prompt input (typing animatsiyasi) */}
              <TypingPromptInput />

              {/* Tugmalar */}
              <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-3 mt-16 w-full sm:w-auto px-4 sm:px-0">
                <Button className="w-full sm:w-auto flex items-center justify-center gap-3 px-5 py-6 h-[60px] bg-[#1a1d21] hover:bg-[#2a2d31] text-white rounded-xl border-0 dark:bg-primary dark:hover:bg-primary/90 dark:shadow-[0_0_15px_rgba(36,101,237,0.5)] relative overflow-hidden group">
                  <div className="absolute inset-0 bg-linear-to-r from-primary/0 via-primary/30 to-primary/0 dark:opacity-30 opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform -translate-x-full group-hover:translate-x-full"></div>
                  <Zap className="h-5 w-5 text-white relative z-10" />
                  <div className="flex flex-col items-start relative z-10">
                    <span className="text-[15px] font-medium">
                      Dasturni sinab ko‘ring
                    </span>
                    <span className="text-xs text-gray-400 dark:text-gray-300 -mt-0.5">
                      v1.0.0
                    </span>
                  </div>
                </Button>
                <Button className="w-full sm:w-auto px-5 py-6 h-[60px] rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-transparent hover:bg-white dark:hover:bg-gray-800 text-[15px] font-medium text-foreground">
                  Batafsil ma’lumot
                </Button>
              </div>
            </div>
          </div>
        </section>

        <FeaturesSection />

        <section
          className="py-20 m-auto"
          id="how-it-works"
          aria-labelledby="how-it-works-heading">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
              <div className="space-y-2">
                <h2
                  id="how-it-works-heading"
                  className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Tizim qanday ishlaydi
                </h2>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  Hokimiyat AI — rasmiy hujjatlarni avtomatlashtirish uchun
                  mo‘ljallangan sun’iy intellekt tizimi. Uchta oddiy qadam
                  orqali hujjatingiz tayyor bo‘ladi.
                </p>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3 lg:gap-12 items-start">
              {/* Step 1 */}
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-linear-to-br from-blue-500 to-primary text-white shadow-lg">
                  <Upload className="h-10 w-10" />
                  <div className="absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-white text-primary border-2 border-primary font-bold text-sm">
                    1
                  </div>
                </div>
                <h3 className="text-xl font-bold">
                  Hujjatni yuklang yoki yozing
                </h3>
                <p className="text-muted-foreground">
                  O‘zingizdagi <code>.docx</code> hujjatni yuklang yoki chat
                  oynasiga murojaat matnini yozing. Tizim avtomatik tarzda
                  matnni tahlil qiladi.
                </p>
              </div>

              {/* Step 2 */}
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-linear-to-br from-purple-500 to-pink-600 text-white shadow-lg">
                  <FileCheck className="h-10 w-10" />
                  <div className="absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-white text-purple-600 border-2 border-purple-600 font-bold text-sm">
                    2
                  </div>
                </div>
                <h3 className="text-xl font-bold">Hujjat turini tanlang</h3>
                <p className="text-muted-foreground">
                  ChatGPT yordamida kerakli hujjat turini tanlang — ariza,
                  shartnoma, bayonnoma, taklifnoma yoki ma’lumotnoma. AI
                  avtomatik hujjat loyihasini yaratadi.
                </p>
              </div>

              {/* Step 3 */}
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-linear-to-br from-green-500 to-emerald-600 text-white shadow-lg">
                  <Download className="h-10 w-10" />
                  <div className="absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-white text-green-600 border-2 border-green-600 font-bold text-sm">
                    3
                  </div>
                </div>
                <h3 className="text-xl font-bold">Natijani yuklab oling</h3>
                <p className="text-muted-foreground">
                  Yaratilgan hujjatni ko‘rib chiqing, tahrir qiling va Word (
                  <code>.docx</code>) formatida yuklab oling. Barcha hujjatlar
                  rasmiy andozalar va AI tahliliga asoslanadi.
                </p>
              </div>
            </div>
          </div>
        </section>
        {/* Use Cases Section */}
        <UseCases />
      </div>
    </>
  );
};
