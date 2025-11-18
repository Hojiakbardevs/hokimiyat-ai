import { useState } from "react";
import type { ReactNode } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import {
  User,
  LogOut,
  Moon,
  Sun,
  Globe,
  Bell,
  Shield,
  HelpCircle,
} from "lucide-react";
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

  const getUserInitials = () => {
    if (!userProfile) return "??";

    const firstName = userProfile.first_name || "";
    const lastName = userProfile.last_name || "";

    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }

    if (firstName) {
      return firstName.substring(0, 2).toUpperCase();
    }

    if (lastName) {
      return lastName.substring(0, 2).toUpperCase();
    }

    return "??";
  };

  const getUserFullName = () => {
    if (!userProfile) return "Loading...";

    const firstName = userProfile.first_name || "";
    const lastName = userProfile.last_name || "";

    if (firstName && lastName) {
      return `${firstName} ${lastName}`;
    }

    if (firstName) return firstName;
    if (lastName) return lastName;
    if (userProfile.phone) return userProfile.phone;

    return "User";
  };

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
          {/* User Profile Section */}
          <div className="p-4">
            <div className="flex items-center gap-3">
              <div className="user-avatar grid h-12 w-12 place-items-center rounded-full text-sm font-bold">
                {getUserInitials()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm truncate">
                  {getUserFullName()}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  {userProfile?.phone || "No phone"}
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Settings Options */}
          <div className="p-2">
            <button
              className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-accent transition-colors"
              onClick={() => {
                setOpen(false);
                // Navigate to profile settings
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
                // Open language settings
              }}>
              <Globe className="h-4 w-4" />
              <span>Til / Language</span>
            </button>

            <button
              className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-accent transition-colors"
              onClick={() => {
                setOpen(false);
                // Open notifications settings
              }}>
              <Bell className="h-4 w-4" />
              <span>Bildirishnomalar</span>
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
                // Open help
              }}>
              <HelpCircle className="h-4 w-4" />
              <span>Yordam</span>
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
