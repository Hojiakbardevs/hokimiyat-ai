// src/Page/RegisterPage.tsx
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { register, refreshToken } from "@/api/auth";
import { setTokens } from "@/api/client";
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
import {
  Phone,
  User,
  Lock,
  UserPlus,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
} from "lucide-react";
import { toast } from "sonner";
import Logos from "@/assets/logowhite.svg";

export default function RegisterPage() {
  const [phone, setPhone] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

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
    setError(null);

    if (password !== confirmPassword) {
      setError("Parollar mos kelmayapti");
      return;
    }

    if (!phone.trim()) {
      setError("Telefon raqami kiritilishi shart");
      return;
    }

    if (!firstName.trim() || !lastName.trim()) {
      setError("Ism va familiya kiritilishi shart");
      return;
    }

    setLoading(true);
    try {
      const result: any = await register({
        phone,
        password,
        first_name: firstName,
        last_name: lastName,
      });

      console.log("Registration successful:", result);

      // If backend returns tokens on register, auto-login
      const access: string | undefined = result?.access;
      const refresh: string | undefined = result?.refresh;
      if (access || refresh) {
        try {
          // Save what we have
          setTokens({ access, refresh });
          // If only refresh provided, fetch access
          if (!access && refresh) {
            const newTokens = await refreshToken(refresh);
            setTokens({
              access: newTokens.access,
              refresh: newTokens.refresh || refresh,
            });
          }
          toast.success("Ro'yxatdan o'tdingiz! Tizimga kirdingiz.");
          navigate("/chat-assistant", { replace: true });
          return;
        } catch (e) {
          // If refresh/access flow fails, fall back to login page
          console.warn(
            "Auto-login after register failed, redirecting to login."
          );
        }
      }

      // No tokens returned -> go to login as before
      toast.success("Ro'yxatdan o'tdingiz! Endi kirish mumkin.");
      navigate("/login");
    } catch (e: any) {
      let errMsg = e?.message || "Ro'yxatdan o'tishda xatolik";

      // Parse JSON error response if exists
      try {
        const errorData =
          typeof errMsg === "string" && errMsg.startsWith("{")
            ? JSON.parse(errMsg)
            : null;

        if (errorData) {
          if (errorData.phone) {
            errMsg =
              "Bu telefon raqami allaqachon ro'yxatdan o'tgan. Boshqa raqam kiriting yoki login qiling.";
          } else if (errorData.email) {
            errMsg = "Bu email allaqachon ro'yxatdan o'tgan.";
          } else if (errorData.detail) {
            errMsg = errorData.detail;
          } else {
            errMsg = JSON.stringify(errorData);
          }
        }
      } catch {}

      // Check for connection issues
      if (
        errMsg.includes("Failed to fetch") ||
        errMsg.includes("ERR_CONNECTION_REFUSED")
      ) {
        errMsg =
          "Backend serverga ulanishda xatolik. Server ishlamayapti yoki URL noto'g'ri. Iltimos, backend serverni ishga tushiring.";
      } else if (errMsg.includes("404") || errMsg.includes("Not Found")) {
        errMsg =
          "Ro'yxatdan o'tish endpoint topilmadi. Backend developer /accounts/register/ endpoint qo'shishi kerak.";
      } else if (errMsg.includes("401") || errMsg.includes("Authentication")) {
        errMsg =
          "Backend konfiguratsiyasi noto'g'ri. /accounts/register/ endpoint authentication talab qilmasligi kerak.";
      }

      setError(errMsg);
      toast.error(errMsg);
      console.error("Register error:", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <section
        id="register"
        className="relative min-h-screen flex items-center justify-center overflow-hidden p-4">
        {/* Register Card */}
        <Card className="w-full max-w-2xl z-10 shadow-2xl border-border/50 backdrop-blur-sm bg-card/95">
          <CardHeader className="space-y-3 pb-6">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <img src={Logos} alt="Institut AI Logo" />
            </div>
            <CardTitle className="text-2xl font-bold text-center">
              Ro'yxatdan o'tish
            </CardTitle>
            <CardDescription className="text-center text-sm">
              Yangi hisob yaratish uchun ma'lumotlarni kiriting
            </CardDescription>
          </CardHeader>

          <CardContent className="px-8 pb-8">
            <form onSubmit={onSubmit} className="space-y-4">
              {/* Phone Input */}
              <div className="space-y-2">
                <Label
                  htmlFor="phone"
                  className="text-sm font-medium flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Telefon raqami
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+998 90 123 45 67"
                  autoComplete="tel"
                  required
                  className="h-11"
                />
              </div>

              {/* Name Inputs - Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="firstName"
                    className="text-sm font-medium flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Ism
                  </Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Ismingiz"
                    autoComplete="given-name"
                    required
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-sm font-medium">
                    Familiya
                  </Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Familiyangiz"
                    autoComplete="family-name"
                    required
                    className="h-11"
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
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Parolingizni kiriting"
                    autoComplete="new-password"
                    required
                    className="h-11 pr-10 [&::-ms-reveal]:hidden [&::-ms-clear]:hidden [&::-webkit-credentials-auto-fill-button]:hidden [&::-webkit-contacts-auto-fill-button]:hidden"
                    style={
                      {
                        WebkitTextSecurity: showPassword ? "none" : "disc",
                      } as any
                    }
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors z-10"
                    tabIndex={-1}>
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password Input */}
              <div className="space-y-2">
                <Label
                  htmlFor="confirmPassword"
                  className="text-sm font-medium flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Parolni tasdiqlang
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Parolni qayta kiriting"
                    autoComplete="new-password"
                    required
                    className="h-11 pr-10 [&::-ms-reveal]:hidden [&::-ms-clear]:hidden [&::-webkit-credentials-auto-fill-button]:hidden [&::-webkit-contacts-auto-fill-button]:hidden"
                    style={
                      {
                        WebkitTextSecurity: showConfirmPassword
                          ? "none"
                          : "disc",
                      } as any
                    }
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors z-10"
                    tabIndex={-1}>
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Error Alert */}
              {error && (
                <Alert variant="destructive" className="animate-in fade-in-50">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 text-base font-semibold transition-all hover:scale-[1.02] mt-6">
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Ro'yxatdan o'tilmoqda...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <UserPlus className="w-5 h-5" />
                    Ro'yxatdan o'tish
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

              {/* Login Link */}
              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  Hisobingiz bormi?
                </p>
                <Link to="/login">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-12 text-base font-semibold hover:bg-accent">
                    Kirish
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
