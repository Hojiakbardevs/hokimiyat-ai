import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-white dark:bg-zinc-900">
      <div className="text-center">
        <h1 className="mb-4 text-6xl font-bold text-zinc-900 dark:text-zinc-100">404</h1>
        <p className="mb-6 text-xl text-zinc-600 dark:text-zinc-400">Oops! Sahifa topilmadi</p>
        <button
          onClick={() => navigate("/")}
          className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-6 py-3 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200">
          <Home className="h-4 w-4" />
          Bosh sahifaga qaytish
        </button>
      </div>
    </div>
  );
};

export default NotFound;
