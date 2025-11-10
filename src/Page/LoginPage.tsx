// src/Page/LoginPage.tsx
import { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const { login, loading, error } = useAuth();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const location = useLocation() as any;
  const from = location.state?.from?.pathname || "/chat-assistant";

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await login({ phone, password });
    if (ok) navigate(from, { replace: true });
  };

  return (
    <div className="min-h-screen grid place-items-center bg-background text-foreground px-4">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm space-y-4 border border-border rounded-lg p-6 bg-card">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold">Kirish</h1>
          <p className="text-sm text-muted-foreground">Hisobingizga kiring</p>
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
          <label className="text-sm" htmlFor="password">
            Parol
          </label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
            required
          />
        </div>
        {error && <div className="text-sm text-red-500">{error}</div>}
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Kirilmoqda..." : "Kirish"}
        </Button>
        <p className="text-sm text-center text-muted-foreground">
          Hisobingiz yo'qmi?{" "}
          <Link to="/register" className="text-primary hover:underline">
            Ro'yxatdan o'tish
          </Link>
        </p>
      </form>
    </div>
  );
}
