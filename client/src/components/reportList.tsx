'use client';

import { useEffect, useState } from "react";

interface Report {
  id: string;
  user_id: string;
  content: string;
  image_url: string | null;
  verification_status: string;
  created_at: string;
}

export default function ReportList({ disasterId }: { disasterId: string }) {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReports() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/disasters/${disasterId}/reports`);
        const data = await res.json();
        setReports(data);
      } catch (err) {
        console.error("Failed to load reports:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchReports();
  }, [disasterId]);

  if (loading) return <p>Loading reports...</p>;

  return (
    <div className="mt-10 space-y-4">
      <h2 className="text-2xl font-bold">Reports</h2>
      {reports.length === 0 && <p>No reports yet.</p>}
      {reports.map((report) => (
        <div key={report.id} className="border p-4 rounded-xl shadow-sm">
          <p className="text-sm">{report.content}</p>
          {report.image_url && (
            <img src={report.image_url} alt="Report Image" className="mt-2 rounded-md max-h-60 object-cover" />
          )}
          <p className="text-xs mt-2 text-muted-foreground">
            Status: {report.verification_status} | Submitted by {report.user_id} on{" "}
            {new Date(report.created_at).toLocaleString()}
          </p>
        </div>
      ))}
    </div>
  );
}
