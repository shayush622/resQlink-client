"use client";

import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import clsx from "clsx";
import ThemeToggle from "@/components/themeToggle";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";

const navLinks = [
  { name: "Browse", href: "/browse" },
  { name: "Disasters", href: "/disasters" },
  { name: "Live Feed", href: "/live" },
];

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const isLoggedIn = !!session;

  return (
    <nav
      className="fixed top-0 left-0 w-full z-50 flex items-center justify-between px-6 py-4
        backdrop-blur-md bg-black/80 dark:bg-black/80 border-b border-white/10 
        text-white shadow-lg font-semibold text-base"
    >
      <div className="text-2xl font-bold tracking-wide text-white">
        <Link href="/">ResQLink</Link>
      </div>

      <div className="flex items-center space-x-4">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={clsx(
              "text-base font-bold transition-all duration-300 px-3 py-1 rounded-md",
              "hover:text-cyan-400 hover:shadow-md hover:shadow-cyan-500/50 hover:scale-105",
              pathname === link.href &&
                "text-cyan-400 underline underline-offset-4 shadow-md shadow-cyan-500/40"
            )}
          >
            {link.name}
          </Link>
        ))}

        {isLoggedIn ? (
          <>
            <Link
              href="/profile"
              className="text-base font-bold transition-all duration-300 px-3 py-1 rounded-md hover:text-cyan-400 hover:shadow-md hover:shadow-cyan-500/50 hover:scale-105"
            >
              Profile
            </Link>
            <Button
            variant="ghost"
            onClick={() => {
              toast.success("Logged out successfully");
              signOut({ callbackUrl: "http://localhost:3001" });
            }}
            className="text-white hover:text-red-400"
          >
            Logout
          </Button>
          </>
        ) : (
          <Link
            href="/login"
            className="text-base font-bold transition-all duration-300 px-3 py-1 rounded-md hover:text-cyan-400 hover:shadow-md hover:shadow-cyan-500/50 hover:scale-105"
          >
            Login
          </Link>
        )}

        <ThemeToggle />
      </div>
    </nav>
  );
}
