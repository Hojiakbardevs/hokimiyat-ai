import { useState } from "react";
import type { ReactNode } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { User, LogOut, Moon, Sun, Shield, HelpCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { type UserProfile } from "@/api/users";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface SettingsPopoverProps {
  children: ReactNode;
  userProfile?: UserProfile | null;
  theme?: string;
  onThemeChange?: (theme: string) => void;
}

export default function SettingsPopover({
  children,
  userProfile,
  theme = "light",
  onThemeChange,
}: SettingsPopoverProps) {
  const [open, setOpen] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  // Suppress unused variable warning - userProfile passed from parent
  void userProfile;

  const handleLogoutClick = () => {
    setOpen(false);
    setShowLogoutDialog(true);
  };

  const confirmLogout = async () => {
    await logout();
    navigate("/login");
    setShowLogoutDialog(false);
  };

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    onThemeChange?.(newTheme);
  };

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>{children}</PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="end" side="top">
          {/* Settings Options */}
          <div className="p-2">
            <button
              className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-accent transition-colors"
              onClick={() => {
                setOpen(false);
                navigate("/profile");
              }}>
              <User className="h-4 w-4" />
              <span>Profilni tahrirlash</span>
            </button>

            <button
              className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-accent transition-colors"
              onClick={toggleTheme}>
              {theme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
              <span>{theme === "dark" ? "Light mode" : "Dark mode"}</span>
            </button>

            <button
              className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-accent transition-colors"
              onClick={() => {
                setOpen(false);
                // Open privacy settings
              }}>
              <Shield className="h-4 w-4" />
              <span>Maxfiylik va xavfsizlik</span>
            </button>

            <button
              className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-accent transition-colors"
              onClick={() => {
                setOpen(false);
                window.open("https://t.me/alpha_development", "_blank");
              }}>
              <HelpCircle className="h-4 w-4" />
              <span>Yordam va xizmat</span>
            </button>
          </div>

          <Separator />

          {/* Logout Section */}
          <div className="p-2">
            <button
              className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
              onClick={handleLogoutClick}>
              <LogOut className="h-4 w-4" />
              <span>Chiqish</span>
            </button>
          </div>
        </PopoverContent>
      </Popover>

      {/* Logout Confirmation Dialog */}
      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Chiqib ketmoqchimisiz?</AlertDialogTitle>
            <AlertDialogDescription>
              Tizimdan chiqib ketishni tasdiqlaysizmi? Qayta kirish uchun login
              sahifasiga o'tasiz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Bekor qilish</AlertDialogCancel>
            <AlertDialogAction onClick={confirmLogout}>
              Ha, chiqish
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
