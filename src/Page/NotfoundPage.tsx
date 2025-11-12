import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Home, ArrowLeft, Search, FileQuestion, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import CssGridBackground from "@/components/home/css-grid-background";
import FramerSpotlight from "@/components/home/framer-spotlight";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden">
      {/* Background Components */}
      <div className="absolute inset-0 z-0">
        <CssGridBackground />
        <FramerSpotlight />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl px-4 text-center">
        {/* Floating Icons Animation */}
        <div className="relative mb-8">
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="animate-float">
              <FileQuestion
                className="h-32 w-32 text-muted-foreground/20"
                strokeWidth={1}
              />
            </div>
          </div>

          {/* 404 Text with Gradient */}
          <div className="relative">
            <h1 className="mb-2 text-[10rem] font-black leading-none md:text-[12rem] lg:text-[14rem]">
              <span className="bg-linear-to-r from-primary via-purple-500 to-primary bg-clip-text text-transparent animate-gradient bg-size-[200%_auto]">
                404
              </span>
            </h1>

            {/* Sparkle Effects */}
            <Sparkles className="absolute top-4 right-1/4 h-8 w-8 text-primary animate-pulse" />
            <Sparkles className="absolute bottom-4 left-1/3 h-6 w-6 text-purple-500 animate-pulse delay-300" />
          </div>
        </div>

        {/* Error Message */}
        <div className="space-y-4 mb-12">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Sahifa topilmadi
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground md:text-xl">
            Kechirasiz, siz qidirayotgan sahifa mavjud emas yoki boshqa joyga
            ko'chirilgan. Iltimos, manzilni tekshiring yoki bosh sahifaga
            qayting.
          </p>

          {/* Requested Path Display */}
          <div className="inline-block rounded-lg bg-muted px-4 py-2 text-sm font-mono text-muted-foreground">
            <Search className="inline h-4 w-4 mr-2" />
            <span className="opacity-60">So'ralgan yo'l:</span>{" "}
            {location.pathname}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button
            onClick={() => navigate(-1)}
            variant="outline"
            size="lg"
            className="group w-full sm:w-auto h-14 px-8 text-base border-2 hover:border-primary hover:bg-primary/5 transition-all duration-300">
            <ArrowLeft className="mr-2 h-5 w-5 group-hover:-translate-x-1 transition-transform duration-300" />
            Orqaga qaytish
          </Button>

          <Button
            onClick={() => navigate("/")}
            size="lg"
            className="group w-full sm:w-auto h-14 px-8 text-base bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl hover:shadow-primary/30 transition-all duration-300">
            <Home className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
            Bosh sahifaga qaytish
          </Button>
        </div>
      </div>

      <style>{`
            @keyframes float {
              0%, 100% {
                transform: translateY(0px);
              }
              50% {
                transform: translateY(-20px);
              }
            }

            @keyframes gradient {
              0% {
                background-position: 0% 50%;
              }
              50% {
                background-position: 100% 50%;
              }
              100% {
                background-position: 0% 50%;
              }
            }

            .animate-float {
              animation: float 6s ease-in-out infinite;
            }

            .animate-gradient {
              animation: gradient 3s ease infinite;
            }

            .delay-300 {
              animation-delay: 300ms;
            }
          `}</style>
    </div>
  );
};

export default NotFound;
