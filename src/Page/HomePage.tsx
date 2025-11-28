import { useEffect } from "react";
import CssGridBackground from "@/components/home/css-grid-background";
import FeaturesSection from "@/components/home/features-section";
import Footer from "@/components/home/footer";
import FramerSpotlight from "@/components/home/framer-spotlight";
import TypingPromptInput from "@/components/home/typing-prompt-input";
import UseCases from "@/components/home/use-cases";
import Navbar from "@/components/navbar";
import StructuredData from "@/components/structured-data";
import { Button } from "@/components/ui/button";
import {
  Zap,
  Upload,
  FileCheck,
  Download,
  Users,
  Database,
  Bot,
  Shield,
} from "lucide-react";
import { Link } from "react-router-dom";

export const HomePage = () => {
  // Theme management
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    document.documentElement.setAttribute("data-theme", savedTheme);
    document.documentElement.style.colorScheme = savedTheme;
  }, []);

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
                Institut AI yechimi
              </div>

              {/* Asosiy sarlavha */}
              <h1 className="text-5xl md:text-5xl lg:text-6xl font-bold tracking-tighter mb-6">
                Rasmiy hujjatlarni raqamli boshqarish: Institut AI
              </h1>

              {/* Tavsif */}
              <p className="text-xl text-muted-foreground md:text-2xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed max-w-2xl mb-12">
                Hujjat jarayonlarini sun'iy intellekt yordamida boshqaring.
                Ariza, shartnoma, bayonnoma va boshqa rasmiy hujjatlarni bir
                necha soniyada yarating.
              </p>

              {/* Prompt input (typing animatsiyasi) */}
              <TypingPromptInput />

              {/* Tugmalar - YANGILANGAN */}
              <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-4 mt-16 w-full sm:w-auto px-4 sm:px-0">
                <Link to="/chat-assistant" className="w-full sm:w-auto">
                  <Button
                    className="w-full sm:w-auto flex items-center justify-center gap-3 px-6 py-6 h-[60px] bg-[#1a1d21] hover:bg-[#2a2d31] text-white rounded-xl border-0 dark:bg-primary dark:hover:bg-primary/90 dark:shadow-[0_0_15px_rgba(36,101,237,0.5)] hover:shadow-[0_0_20px_rgba(36,101,237,0.3)] transition-all duration-300 relative overflow-hidden group"
                    aria-label="Dasturni sinab ko'rish">
                    <div className="absolute inset-0 bg-linear-to-r from-primary/0 via-primary/30 to-primary/0 dark:opacity-30 opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform -translate-x-full group-hover:translate-x-full"></div>
                    <Zap className="h-5 w-5 text-white relative z-10 group-hover:scale-110 transition-transform duration-300" />
                    <div className="flex flex-col items-start relative z-10">
                      <span className="text-[15px] font-semibold">
                        Dasturni sinab ko'ring
                      </span>
                      <span className="text-xs text-gray-400 dark:text-gray-300 -mt-0.5">
                        v1.0.0
                      </span>
                    </div>
                  </Button>
                </Link>
                <Button
                  onClick={() =>
                    document
                      .getElementById("features")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                  className="w-full sm:w-auto px-6 py-6 h-[60px] rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 hover:border-primary dark:hover:border-primary text-[15px] font-semibold text-foreground transition-all duration-300 hover:shadow-lg"
                  aria-label="Batafsil ma'lumot">
                  Batafsil ma'lumot
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
                  Institut AI — rasmiy hujjatlarni avtomatlashtirish uchun
                  mo'ljallangan sun'iy intellekt tizimi. Uchta oddiy qadam
                  orqali hujjatingiz tayyor bo'ladi.
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
                  O'zingizdagi <code>.docx</code> hujjatni yuklang yoki chat
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
                  shartnoma, bayonnoma, taklifnoma yoki ma'lumotnoma. AI
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
                  Yaratilgan hujjatni ko'rib chiqing, tahrir qiling va Word (
                  <code>.docx</code>) formatida yuklab oling. Barcha hujjatlar
                  rasmiy andozalar va AI tahliliga asoslanadi.
                </p>
              </div>
            </div>
          </div>
        </section>
        {/* Use Cases Section */}
        <UseCases />

        {/* Aloqa va narxlash bo'limi */}
        <section
          id="contact"
          className="py-20 bg-linear-to-b from-background to-muted/30 dark:from-background dark:to-muted/10"
          aria-labelledby="contact-heading">
          <div className="container px-4 md:px-6 m-auto">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-primary px-3 py-1 text-sm text-primary-foreground mb-2">
                  Biz bilan bog'laning
                </div>
                <h2
                  id="contact-heading"
                  className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Maxsus tashkilotlar uchun narxlash
                </h2>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  Institut AI — har bir tashkilotning o'ziga xos ehtiyojlari va
                  miqyosiga mos maxsus narxlash paketlarini taklif etadi.
                </p>
              </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 container max-w-8xl mx-auto ">
              {/* Sol tomon - Features */}
              <div className="space-y-6">
                <h3 className="text-2xl font-bold mb-6">Nima kiritilgan?</h3>

                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    <span>
                      Cheklanmagan foydalanuvchilar soni va rollarga asoslangan
                      kirish nazorati
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Database className="h-5 w-5 text-primary" />
                    <span>Moslashtiriladigan bilim bazasi hajmi</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Bot className="h-5 w-5 text-primary" />
                    <span>
                      Barcha sun'iy intellekt (LLM) modellariga kirish
                      imkoniyati
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    <span>
                      Tashkilot darajasidagi xavfsizlik va maxfiylik siyosati
                    </span>
                  </div>
                </div>

                <div className="pt-4">
                  <p className="font-medium">
                    Narx va texnik talablarga oid shaxsiy taklif olish uchun biz
                    bilan bog'laning.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-center">
                <div className="w-full max-w-md p-8 rounded-2xl bg-background/80 backdrop-blur-sm border-2 border-primary/20 shadow-lg dark:shadow-primary/5">
                  <div className="space-y-6">
                    <div className="text-center space-y-2">
                      <h3 className="text-2xl font-bold">
                        Shaxsiy taklif oling
                      </h3>
                      <p className="text-muted-foreground">
                        Tashkilotingiz ehtiyojlariga moslashtirilgan narx va
                        yechimlar
                      </p>
                    </div>

                    <div className="space-y-4 py-4">
                      <div className="flex items-center gap-3 text-sm">
                        <div className="h-2 w-2 rounded-full bg-primary"></div>
                        <span>Bepul demo va konsultatsiya</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <div className="h-2 w-2 rounded-full bg-primary"></div>
                        <span>Texnik integratsiya yordami</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <div className="h-2 w-2 rounded-full bg-primary"></div>
                        <span>24/7 texnik qo'llab-quvvatlash</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <div className="h-2 w-2 rounded-full bg-primary"></div>
                        <span>O'quv va yo'riqnomalar</span>
                      </div>
                    </div>

                    <Button className="w-full h-12 text-base bg-primary hover:bg-primary/90 dark:shadow-[0_0_15px_rgba(36,101,237,0.4)]">
                      <a
                        href="https://t.me/Alpha_development"
                        target="_blank"
                        rel="noopener noreferrer">
                        {" "}
                        Aloqaga chiqish
                      </a>
                    </Button>

                    <p className="text-xs text-center text-muted-foreground">
                      Yoki email orqali:{" "}
                      <a
                        href="mailto:info@airi.uz"
                        className="text-primary hover:underline">
                        info@airi.uz
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* footer */}

        <Footer />
      </div>
    </>
  );
};
