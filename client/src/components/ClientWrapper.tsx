"use client";

import Navbar from "./navbar";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "react-hot-toast";

export default function ClientWrapper({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <Toaster position="top-right" />
      <Navbar />
      {children}
    </SessionProvider>
  );
}
