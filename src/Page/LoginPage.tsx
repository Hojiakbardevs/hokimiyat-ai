// src/Page/LoginPage.tsx
import { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import CssGridBackground from "@/components/home/css-grid-background";
import FramerSpotlight from "@/components/home/framer-spotlight";
import { Phone, Lock, LogIn, AlertCircle } from "lucide-react";
import Logos from "@/assets/logowhite.svg";

export default function LoginPage() {
  const { login, loading, error } = useAuth();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const location = useLocation() as any;
  const from = location.state?.from?.pathname || "/chat-assistant";

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

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await login({ phone, password });
    if (ok) navigate(from, { replace: true });
  };

  return (
    <div className="flex min-h-screen flex-col">
      <section
        id="hero"
        className="relative min-h-screen flex items-center justify-center overflow-hidden p-4">
        {/* Logo/Brand Section */}

        {/* Login Card */}
        <Card className="w-full max-w-md z-10 shadow-2xl border-border/50 backdrop-blur-sm bg-card/95">
          <CardHeader className="space-y-3 pb-6">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              {/* <LogIn className="w-7 h-7 text-primary" /> */}
              <Link to="/">
                <img src={Logos} alt="Logo" />
              </Link>
            </div>
            <CardTitle className="text-3xl font-bold text-center">
              Xush kelibsiz
            </CardTitle>
            <CardDescription className="text-center text-base">
              Hisobingizga kirish uchun ma'lumotlarni kiriting
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={onSubmit} className="space-y-5">
              {/* Phone Input */}
              <div className="space-y-2">
                <Label
                  htmlFor="phone"
                  className="text-sm font-medium flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Telefon raqami
                </Label>
                <div className="relative">
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+998 90 123 45 67"
                    autoComplete="tel"
                    required
                    className="pl-4 h-12 text-base"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="text-sm font-medium flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Parol
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Parolingizni kiriting"
                    autoComplete="current-password"
                    required
                    className="pl-4 h-12 text-base"
                  />
                </div>
              </div>

              {/* Error Alert */}
              {error && (
                <Alert variant="destructive" className="animate-in fade-in-50">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 text-base font-semibold transition-all hover:scale-[1.02]">
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Kirilmoqda...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <LogIn className="w-5 h-5" />
                    Kirish
                  </span>
                )}
              </Button>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">
                    Yoki
                  </span>
                </div>
              </div>

              {/* Register Link */}
              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  Hisobingiz yo'qmi?
                </p>
                <Link to="/register">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-12 text-base font-semibold hover:bg-accent">
                    Ro'yxatdan o'tish
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Background Effects */}
        <CssGridBackground />
        <FramerSpotlight />
      </section>
    </div>
  );
}
