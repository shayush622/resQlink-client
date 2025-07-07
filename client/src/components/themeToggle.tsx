"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    const stored = localStorage.getItem("theme") as "light" | "dark" | null;
    const preferred = stored ?? "dark";

    setTheme(preferred);
    document.documentElement.classList.toggle("dark", preferred === "dark");
    if (!stored) localStorage.setItem("theme", "dark");
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full border border-neutral-400 dark:border-neutral-700 
        hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors duration-200
        flex items-center justify-center"
      aria-label="Toggle Theme"
    >
      <span
        key={theme}
        className="transition-all duration-300 ease-in-out animate-fade-in-out"
      >
        {theme === "dark" ? (
          <Sun className="w-5 h-5 text-yellow-500 rotate-0 scale-100 transition-transform duration-300" />
        ) : (
          <Moon className="w-5 h-5 text-blue-600 rotate-180 scale-100 transition-transform duration-300" />
        )}
      </span>
    </button>
  );
}
