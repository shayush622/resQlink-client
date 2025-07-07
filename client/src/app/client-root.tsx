"use client";

import { useEffect } from "react";

export default function ClientRoot({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const theme = localStorage.getItem("theme");
    if (!theme) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.toggle("dark", theme === "dark");
    }
  }, []);

  return <>{children}</>;
}
