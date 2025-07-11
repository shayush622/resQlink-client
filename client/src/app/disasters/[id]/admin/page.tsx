"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import AdminDisasterForm from "../AdminDisasterForm";
import AdminReportModeration from "../AdminReportModeration";
import { Disaster, Report } from "@/types/disaster.types";

type Props = {
  params: { id: string };
};

export default function AdminPage({ params }: Props) {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [disaster, setDisaster] = useState<Disaster | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/login");
      return;
    }

    if (!session.user || session.user.role !== "admin") {
  router.push("/403");
  return;
}

    const fetchData = async () => {
      try {
        const disasterRes = await fetch(`/api/disasters/${params.id}`);
        const reportsRes = await fetch(`/api/disasters/${params.id}/reports?status=pending`);

        if (!disasterRes.ok || !reportsRes.ok) throw new Error("Failed to fetch data");

        const disasterData: Disaster = await disasterRes.json();
        const reportsData: Report[] = await reportsRes.json();

        setDisaster(disasterData);
        setReports(reportsData);
      } catch (err) {
        console.error("Error fetching admin data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [session, status]);

  if (status === "loading" || loading) {
    return <p className="pt-24 text-center">Loading...</p>;
  }

  return (
    <div className="pt-24 max-w-5xl mx-auto px-4 space-y-10">
      <h1 className="text-2xl font-bold">Admin Panel</h1>
      {disaster && <AdminDisasterForm disaster={disaster} />}
      <AdminReportModeration disasterId={params.id} reports={reports} />
    </div>
  );
}
