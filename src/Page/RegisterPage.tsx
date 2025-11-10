// src/Page/RegisterPage.tsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { register } from "@/api/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function RegisterPage() {
  const [phone, setPhone] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

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
      await register({
        phone,
        password,
        first_name: firstName,
        last_name: lastName,
      });
      toast.success("Ro'yxatdan o'tdingiz! Endi kirish mumkin.");
      navigate("/login");
    } catch (e: any) {
      const errMsg = e?.message || "Ro'yxatdan o'tishda xatolik";
      setError(errMsg);
      toast.error(errMsg);
      console.error("Register error:", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid place-items-center bg-background text-foreground px-4">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm space-y-4 border border-border rounded-lg p-6 bg-card">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold">Ro'yxatdan o'tish</h1>
          <p className="text-sm text-muted-foreground">Yangi hisob yarating</p>
        </div>
        <div className="space-y-2">
          <label className="text-sm" htmlFor="phone">
            Telefon raqami
          </label>
          <Input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+998901234567"
            autoComplete="tel"
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm" htmlFor="firstName">
            Ism
          </label>
          <Input
            id="firstName"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Ismingiz"
            autoComplete="given-name"
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm" htmlFor="lastName">
            Familiya
          </label>
          <Input
            id="lastName"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Familiyangiz"
            autoComplete="family-name"
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm" htmlFor="password">
            Parol
          </label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="new-password"
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm" htmlFor="confirmPassword">
            Parolni tasdiqlang
          </label>
          <Input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="new-password"
            required
          />
        </div>
        {error && <div className="text-sm text-red-500">{error}</div>}
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Ro'yxatdan o'tilmoqda..." : "Ro'yxatdan o'tish"}
        </Button>
        <p className="text-sm text-center text-muted-foreground">
          Hisobingiz bormi?{" "}
          <Link to="/login" className="text-primary hover:underline">
            Kirish
          </Link>
        </p>
      </form>
    </div>
  );
}
