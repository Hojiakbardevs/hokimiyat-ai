import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getUserProfile, updateUserProfile } from "@/api/users";
import { type UserProfile } from "@/api/users";
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
import {
  ArrowLeft,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Camera,
} from "lucide-react";
import { toast } from "sonner";

export default function ProfilePage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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

  // Load user profile
  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await getUserProfile();
      setProfile(data);
      setFirstName(data.first_name || "");
      setLastName(data.last_name || "");

      // Load avatar from localStorage
      const savedAvatar = localStorage.getItem(`user-avatar-${data.id}`);
      if (savedAvatar) {
        setAvatarUrl(savedAvatar);
      }
    } catch (err: any) {
      setError("Profil ma'lumotlarini yuklashda xatolik");
      toast.error("Profil yuklanmadi");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!profile?.id) {
      setError("Profil ID topilmadi");
      return;
    }

    if (!firstName.trim() && !lastName.trim()) {
      setError("Kamida bitta maydonni to'ldiring");
      return;
    }

    try {
      setSaving(true);
      const updated = await updateUserProfile(profile.id, {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
      });
      setProfile(updated);
      setSuccess("Profil muvaffaqiyatli yangilandi!");
      toast.success("O'zgarishlar saqlandi");
    } catch (err: any) {
      setError(err.message || "Profilni yangilashda xatolik");
      toast.error("Saqlashda xatolik");
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Rasm hajmi 2MB dan oshmasligi kerak");
      return;
    }

    // Check file type
    if (!file.type.startsWith("image/")) {
      toast.error("Faqat rasm fayllari qo'llab-quvvatlanadi");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setAvatarUrl(base64String);

      // Save to localStorage
      if (profile?.id) {
        localStorage.setItem(`user-avatar-${profile.id}`, base64String);
        toast.success("Profil rasmi yangilandi");
      }
    };
    reader.readAsDataURL(file);
  };

  const removeAvatar = () => {
    setAvatarUrl(null);
    if (profile?.id) {
      localStorage.removeItem(`user-avatar-${profile.id}`);
      toast.success("Profil rasmi o'chirildi");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="mt-4 text-sm text-muted-foreground">Yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto flex items-center gap-4 px-4 py-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Orqaga
          </Button>
          <h1 className="text-xl font-semibold">Profilni tahrirlash</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto flex-1 px-4 py-8">
        <div className="mx-auto max-w-2xl">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-6">
                {/* Avatar with upload */}
                <div className="relative">
                  <div className="h-24 w-24 overflow-hidden rounded-full border-4 border-primary/20">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt="Profile"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="grid h-full w-full place-items-center bg-primary/10 text-2xl font-bold text-primary">
                        {profile?.first_name?.[0]?.toUpperCase() ||
                          profile?.last_name?.[0]?.toUpperCase() ||
                          "U"}
                        {profile?.last_name?.[0]?.toUpperCase() || ""}
                      </div>
                    )}
                  </div>
                  <label
                    htmlFor="avatar-upload"
                    className="absolute bottom-0 right-0 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-110">
                    <Camera className="h-4 w-4" />
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarChange}
                    />
                  </label>
                </div>
                <div className="flex-1">
                  <CardTitle>Shaxsiy ma'lumotlar</CardTitle>
                  <CardDescription>
                    Rasmingiz, ismingiz va familiyangizni tahrirlang
                  </CardDescription>
                  {avatarUrl && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={removeAvatar}
                      className="mt-2 h-8 text-xs text-destructive hover:text-destructive">
                      Rasmni o'chirish
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSave} className="space-y-6">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {success && (
                  <Alert className="border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200">
                    <CheckCircle2 className="h-4 w-4" />
                    <AlertDescription>{success}</AlertDescription>
                  </Alert>
                )}

                {/* Phone (read-only) */}
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefon raqami</Label>
                  <Input
                    id="phone"
                    type="text"
                    value={profile?.phone || ""}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">
                    Telefon raqamini o'zgartirib bo'lmaydi
                  </p>
                </div>

                {/* First Name */}
                <div className="space-y-2">
                  <Label htmlFor="firstName">Ism</Label>
                  <Input
                    id="firstName"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Ismingizni kiriting"
                    disabled={saving}
                  />
                </div>

                {/* Last Name */}
                <div className="space-y-2">
                  <Label htmlFor="lastName">Familiya</Label>
                  <Input
                    id="lastName"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Familiyangizni kiriting"
                    disabled={saving}
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end pt-4">
                  <Button type="submit" disabled={saving} className="gap-2">
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Saqlanmoqda...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Saqlash
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Additional Info */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-base">Hisob ma'lumotlari</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">ID:</span>
                <span className="font-medium">{profile?.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Yaratilgan:</span>
                <span className="font-medium">
                  {profile?.created_at
                    ? new Date(profile.created_at).toLocaleDateString("uz-UZ")
                    : "—"}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
