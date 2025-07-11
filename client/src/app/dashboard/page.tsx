'use client';

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") return <p>Loading...</p>;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold">Welcome, {session?.user?.email}!</h1>
      <p className="mt-2">This is your dashboard.</p>
    </div>
  );
}
